package com.margelo.nitro.nitroadhan

import com.facebook.proguard.annotations.DoNotStrip
import com.batoulapps.adhan2.HighLatitudeRule as AdhanHighLatitudeRule
import com.batoulapps.adhan2.PrayerTimes as AdhanPrayerTimes
import com.batoulapps.adhan2.Qibla as AdhanQibla
import com.batoulapps.adhan2.SunnahTimes as AdhanSunnahTimes

@DoNotStrip
class NitroAdhan : HybridNitroAdhanSpec() {
  override fun getCalculationParameters(calculationMethod: CalculationMethod): CalculationParameters =
    calculationMethod.presetParameters()

  override fun recommendedHighLatitudeRule(coordinates: Coordinates): HighLatitudeRule =
    AdhanHighLatitudeRule.recommendedFor(coordinates.toAdhan()).toNitro()

  override fun createPrayerTimes(
    coordinates: Coordinates,
    date: DateComponents,
    parameters: CalculationParameters
  ): HybridPrayerTimesSpec {
    val times = try {
      AdhanPrayerTimes(coordinates.toAdhan(), date.toAdhan(), parameters.toAdhan())
    } catch (e: IllegalArgumentException) {
      throw Error(e.message ?: "Invalid coordinates or date", e)
    } catch (e: IllegalStateException) {
      throw Error("Unable to calculate prayer times for the given coordinates and date", e)
    }
    return HybridPrayerTimes(times, coordinates, date, parameters)
  }

  override fun createSunnahTimes(prayerTimes: HybridPrayerTimesSpec): HybridSunnahTimesSpec {
    val hybrid = prayerTimes as? HybridPrayerTimes
      ?: throw Error("prayerTimes must be created by createPrayerTimes")
    val times = try {
      AdhanSunnahTimes(hybrid.times)
    } catch (e: IllegalStateException) {
      throw Error(
        "Unable to calculate sunnah times: next day's prayer times could not be calculated", e
      )
    }
    return HybridSunnahTimes(times)
  }

  override fun qibla(coordinates: Coordinates): Double =
    AdhanQibla(coordinates.toAdhan()).direction
}
