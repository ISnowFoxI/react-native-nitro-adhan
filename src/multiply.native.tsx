import { NitroModules } from 'react-native-nitro-modules';
import type { NitroAdhan } from './NitroAdhan.nitro';

const NitroAdhanHybridObject =
  NitroModules.createHybridObject<NitroAdhan>('NitroAdhan');

export function multiply(a: number, b: number): number {
  return NitroAdhanHybridObject.multiply(a, b);
}
