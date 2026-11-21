import { Platform } from 'react-native';
import { getNitroAdhan } from './native';
import type {
  CalculationMethod,
  CalculationParameters,
  Coordinates,
  DateComponents,
  DuhaOptions,
  HighLatitudeRule,
  Prayer,
  PrayerAdjustments,
  PrayerTimes as NativePrayerTimes,
} from './NitroAdhan.nitro';

export type {
  CalculationMethod,
  CalculationParameters,
  Coordinates,
  DateComponents,
  DuhaOptions,
  HighLatitudeRule,
  Madhab,
  Prayer,
  PrayerAdjustments,
  Rounding,
  Shafaq,
} from './NitroAdhan.nitro';

/** Fields to override on a method preset. `adjustments` is merged with the preset's. */
export interface CalculationParametersOverrides extends Partial<
  Omit<CalculationParameters, 'method' | 'adjustments'>
> {
  adjustments?: Partial<PrayerAdjustments>;
}

/** Preset parameters for a calculation method, optionally with overrides applied. */
export function getCalculationParameters(
  method: CalculationMethod,
  overrides: CalculationParametersOverrides = {}
): CalculationParameters {
  const preset = getNitroAdhan().getCalculationParameters(method);
  return {
    ...preset,
    ...overrides,
    adjustments: { ...preset.adjustments, ...overrides.adjustments },
  };
}

/** `seventhOfTheNight` above 48° latitude, `middleOfTheNight` otherwise. */
export function recommendedHighLatitudeRule(
  coordinates: Coordinates
): HighLatitudeRule {
  assertCoordinates(coordinates);
  return getNitroAdhan().recommendedHighLatitudeRule(coordinates);
}

/** Heading to the Qibla in degrees from true North. */
export function qibla(coordinates: Coordinates): number {
  assertCoordinates(coordinates);
  return getNitroAdhan().qibla(coordinates);
}

/**
 * Prayer times for a location and day.
 *
 * `date` is a calendar day. A JS `Date` is converted using the device's local
 * time zone. Returned times are absolute `Date`s; format them in the
 * location's time zone for display.
 *
 * Throws when the times can't be calculated (e.g. extreme latitudes).
 */
export class PrayerTimes {
  readonly fajr: Date;
  readonly sunrise: Date;
  readonly dhuhr: Date;
  readonly asr: Date;
  readonly maghrib: Date;
  readonly isha: Date;

  readonly coordinates: Coordinates;
  readonly date: DateComponents;
  readonly calculationParameters: CalculationParameters;

  /** @internal */
  readonly native: NativePrayerTimes;

  constructor(
    coordinates: Coordinates,
    date: Date | DateComponents,
    calculationParameters: CalculationParameters
  ) {
    assertCoordinates(coordinates);
    const components = toDateComponents(date);
    warnIfUnsupported(calculationParameters);

    this.native = getNitroAdhan().createPrayerTimes(
      coordinates,
      components,
      calculationParameters
    );
    this.coordinates = coordinates;
    this.date = components;
    this.calculationParameters = calculationParameters;
    this.fajr = new Date(this.native.fajr);
    this.sunrise = new Date(this.native.sunrise);
    this.dhuhr = new Date(this.native.dhuhr);
    this.asr = new Date(this.native.asr);
    this.maghrib = new Date(this.native.maghrib);
    this.isha = new Date(this.native.isha);
  }

  /** Prayer whose time has most recently started, or undefined before Fajr. */
  currentPrayer(at: Date = new Date()): Prayer | undefined {
    return this.native.currentPrayer(at.getTime());
  }

  /** Next prayer to start, or undefined after Isha. */
  nextPrayer(at: Date = new Date()): Prayer | undefined {
    return this.native.nextPrayer(at.getTime());
  }

  timeForPrayer(prayer: Prayer): Date {
    return new Date(this.native.timeForPrayer(prayer));
  }
}

/** Night times derived from a day's prayer times and the next day's Fajr. */
export class SunnahTimes {
  /** Midpoint between Maghrib and the next day's Fajr. */
  readonly middleOfTheNight: Date;
  /** Start of the last third of the night, a recommended time for Qiyam. */
  readonly lastThirdOfTheNight: Date;

  constructor(prayerTimes: PrayerTimes) {
    const native = getNitroAdhan().createSunnahTimes(prayerTimes.native);
    this.middleOfTheNight = new Date(native.middleOfTheNight);
    this.lastThirdOfTheNight = new Date(native.lastThirdOfTheNight);
  }
}

export interface DuhaTimes {
  /** Sunrise + `afterSunriseMinutes` (default 25). */
  start: Date;
  /** Dhuhr − `beforeDhuhrMinutes` (default 15). */
  end: Date;
}

/**
 * Duha window, calculated natively (Swift `DuhaTimes` / Kotlin `DuhaTimes`) from
 * sunrise and Dhuhr with fixed offsets. Throws if the offsets leave no window.
 */
export function getDuhaTimes(
  prayerTimes: PrayerTimes,
  options?: DuhaOptions
): DuhaTimes {
  const { start, end } = prayerTimes.native.getDuhaTimes(options);
  return { start: new Date(start), end: new Date(end) };
}

export type PrayerScheduleEvent =
  Prayer | 'duhaStart' | 'duhaEnd' | 'middleOfTheNight' | 'lastThirdOfTheNight';

export interface PrayerScheduleEntry {
  event: PrayerScheduleEvent;
  time: Date;
  /** Same instant as `time`, in epoch ms. Safe to serialize (e.g. widget props). */
  timestamp: number;
  /** The calendar day whose prayer times produced this event. */
  day: DateComponents;
}

export interface PrayerScheduleOptions {
  /** First day. A JS `Date` uses the device's local calendar day. Default: today. */
  startDate?: Date | DateComponents;
  /** Number of days, including `startDate`. Default: 7. */
  days?: number;
  /** Duha offsets, or `false` to leave Duha out. Default: 25 / 15 minutes. */
  duha?: DuhaOptions | false;
  /** Include `middleOfTheNight` and `lastThirdOfTheNight`. Default: false. */
  includeNightTimes?: boolean;
}

/**
 * Every prayer-related event for the next `days` days as one list sorted by time,
 * e.g. to build widget timeline entries or props. All times are calculated natively.
 */
export function getPrayerSchedule(
  coordinates: Coordinates,
  calculationParameters: CalculationParameters,
  {
    startDate = new Date(),
    days = 7,
    duha = {},
    includeNightTimes = false,
  }: PrayerScheduleOptions = {}
): PrayerScheduleEntry[] {
  if (!Number.isInteger(days) || days < 1) {
    throw new RangeError(`days must be a positive integer, got ${days}`);
  }
  const first = toDateComponents(startDate);
  const entries: PrayerScheduleEntry[] = [];

  for (let i = 0; i < days; i++) {
    const day = addDays(first, i);
    const times = new PrayerTimes(coordinates, day, calculationParameters);
    const add = (event: PrayerScheduleEvent, time: Date) =>
      entries.push({ event, time, timestamp: time.getTime(), day });

    for (const prayer of PRAYERS) {
      add(prayer, times.timeForPrayer(prayer));
    }
    if (duha !== false) {
      const { start, end } = getDuhaTimes(times, duha);
      add('duhaStart', start);
      add('duhaEnd', end);
    }
    if (includeNightTimes) {
      const sunnah = new SunnahTimes(times);
      add('middleOfTheNight', sunnah.middleOfTheNight);
      add('lastThirdOfTheNight', sunnah.lastThirdOfTheNight);
    }
  }

  return entries.sort((a, b) => a.timestamp - b.timestamp);
}

const PRAYERS: readonly Prayer[] = [
  'fajr',
  'sunrise',
  'dhuhr',
  'asr',
  'maghrib',
  'isha',
];

function addDays(date: DateComponents, count: number): DateComponents {
  const d = new Date(Date.UTC(date.year, date.month - 1, date.day + count));
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
  };
}

function toDateComponents(date: Date | DateComponents): DateComponents {
  if (date instanceof Date) {
    if (Number.isNaN(date.getTime())) {
      throw new RangeError('Invalid Date');
    }
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
    };
  }
  const { year, month, day } = date;
  const check = new Date(Date.UTC(year, month - 1, day));
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    throw new RangeError(`Invalid date: ${year}-${month}-${day}`);
  }
  return { year, month, day };
}

function assertCoordinates({ latitude, longitude }: Coordinates): void {
  if (!(latitude >= -90 && latitude <= 90)) {
    throw new RangeError(
      `Latitude must be between -90 and 90, got ${latitude}`
    );
  }
  if (!(longitude >= -180 && longitude <= 180)) {
    throw new RangeError(
      `Longitude must be between -180 and 180, got ${longitude}`
    );
  }
}

let warnedMaghribAngle = false;

function warnIfUnsupported(parameters: CalculationParameters): void {
  if (
    Platform.OS === 'android' &&
    parameters.maghribAngle !== undefined &&
    !warnedMaghribAngle
  ) {
    warnedMaghribAngle = true;
    console.warn(
      '[react-native-nitro-adhan] maghribAngle (used by the "tehran" method) is not ' +
        'supported on Android yet: adhan-kotlin does not implement it. ' +
        'Maghrib will be calculated at sunset.'
    );
  }
}
