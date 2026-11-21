import type { HybridObject } from 'react-native-nitro-modules';

type Platforms = { ios: 'swift'; android: 'kotlin' };

/** Preset calculation methods. */
export type CalculationMethod =
  | 'muslimWorldLeague'
  | 'egyptian'
  | 'karachi'
  | 'ummAlQura'
  | 'dubai'
  | 'moonsightingCommittee'
  | 'northAmerica'
  | 'kuwait'
  | 'qatar'
  | 'singapore'
  | 'tehran'
  | 'turkey'
  | 'other';

/** Madhab used to calculate Asr. `shafi` also covers Maliki, Hanbali and Jafari. */
export type Madhab = 'shafi' | 'hanafi';

/** Rule for approximating Fajr and Isha at high latitudes. */
export type HighLatitudeRule =
  'middleOfTheNight' | 'seventhOfTheNight' | 'twilightAngle';

/** How calculated times are rounded to the minute. */
export type Rounding = 'nearest' | 'up' | 'none';

/** Twilight definition, used by the `moonsightingCommittee` method for Isha. */
export type Shafaq = 'general' | 'ahmer' | 'abyad';

export type Prayer = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/** A calendar day. `month` is 1-based (1 = January). */
export interface DateComponents {
  year: number;
  month: number;
  day: number;
}

/** Offsets in minutes added to each calculated prayer time. */
export interface PrayerAdjustments {
  fajr: number;
  sunrise: number;
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
}

/**
 * Parameters for calculating prayer times.
 * Preset method-specific adjustments are derived from `method` natively.
 */
export interface CalculationParameters {
  method: CalculationMethod;
  fajrAngle: number;
  /** Sun angle for Maghrib. iOS only: ignored on Android (Maghrib = sunset). */
  maghribAngle?: number;
  ishaAngle: number;
  /** Minutes after Maghrib for Isha. When > 0, `ishaAngle` is ignored. */
  ishaInterval: number;
  madhab: Madhab;
  /** When undefined, the recommended rule for the coordinates is used. */
  highLatitudeRule?: HighLatitudeRule;
  adjustments: PrayerAdjustments;
  rounding: Rounding;
  shafaq: Shafaq;
}

export interface DuhaOptions {
  /** Minutes after sunrise when Duha starts. Default: 25. */
  afterSunriseMinutes?: number;
  /** Minutes before Dhuhr when Duha ends. Default: 15. */
  beforeDhuhrMinutes?: number;
}

/** Duha window. Times are Unix epoch milliseconds (UTC). */
export interface DuhaWindow {
  start: number;
  end: number;
}

/** Prayer times for a location and date. All times are Unix epoch milliseconds (UTC). */
export interface PrayerTimes extends HybridObject<Platforms> {
  readonly fajr: number;
  readonly sunrise: number;
  readonly dhuhr: number;
  readonly asr: number;
  readonly maghrib: number;
  readonly isha: number;

  readonly coordinates: Coordinates;
  readonly date: DateComponents;
  readonly calculationParameters: CalculationParameters;

  /** Prayer whose time has most recently started, or undefined before Fajr. Defaults to now. */
  currentPrayer(at?: number): Prayer | undefined;
  /** Next prayer to start, or undefined after Isha. Defaults to now. */
  nextPrayer(at?: number): Prayer | undefined;
  timeForPrayer(prayer: Prayer): number;
  /** Duha window from sunrise/Dhuhr offsets. Throws if the offsets leave no window. */
  getDuhaTimes(options?: DuhaOptions): DuhaWindow;
}

export interface SunnahTimes extends HybridObject<Platforms> {
  /** Midpoint between Maghrib and the next day's Fajr. */
  readonly middleOfTheNight: number;
  /** Start of the last third of the night between Maghrib and the next day's Fajr. */
  readonly lastThirdOfTheNight: number;
}

export interface NitroAdhan extends HybridObject<Platforms> {
  getCalculationParameters(
    calculationMethod: CalculationMethod
  ): CalculationParameters;
  recommendedHighLatitudeRule(coordinates: Coordinates): HighLatitudeRule;
  /** Throws when the times can't be calculated (e.g. extreme latitudes). */
  createPrayerTimes(
    coordinates: Coordinates,
    date: DateComponents,
    parameters: CalculationParameters
  ): PrayerTimes;
  /** Throws when the next day's prayer times can't be calculated. */
  createSunnahTimes(prayerTimes: PrayerTimes): SunnahTimes;
  /** Heading to the Qibla in degrees from true North. */
  qibla(coordinates: Coordinates): number;
}
