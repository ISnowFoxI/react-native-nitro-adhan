@file:OptIn(kotlin.time.ExperimentalTime::class)

package com.margelo.nitro.nitroadhan

import com.facebook.proguard.annotations.DoNotStrip
import com.batoulapps.adhan2.SunnahTimes as AdhanSunnahTimes

@DoNotStrip
class HybridSunnahTimes(private val times: AdhanSunnahTimes) : HybridSunnahTimesSpec() {
  override val middleOfTheNight: Double get() = times.middleOfTheNight.toEpochMs()
  override val lastThirdOfTheNight: Double get() = times.lastThirdOfTheNight.toEpochMs()
}
