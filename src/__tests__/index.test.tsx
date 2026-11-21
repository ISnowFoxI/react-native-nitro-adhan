import { describe, expect, it, jest } from '@jest/globals';

const HOUR = 3_600_000;
const MINUTE = 60_000;

// Fake native module: deterministic times at fixed UTC hours of each requested day.
// The real math lives natively (ios/*.swift, android/**/*.kt); these tests cover the JS layer.
const OFFSETS = {
  fajr: 5 * HOUR,
  sunrise: 6.5 * HOUR,
  dhuhr: 12 * HOUR,
  asr: 15 * HOUR,
  maghrib: 17.5 * HOUR,
  isha: 19 * HOUR,
} as const;

function mockNativePrayerTimes(date: {
  year: number;
  month: number;
  day: number;
}) {
  const base = Date.UTC(date.year, date.month - 1, date.day);
  const times = Object.fromEntries(
    Object.entries(OFFSETS).map(([prayer, offset]) => [prayer, base + offset])
  ) as Record<keyof typeof OFFSETS, number>;
  return {
    ...times,
    date,
    timeForPrayer: (prayer: keyof typeof OFFSETS) => times[prayer],
    getDuhaTimes: (options?: {
      afterSunriseMinutes?: number;
      beforeDhuhrMinutes?: number;
    }) => ({
      start: times.sunrise + (options?.afterSunriseMinutes ?? 25) * MINUTE,
      end: times.dhuhr - (options?.beforeDhuhrMinutes ?? 15) * MINUTE,
    }),
  };
}

jest.mock('../native', () => ({
  getNitroAdhan: () => ({
    createPrayerTimes: (_c: unknown, date: any) => mockNativePrayerTimes(date),
    createSunnahTimes: (pt: any) => ({
      middleOfTheNight: pt.isha + 4 * HOUR,
      lastThirdOfTheNight: pt.isha + 6 * HOUR,
    }),
  }),
}));

const { getDuhaTimes, getPrayerSchedule } =
  require('../index') as typeof import('../index');

const coordinates = { latitude: 21.4225, longitude: 39.8262 };
const params = {} as Parameters<typeof getPrayerSchedule>[1];
const startDate = { year: 2026, month: 12, day: 31 };

describe('getDuhaTimes', () => {
  it('passes options to native and converts epoch ms to Dates', () => {
    const native = jest.fn(() => ({ start: 1_000, end: 2_000 }));
    const prayerTimes = { native: { getDuhaTimes: native } } as any;
    const options = { afterSunriseMinutes: 20, beforeDhuhrMinutes: 10 };

    const { start, end } = getDuhaTimes(prayerTimes, options);

    expect(native).toHaveBeenCalledWith(options);
    expect(start.getTime()).toBe(1_000);
    expect(end.getTime()).toBe(2_000);
  });
});

describe('getPrayerSchedule', () => {
  it('returns prayers and Duha for each day, sorted by time', () => {
    const schedule = getPrayerSchedule(coordinates, params, {
      startDate,
      days: 2,
    });

    expect(schedule).toHaveLength(16);
    expect(schedule.slice(0, 8).map((e) => e.event)).toEqual([
      'fajr',
      'sunrise',
      'duhaStart',
      'duhaEnd',
      'dhuhr',
      'asr',
      'maghrib',
      'isha',
    ]);
    const timestamps = schedule.map((e) => e.timestamp);
    expect(timestamps).toEqual([...timestamps].sort((a, b) => a - b));
    expect(schedule[2]!.time.toISOString()).toBe('2026-12-31T06:55:00.000Z');
  });

  it('rolls over month and year boundaries', () => {
    const schedule = getPrayerSchedule(coordinates, params, {
      startDate,
      days: 2,
    });
    expect(schedule[0]!.day).toEqual({ year: 2026, month: 12, day: 31 });
    expect(schedule.at(-1)!.day).toEqual({ year: 2027, month: 1, day: 1 });
  });

  it('can leave out Duha and add night times', () => {
    const schedule = getPrayerSchedule(coordinates, params, {
      startDate,
      days: 1,
      duha: false,
      includeNightTimes: true,
    });
    const events = schedule.map((e) => e.event);
    expect(events).not.toContain('duhaStart');
    expect(events.slice(-2)).toEqual([
      'middleOfTheNight',
      'lastThirdOfTheNight',
    ]);
  });

  it('rejects an invalid number of days', () => {
    expect(() =>
      getPrayerSchedule(coordinates, params, { startDate, days: 0 })
    ).toThrow(RangeError);
  });
});
