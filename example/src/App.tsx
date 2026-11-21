import { useMemo } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  PrayerTimes,
  SunnahTimes,
  getDuhaTimes,
  getCalculationParameters,
  qibla,
  recommendedHighLatitudeRule,
  type Coordinates,
  type Prayer,
} from 'react-native-nitro-adhan';
import { useLocation } from './useLocation';

const PRAYERS: Prayer[] = [
  'fajr',
  'sunrise',
  'dhuhr',
  'asr',
  'maghrib',
  'isha',
];

const params = getCalculationParameters('muslimWorldLeague');

const format = (date: Date) =>
  date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export default function App() {
  const { state, retry } = useLocation();

  return (
    <View style={styles.screen}>
      {state.status === 'loading' && (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.muted}>Getting your location…</Text>
        </View>
      )}
      {state.status === 'denied' && (
        <Message
          title="Location access needed"
          body="Prayer times and the Qibla direction depend on where you are. Allow location access for this app in Settings."
          action="Open Settings"
          onPress={() => Linking.openSettings()}
        />
      )}
      {state.status === 'error' && (
        <Message
          title="Couldn't get your location"
          body={state.message}
          action="Try again"
          onPress={retry}
        />
      )}
      {state.status === 'ready' && (
        <PrayerTimesView coordinates={state.coordinates} />
      )}
    </View>
  );
}

function Message(props: {
  title: string;
  body: string;
  action: string;
  onPress: () => void;
}) {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>{props.title}</Text>
      <Text style={[styles.muted, styles.centerText]}>{props.body}</Text>
      <Pressable style={styles.button} onPress={props.onPress}>
        <Text style={styles.buttonText}>{props.action}</Text>
      </Pressable>
    </View>
  );
}

function PrayerTimesView({ coordinates }: { coordinates: Coordinates }) {
  const { prayerTimes, sunnahTimes, duha } = useMemo(() => {
    const times = new PrayerTimes(coordinates, new Date(), params);
    return {
      prayerTimes: times,
      sunnahTimes: new SunnahTimes(times),
      duha: getDuhaTimes(times),
    };
  }, [coordinates]);

  const current = prayerTimes.currentPrayer();
  const next = prayerTimes.nextPrayer();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Prayer times</Text>
      <Text style={styles.muted}>
        {coordinates.latitude.toFixed(4)}, {coordinates.longitude.toFixed(4)}
      </Text>
      {PRAYERS.map((prayer) => (
        <View key={prayer} style={styles.row}>
          <Text style={prayer === current ? styles.current : undefined}>
            {prayer}
          </Text>
          <Text>{format(prayerTimes.timeForPrayer(prayer))}</Text>
        </View>
      ))}
      <Text style={styles.title}>Sunnah times</Text>
      <View style={styles.row}>
        <Text>Duha</Text>
        <Text>
          {format(duha.start)} – {format(duha.end)}
        </Text>
      </View>
      <View style={styles.row}>
        <Text>Middle of the night</Text>
        <Text>{format(sunnahTimes.middleOfTheNight)}</Text>
      </View>
      <View style={styles.row}>
        <Text>Last third of the night</Text>
        <Text>{format(sunnahTimes.lastThirdOfTheNight)}</Text>
      </View>
      <Text style={styles.title}>Other</Text>
      <Text>Current: {current ?? 'none'}</Text>
      <Text>Next: {next ?? 'none'}</Text>
      <Text>Qibla: {qibla(coordinates).toFixed(2)}°</Text>
      <Text>
        High latitude rule: {recommendedHighLatitudeRule(coordinates)}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Explicit light background: default black text is unreadable on Android's dark theme.
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  centerText: {
    textAlign: 'center',
  },
  container: {
    padding: 24,
    paddingTop: 80,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  muted: {
    color: '#666',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  current: {
    fontWeight: '700',
  },
  button: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#0a7d5a',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
