import { Octokit } from '@octokit/rest';
import {
  type ChannelName,
  parseUpdateConfig,
  type UpdateConfig,
  type UpdateManifest,
  type UpdateManifestChannel,
  type UpdateManifestChannelVersion,
  type UpdateManifestChannelVersionBuild,
  type Version
} from '@slimevr/update-manifest-shared';
import * as fs from 'node:fs';
import { parse as parseSemver, SemVer } from 'semver';
import { fetchAllReleases, GitHubRelease } from './github.mts';
import { asyncMap } from './utils.mts';

const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY;
if (!GITHUB_REPOSITORY) {
  console.error('GITHUB_REPOSITORY is not set.');
  process.exit(1);
}

const [GITHUB_OWNER, GITHUB_REPO] = GITHUB_REPOSITORY.split('/');
if (!GITHUB_OWNER || !GITHUB_REPO) {
  console.error('GITHUB_REPOSITORY must be in the format "owner/repo".');
  process.exit(1);
}

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

const DEFAULT_CHANNEL = 'stable' as ChannelName;
const LATEST_WEB_INSTALLER =
  'https://github.com/SlimeVR/SlimeVR-Installer/releases/latest/download/slimevr_web_installer.exe';
const WINDOWS_X86_64_ZIP_FILENAME = 'SlimeVR-win64.zip';
const UPDATE_CONFIG_FILENAME = 'update-config.json';
const INVALID_VERSION = 'v0.0.0-invalid' as Version;
const NEWEST_UNSUPPORTED_VERSION = new SemVer('0.12.0');

const STABLE_CHANNEL: UpdateConfig = {
  channel: {
    name: DEFAULT_CHANNEL,
    description: 'Our official stable releases'
  },
  overrides: {
    windows: {
      x86_64: {
        url: LATEST_WEB_INSTALLER,
        run: ['$_BINARY_$', '--version', '$VERSION$']
      }
    }
  }
};

const UPDATE_MANIFEST_FILE = 'update-manifest.json';

let updateManifest: UpdateManifest = {
  default_channel: DEFAULT_CHANNEL,
  channels: {}
};

const releases = await fetchAllReleases(octokit, GITHUB_OWNER, GITHUB_REPO)
  .then(asyncMap(parseRelease))
  .then((results) =>
    results.filter((r): r is [ChannelName, SemVer, Version, UpdateManifestChannelVersion, UpdateConfig] => r !== null)
  );
releases.sort(([_1, a], [_2, b]) => a.compare(b));

const releasesByChannel = Object.groupBy(releases, ([channel]) => channel);
for (const [channelName, releases] of Object.entries(releasesByChannel)) {
  if (!releases) continue;

  const channel: UpdateManifestChannel = {
    description: undefined,
    current_version: INVALID_VERSION,
    versions: {}
  };

  console.log(`Processing channel: ${channelName}`);

  for (const [_, version, tag, v, config] of releases) {
    if (v.release_notes) {
      console.log(`Release ${version} (${tag}) has release notes.`);
    } else {
      console.warn(`Release ${version} (${tag}) has no release notes.`);
    }

    if (version.prerelease.length === 0) {
      channel.current_version = tag;
      if (config.channel.description) {
        channel.description = config.channel.description;
      }
    }

    channel.versions[tag] = v;
  }

  updateManifest.channels[channelName] = channel;
}

fs.writeFileSync(UPDATE_MANIFEST_FILE, JSON.stringify(updateManifest, null, 2));

async function parseRelease(
  release: GitHubRelease
): Promise<[ChannelName, SemVer, Version, UpdateManifestChannelVersion, UpdateConfig] | null> {
  const tag = release.tag_name;
  const version = parseSemver(tag);
  if (!version) {
    console.error(`Invalid version format in release data: ${tag}`);
    process.exit(1);
  }

  if (version.compare(NEWEST_UNSUPPORTED_VERSION) <= 0) {
    console.warn(`Skipping unsupported version: ${version}`);
    return null;
  }

  let config: UpdateConfig = STABLE_CHANNEL;
  const releasedUpdateConfig = release.assets.find((asset) => asset.name === UPDATE_CONFIG_FILENAME);
  if (releasedUpdateConfig) {
    const res = await fetch(releasedUpdateConfig.browser_download_url);
    if (!res.ok) {
      console.error(`Failed to fetch update config for release ${version}: ${res.status} ${res.statusText}`);
      process.exit(1);
    }

    const rawNewConfig = await res.text();
    config = parseUpdateConfig(rawNewConfig);
  }

  const channel = config.channel.name;

  const builds: Record<string, Record<string, UpdateManifestChannelVersionBuild>> = {};

  const windowsx8664ZIP = release.assets.find((asset) => asset.name === WINDOWS_X86_64_ZIP_FILENAME);
  if (windowsx8664ZIP) {
    builds.windows = {
      x86_64: {
        url: windowsx8664ZIP?.browser_download_url,
        run: ['$_BINARY_$']
      }
    };
  }

  for (const [platform, architectures] of Object.entries(builds)) {
    for (const [arch, build] of Object.entries(architectures)) {
      if (config.overrides && config.overrides[platform] && config.overrides[platform][arch]) {
        builds[platform][arch] = {
          ...build,
          ...config.overrides[platform][arch]
        };
      }
    }
  }

  for (const [platform, architectures] of Object.entries(builds)) {
    for (const [arch, build] of Object.entries(architectures)) {
      builds[platform][arch] = {
        url: build.url.replace('$VERSION$', version.toString()),
        run: build.run.map((arg) => arg.replaceAll('$VERSION$', version.toString()))
      };
    }
  }

  const v: UpdateManifestChannelVersion = {
    release_notes: release.body || '',
    builds
  };

  return [channel, version, tag as Version, v, config];
}
