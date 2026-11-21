import { NitroModules } from 'react-native-nitro-modules';
import type { NitroAdhan } from './NitroAdhan.nitro';

let instance: NitroAdhan | undefined;

export function getNitroAdhan(): NitroAdhan {
  instance ??= NitroModules.createHybridObject<NitroAdhan>('NitroAdhan');
  return instance;
}
