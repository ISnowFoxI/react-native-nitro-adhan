@file:OptIn(kotlin.time.ExperimentalTime::class)

package com.margelo.nitro.nitroadhan

import com.batoulapps.adhan2.PrayerTimes
import kotlin.time.Duration.Companion.minutes
import kotlin.time.Instant

/**
 * Duha window derived from adhan-kotlin prayer times.
 *
 * adhan-kotlin has no Duha calculation, so it's defined here as fixed offsets from
 * sunrise and Dhuhr. This class depends only on adhan2 (no Nitro/React), so app
 * widgets can call it directly.
 */
data class DuhaTimes(
  /** When Duha starts: sunrise + `afterSunriseMinutes`. */
  val start: Instant,
  /** When Duha ends: Dhuhr − `beforeDhuhrMinutes`. */
  val end: Instant
) {
  companion object {
    const val DEFAULT_AFTER_SUNRISE_MINUTES = 25
    const val DEFAULT_BEFORE_DHUHR_MINUTES = 15

    /** Returns null when the offsets leave no window between sunrise and Dhuhr. */
    @JvmStatic
    @JvmOverloads
    fun from(
      prayerTimes: PrayerTimes,
      afterSunriseMinutes: Int = DEFAULT_AFTER_SUNRISE_MINUTES,
      beforeDhuhrMinutes: Int = DEFAULT_BEFORE_DHUHR_MINUTES
    ): DuhaTimes? {
      val start = prayerTimes.sunrise + afterSunriseMinutes.minutes
      val end = prayerTimes.dhuhr - beforeDhuhrMinutes.minutes
      return if (end > start) DuhaTimes(start, end) else null
    }
  }
}
