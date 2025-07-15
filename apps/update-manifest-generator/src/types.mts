import * as v from 'valibot';

export const ChannelNameSchema = v.pipe(v.string(), v.minLength(1), v.brand('ChannelName'));
export type ChannelName = v.InferOutput<typeof ChannelNameSchema>;

export const VersionSchema = v.pipe(v.string(), v.minLength(1), v.brand('Version'));
export type Version = v.InferOutput<typeof VersionSchema>;

export const UpdateManifestChannelVersionBuildSchema = v.object({
  url: v.pipe(v.string(), v.url()),
  run: v.pipe(v.array(v.string()))
});
export type UpdateManifestChannelVersionBuild = v.InferOutput<typeof UpdateManifestChannelVersionBuildSchema>;

export const UpdateManifestChannelVersionSchema = v.object({
  release_notes: v.string(),
  builds: v.pipe(v.record(v.string(), v.record(v.string(), UpdateManifestChannelVersionBuildSchema)))
});
export type UpdateManifestChannelVersion = v.InferOutput<typeof UpdateManifestChannelVersionSchema>;

export const UpdateManifestChannelSchema = v.object({
  description: v.optional(v.pipe(v.string(), v.minLength(1))),
  current_version: VersionSchema,
  versions: v.pipe(v.record(v.string(), UpdateManifestChannelVersionSchema))
});
export type UpdateManifestChannel = v.InferOutput<typeof UpdateManifestChannelSchema>;

export const UpdateManifestSchema = v.object({
  default_channel: ChannelNameSchema,
  channels: v.pipe(v.record(v.string(), UpdateManifestChannelSchema))
});
export type UpdateManifest = v.InferOutput<typeof UpdateManifestSchema>;
export const parseUpdateManifest = (data: string): v.InferOutput<typeof UpdateManifestSchema> =>
  v.parse(UpdateManifestSchema, data);

export const UpdateConfigSchema = v.object({
  channel: v.object({
    name: ChannelNameSchema,
    description: v.optional(v.pipe(v.string(), v.minLength(1)))
  }),
  overrides: v.record(v.string(), v.record(v.string(), UpdateManifestChannelVersionBuildSchema))
});
export type UpdateConfig = v.InferOutput<typeof UpdateConfigSchema>;
export const parseUpdateConfig = (data: string): v.InferOutput<typeof UpdateConfigSchema> =>
  v.parse(UpdateConfigSchema, data);
