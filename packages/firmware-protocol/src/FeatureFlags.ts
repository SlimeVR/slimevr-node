export const makeFeatureFlagContainer = <T extends Record<string, number>>(available: T) => {
  const allFlags = Object.entries<number>(available) as [keyof T, number][];

  return class {
    static unpack(packed: Buffer) {
      const flags = new Map<keyof T, boolean>();

      for (const [key, position] of allFlags) {
        const posInPacked = Math.floor(position / 8);
        const posInByte = position % 8;

        const flag = packed[posInPacked] & (1 << posInByte);
        const enabled = flag != 0;

        flags.set(key, enabled);
      }

      return new this(flags);
    }

    readonly #flags?: Map<keyof T, boolean>;

    constructor(flags?: Map<keyof T, boolean>) {
      this.#flags = flags;
    }

    get isAvailable() {
      return !!this.#flags;
    }

    pack() {
      const packed = Buffer.alloc(Object.keys(available).length / 8 + 1);

      for (const position of Array.from(this.#flags?.entries() ?? [])
        .filter(([_, v]) => v)
        .map(([k]) => available[k])) {
        const posInPacked = Math.floor(position / 8);
        const posInByte = position % 8;

        packed[posInPacked] |= 1 << posInByte;
      }

      return packed;
    }

    has(flag: keyof T) {
      return this.#flags?.get(flag) ?? false;
    }

    getAllEnabled() {
      return Array.from(this.#flags?.entries() ?? [])
        .filter(([_, v]) => v)
        .map(([key]) => key);
    }
  };
};

export const AVAILABLE_SERVER_FEATURE_FLAGS = {
  PROTOCOL_BUNDLE_SUPPORT: 0
} as const;
export type ServerFeatureFlag = keyof typeof AVAILABLE_SERVER_FEATURE_FLAGS;
export const ServerFeatureFlags = makeFeatureFlagContainer(AVAILABLE_SERVER_FEATURE_FLAGS);
export type ServerFeatureFlags = ReturnType<(typeof ServerFeatureFlags)['unpack']>;

export const AVAILABLE_FIRMWARE_FEATURE_FLAGS = {
  // The tracker sends all information that firmware 0.3.3 and below sends
  LEGACY_SLIMEVR_TRACKER: 0,
  // The tracker sends rotation data
  ROTATION_DATA: 1,
  // The tracker sends position data
  POSITION_DATA: 2
} as const;
export type FirmwareFeatureFlag = keyof typeof AVAILABLE_FIRMWARE_FEATURE_FLAGS;
export const FirmwareFeatureFlags = makeFeatureFlagContainer(AVAILABLE_FIRMWARE_FEATURE_FLAGS);
export type FirmwareFeatureFlags = ReturnType<(typeof FirmwareFeatureFlags)['unpack']>;
