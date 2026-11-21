import type { NitroAdhan } from './NitroAdhan.nitro';

export function getNitroAdhan(): NitroAdhan {
  throw new Error(
    "'react-native-nitro-adhan' is only supported on native platforms."
  );
}
