@file:OptIn(kotlin.time.ExperimentalTime::class)

package com.margelo.nitro.nitroadhan

import com.facebook.proguard.annotations.DoNotStrip
import kotlin.math.roundToInt
import com.batoulapps.adhan2.PrayerTimes as AdhanPrayerTimes

@DoNotStrip
class HybridPrayerTimes(
  internal val times: AdhanPrayerTimes,
  override val coordinates: Coordinates,
  override val date: DateComponents,
  override val calculationParameters: CalculationParameters
) : HybridPrayerTimesSpec() {
  override val fajr: Double get() = times.fajr.toEpochMs()
  override val sunrise: Double get() = times.sunrise.toEpochMs()
  override val dhuhr: Double get() = times.dhuhr.toEpochMs()
  override val asr: Double get() = times.asr.toEpochMs()
  override val maghrib: Double get() = times.maghrib.toEpochMs()
  override val isha: Double get() = times.isha.toEpochMs()

  override fun currentPrayer(at: Double?): Prayer? =
    times.currentPrayer(at?.toInstant() ?: nowInstant()).toNitro()

  override fun nextPrayer(at: Double?): Prayer? =
    times.nextPrayer(at?.toInstant() ?: nowInstant()).toNitro()

  override fun timeForPrayer(prayer: Prayer): Double =
    times.timeForPrayer(prayer.toAdhan())!!.toEpochMs()

  override fun getDuhaTimes(options: DuhaOptions?): DuhaWindow {
    val duha = DuhaTimes.from(
      times,
      afterSunriseMinutes = options?.afterSunriseMinutes?.roundToInt()
        ?: DuhaTimes.DEFAULT_AFTER_SUNRISE_MINUTES,
      beforeDhuhrMinutes = options?.beforeDhuhrMinutes?.roundToInt()
        ?: DuhaTimes.DEFAULT_BEFORE_DHUHR_MINUTES
    ) ?: throw Error("Duha window is empty: offsets overlap between sunrise and Dhuhr")
    return DuhaWindow(duha.start.toEpochMs(), duha.end.toEpochMs())
  }
}
