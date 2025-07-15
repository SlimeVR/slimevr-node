import { type Octokit, type RestEndpointMethodTypes } from '@octokit/rest';
import * as timers from 'node:timers/promises';

export type GitHubRelease = RestEndpointMethodTypes['repos']['listReleases']['response']['data'][number];

/**
 * Fetch all releases from GitHub, handling pagination and 429s.
 * @returns {Promise<GitHubReleaseResponse[]>}
 */
export async function fetchAllReleases(octokit: Octokit, owner: string, repo: string): Promise<GitHubRelease[]> {
  let page = 1;
  const perPage = 100;
  let allReleases: GitHubRelease[] = [];
  let hasMore = true;

  while (hasMore) {
    let releases;
    let retries = 0;
    while (true) {
      try {
        const res = await octokit.repos.listReleases({
          owner,
          repo,
          per_page: perPage,
          page
        });
        releases = res.data;

        break;
      } catch (err: any) {
        if (err.status === 429) {
          const retryAfter = parseInt(err.response?.headers['retry-after'] || '5', 10);
          console.warn(`Rate limited by GitHub API. Retrying after ${retryAfter} seconds...`);
          await timers.setTimeout(retryAfter * 1000);
          retries++;
          if (retries > 5) {
            console.error('Too many retries after 429.');
            process.exit(1);
          }
          continue;
        }
        console.error(`Failed to fetch releases data: ${err.status} ${err.message}`);
        process.exit(1);
      }
    }

    if (!Array.isArray(releases)) {
      console.error('Invalid releases data received from GitHub API.');
      process.exit(1);
    }
    allReleases = allReleases.concat(releases);

    hasMore = releases.length === perPage;
    page++;
  }

  if (allReleases.length === 0) {
    console.error('No releases data received from GitHub API.');
    process.exit(1);
  }

  return allReleases;
}
