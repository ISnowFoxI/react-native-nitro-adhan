# react-native-nitro-adhan

Fast, synchronous Islamic prayer times for React Native, built on [Nitro Modules](https://nitro.margelo.com/).

All calculations run natively using the official [Adhan](https://github.com/batoulapps/adhan-swift) libraries:

- **iOS**: [adhan-swift](https://github.com/batoulapps/adhan-swift) (via Swift Package Manager)
- **Android**: [adhan-kotlin](https://github.com/batoulapps/adhan-kotlin) (`com.batoulapps.adhan:adhan2`)

## Features

- Prayer times (Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha) for any location and day
- All preset calculation methods, with per-field overrides and minute adjustments
- Current / next prayer
- Sunnah times: middle and last third of the night
- Duha window
- Qibla direction
- Multi-day schedule as one sorted list (handy for widgets and notifications)

## Installation

```sh
npm install react-native-nitro-adhan react-native-nitro-modules
# or
yarn add react-native-nitro-adhan react-native-nitro-modules
```

> `react-native-nitro-modules` is required as this library relies on [Nitro Modules](https://nitro.margelo.com/).

### iOS

```sh
cd ios && pod install
```

`adhan-swift` is pulled in automatically through Swift Package Manager.

### Android

`minSdkVersion` 24 or higher. `adhan-kotlin` uses `java.time`, so your app must enable core library desugaring in `android/app/build.gradle`:

```gradle
android {
  compileOptions {
    coreLibraryDesugaringEnabled true
  }
}

dependencies {
  coreLibraryDesugaring("com.android.tools:desugar_jdk_libs:2.1.5")
}
```

## Usage

```ts
import {
  PrayerTimes,
  SunnahTimes,
  getCalculationParameters,
  getDuhaTimes,
  qibla,
} from 'react-native-nitro-adhan';

const coordinates = { latitude: 21.4225, longitude: 39.8262 };
const params = getCalculationParameters('ummAlQura');

const times = new PrayerTimes(coordinates, new Date(), params);

times.fajr; // Date
times.maghrib; // Date
times.currentPrayer(); // 'dhuhr' | ... | undefined
times.nextPrayer(); // 'asr' | ... | undefined
times.timeForPrayer('isha'); // Date

const sunnah = new SunnahTimes(times);
sunnah.middleOfTheNight; // Date
sunnah.lastThirdOfTheNight; // Date

const duha = getDuhaTimes(times); // { start: Date, end: Date }

qibla(coordinates); // degrees from true North
```

### Dates and time zones

`date` is a calendar day. Pass either a JS `Date` (converted using the **device's** local time zone) or `{ year, month, day }` with a 1-based month. Returned times are absolute `Date`s — format them in the location's time zone for display:

```ts
times.fajr.toLocaleTimeString('en-US', { timeZone: 'Asia/Riyadh' });
```

### Calculation parameters

`getCalculationParameters(method, overrides?)` returns the preset for a method. Overrides are merged, and `adjustments` is merged with the preset's own adjustments:

```ts
const params = getCalculationParameters('muslimWorldLeague', {
  madhab: 'hanafi',
  highLatitudeRule: 'seventhOfTheNight',
  adjustments: { fajr: 2, isha: -1 },
});
```

| Field              | Type                                                         | Notes                                                       |
| ------------------ | ------------------------------------------------------------ | ----------------------------------------------------------- |
| `method`           | `CalculationMethod`                                          |                                                             |
| `fajrAngle`        | `number`                                                     | Sun angle for Fajr                                          |
| `ishaAngle`        | `number`                                                     | Sun angle for Isha                                          |
| `ishaInterval`     | `number`                                                     | Minutes after Maghrib. When > 0, `ishaAngle` is ignored     |
| `maghribAngle`     | `number?`                                                    | iOS only (see [Platform differences](#platform-differences)) |
| `madhab`           | `'shafi' \| 'hanafi'`                                        | Asr calculation. `shafi` also covers Maliki, Hanbali, Jafari |
| `highLatitudeRule` | `'middleOfTheNight' \| 'seventhOfTheNight' \| 'twilightAngle'` | When omitted, the recommended rule for the location is used |
| `adjustments`      | `PrayerAdjustments`                                          | Minutes added to each prayer                                |
| `rounding`         | `'nearest' \| 'up' \| 'none'`                                |                                                             |
| `shafaq`           | `'general' \| 'ahmer' \| 'abyad'`                            | Used by `moonsightingCommittee` for Isha                    |

Available methods:

`muslimWorldLeague`, `egyptian`, `karachi`, `ummAlQura`, `dubai`, `moonsightingCommittee`, `northAmerica`, `kuwait`, `qatar`, `singapore`, `tehran`, `turkey`, `other`

`recommendedHighLatitudeRule(coordinates)` returns `seventhOfTheNight` above 48° latitude and `middleOfTheNight` otherwise.

### Duha

The Duha window starts a fixed number of minutes after sunrise and ends before Dhuhr (defaults: 25 and 15):

```ts
getDuhaTimes(times, { afterSunriseMinutes: 20, beforeDhuhrMinutes: 10 });
```

Throws if the offsets leave no window.

### Prayer schedule

`getPrayerSchedule` returns every event for several days as one list sorted by time — useful for scheduling notifications or building widget timelines:

```ts
import { getPrayerSchedule } from 'react-native-nitro-adhan';

const schedule = getPrayerSchedule(coordinates, params, {
  startDate: new Date(), // default: today
  days: 7, // default: 7
  duha: {}, // Duha offsets, or `false` to leave Duha out
  includeNightTimes: true, // middleOfTheNight / lastThirdOfTheNight, default: false
});

// [{ event: 'fajr', time: Date, timestamp: 1763690000000, day: { year, month, day } }, ...]
```

`event` is a `Prayer` or one of `'duhaStart'`, `'duhaEnd'`, `'middleOfTheNight'`, `'lastThirdOfTheNight'`. `timestamp` is epoch ms, safe to serialize.

## API

| Export                                               | Description                                                   |
| ---------------------------------------------------- | ------------------------------------------------------------- |
| `new PrayerTimes(coordinates, date, params)`         | Prayer times for a day. Throws if they can't be calculated    |
| `prayerTimes.currentPrayer(at?)`                     | Prayer that most recently started, `undefined` before Fajr    |
| `prayerTimes.nextPrayer(at?)`                        | Next prayer to start, `undefined` after Isha                  |
| `prayerTimes.timeForPrayer(prayer)`                  | `Date` for a given prayer                                     |
| `new SunnahTimes(prayerTimes)`                       | Middle and last third of the night                            |
| `getDuhaTimes(prayerTimes, options?)`                | Duha `{ start, end }`                                         |
| `getPrayerSchedule(coordinates, params, options?)`   | Sorted multi-day list of events                               |
| `getCalculationParameters(method, overrides?)`       | Preset parameters for a method                                |
| `recommendedHighLatitudeRule(coordinates)`           | Recommended high-latitude rule for a location                 |
| `qibla(coordinates)`                                 | Qibla heading in degrees from true North                      |

All functions are synchronous. Invalid coordinates or dates throw a `RangeError`.

## Platform differences

- **`maghribAngle`** (used by the `tehran` method) is not implemented by adhan-kotlin. On Android it is ignored, Maghrib is calculated at sunset, and a one-time warning is logged.
- Native modules only — calling the API on web throws.

## Example app

The [example](example) app shows prayer, Sunnah and Duha times plus the Qibla for your current location:

```sh
yarn
yarn example ios     # or: yarn example android
```

## Contributing

- [Development workflow](CONTRIBUTING.md#development-workflow)
- [Sending a pull request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of conduct](CODE_OF_CONDUCT.md)

## Credits

Prayer time calculations by [Batoul Apps' Adhan](https://github.com/batoulapps) libraries.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
