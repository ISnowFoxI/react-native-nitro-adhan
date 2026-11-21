import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import {
  checkPermission,
  getCurrentPosition,
  requestPermission,
  setConfiguration,
} from 'react-native-nitro-geolocation';
import type { Coordinates } from 'react-native-nitro-adhan';

setConfiguration({ authorizationLevel: 'whenInUse', locationProvider: 'auto' });

export type LocationState =
  | { status: 'loading' }
  | { status: 'denied' }
  | { status: 'error'; message: string }
  | { status: 'ready'; coordinates: Coordinates };

/**
 * Resolves the device location for prayer times.
 *
 * Prompts once when permission is undetermined. When it's denied, the caller
 * should send the user to Settings; the permission is re-checked every time
 * the app returns to the foreground.
 */
export function useLocation() {
  const [state, setState] = useState<LocationState>({ status: 'loading' });
  const isReady = useRef(false);

  const resolve = useCallback(async (prompt: boolean) => {
    try {
      let permission = await checkPermission();
      if (permission === 'undetermined' && prompt) {
        permission = await requestPermission();
      }
      if (permission !== 'granted') {
        setState({ status: 'denied' });
        return;
      }

      setState({ status: 'loading' });
      // City-level accuracy is plenty for prayer times; accept a recent fix.
      // Android 'balanced' only uses the network provider, which is often
      // disabled (emulators, devices without Wi-Fi scanning), so use 'high'.
      const position = await getCurrentPosition({
        accuracy: { android: 'high', ios: 'kilometer' },
        maximumAge: 10 * 60 * 1000,
        timeout: 15_000,
      });
      isReady.current = true;
      setState({
        status: 'ready',
        coordinates: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
      });
    } catch (e) {
      setState({ status: 'error', message: errorMessage(e) });
    }
  }, []);

  useEffect(() => {
    resolve(true);
    const subscription = AppState.addEventListener('change', (appState) => {
      // Coming back from Settings: pick up a newly granted permission.
      if (appState === 'active' && !isReady.current) {
        resolve(false);
      }
    });
    return () => subscription.remove();
  }, [resolve]);

  const retry = useCallback(() => resolve(true), [resolve]);

  return { state, retry };
}

/** nitro-geolocation rejects with a plain `{ code, message }` object, not an Error. */
function errorMessage(e: unknown): string {
  if (typeof e === 'object' && e !== null && 'message' in e) {
    return String(e.message);
  }
  return String(e);
}
