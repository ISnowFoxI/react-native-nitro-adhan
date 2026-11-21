@file:OptIn(kotlin.time.ExperimentalTime::class)

package com.margelo.nitro.nitroadhan

import kotlin.math.roundToInt
import kotlin.time.Instant
import com.batoulapps.adhan2.CalculationMethod as AdhanCalculationMethod
import com.batoulapps.adhan2.CalculationParameters as AdhanCalculationParameters
import com.batoulapps.adhan2.Coordinates as AdhanCoordinates
import com.batoulapps.adhan2.HighLatitudeRule as AdhanHighLatitudeRule
import com.batoulapps.adhan2.Madhab as AdhanMadhab
import com.batoulapps.adhan2.Prayer as AdhanPrayer
import com.batoulapps.adhan2.PrayerAdjustments as AdhanPrayerAdjustments
import com.batoulapps.adhan2.data.DateComponents as AdhanDateComponents
import com.batoulapps.adhan2.model.Rounding as AdhanRounding
import com.batoulapps.adhan2.model.Shafaq as AdhanShafaq

// Nitro-generated types (Coordinates, Prayer, CalculationParameters, ...) share names
// with adhan2 types, so adhan2 types are imported with an `Adhan` prefix.

internal fun Coordinates.toAdhan() = AdhanCoordinates(latitude, longitude)

internal fun DateComponents.toAdhan() =
  AdhanDateComponents(year.toInt(), month.toInt(), day.toInt())

internal fun Instant.toEpochMs(): Double = toEpochMilliseconds().toDouble()

internal fun Double.toInstant(): Instant = Instant.fromEpochMilliseconds(toLong())

internal fun AdhanPrayerAdjustments.toNitro() = PrayerAdjustments(
  fajr.toDouble(), sunrise.toDouble(), dhuhr.toDouble(),
  asr.toDouble(), maghrib.toDouble(), isha.toDouble()
)

internal fun PrayerAdjustments.toAdhan() = AdhanPrayerAdjustments(
  fajr.roundToInt(), sunrise.roundToInt(), dhuhr.roundToInt(),
  asr.roundToInt(), maghrib.roundToInt(), isha.roundToInt()
)

internal fun Madhab.toAdhan() = when (this) {
  Madhab.SHAFI -> AdhanMadhab.SHAFI
  Madhab.HANAFI -> AdhanMadhab.HANAFI
}

internal fun AdhanMadhab.toNitro() = when (this) {
  AdhanMadhab.SHAFI -> Madhab.SHAFI
  AdhanMadhab.HANAFI -> Madhab.HANAFI
}

internal fun HighLatitudeRule.toAdhan() = when (this) {
  HighLatitudeRule.MIDDLEOFTHENIGHT -> AdhanHighLatitudeRule.MIDDLE_OF_THE_NIGHT
  HighLatitudeRule.SEVENTHOFTHENIGHT -> AdhanHighLatitudeRule.SEVENTH_OF_THE_NIGHT
  HighLatitudeRule.TWILIGHTANGLE -> AdhanHighLatitudeRule.TWILIGHT_ANGLE
}

internal fun AdhanHighLatitudeRule.toNitro() = when (this) {
  AdhanHighLatitudeRule.MIDDLE_OF_THE_NIGHT -> HighLatitudeRule.MIDDLEOFTHENIGHT
  AdhanHighLatitudeRule.SEVENTH_OF_THE_NIGHT -> HighLatitudeRule.SEVENTHOFTHENIGHT
  AdhanHighLatitudeRule.TWILIGHT_ANGLE -> HighLatitudeRule.TWILIGHTANGLE
}

internal fun Rounding.toAdhan() = when (this) {
  Rounding.NEAREST -> AdhanRounding.NEAREST
  Rounding.UP -> AdhanRounding.UP
  Rounding.NONE -> AdhanRounding.NONE
}

internal fun AdhanRounding.toNitro() = when (this) {
  AdhanRounding.NEAREST -> Rounding.NEAREST
  AdhanRounding.UP -> Rounding.UP
  AdhanRounding.NONE -> Rounding.NONE
}

internal fun Shafaq.toAdhan() = when (this) {
  Shafaq.GENERAL -> AdhanShafaq.GENERAL
  Shafaq.AHMER -> AdhanShafaq.AHMER
  Shafaq.ABYAD -> AdhanShafaq.ABYAD
}

internal fun AdhanShafaq.toNitro() = when (this) {
  AdhanShafaq.GENERAL -> Shafaq.GENERAL
  AdhanShafaq.AHMER -> Shafaq.AHMER
  AdhanShafaq.ABYAD -> Shafaq.ABYAD
}

internal fun Prayer.toAdhan() = when (this) {
  Prayer.FAJR -> AdhanPrayer.FAJR
  Prayer.SUNRISE -> AdhanPrayer.SUNRISE
  Prayer.DHUHR -> AdhanPrayer.DHUHR
  Prayer.ASR -> AdhanPrayer.ASR
  Prayer.MAGHRIB -> AdhanPrayer.MAGHRIB
  Prayer.ISHA -> AdhanPrayer.ISHA
}

/** adhan2 uses `NONE` where adhan-swift returns nil; both map to `undefined` in JS. */
internal fun AdhanPrayer.toNitro(): Prayer? = when (this) {
  AdhanPrayer.NONE -> null
  AdhanPrayer.FAJR -> Prayer.FAJR
  AdhanPrayer.SUNRISE -> Prayer.SUNRISE
  AdhanPrayer.DHUHR -> Prayer.DHUHR
  AdhanPrayer.ASR -> Prayer.ASR
  AdhanPrayer.MAGHRIB -> Prayer.MAGHRIB
  AdhanPrayer.ISHA -> Prayer.ISHA
}

/** adhan2 has no Tehran method, so its preset is built from adhan-swift's values. */
private val TEHRAN_FAJR_ANGLE = 17.7
private val TEHRAN_ISHA_ANGLE = 14.0
private val TEHRAN_MAGHRIB_ANGLE = 4.5

internal fun CalculationMethod.toAdhan(): AdhanCalculationMethod = when (this) {
  CalculationMethod.MUSLIMWORLDLEAGUE -> AdhanCalculationMethod.MUSLIM_WORLD_LEAGUE
  CalculationMethod.EGYPTIAN -> AdhanCalculationMethod.EGYPTIAN
  CalculationMethod.KARACHI -> AdhanCalculationMethod.KARACHI
  CalculationMethod.UMMALQURA -> AdhanCalculationMethod.UMM_AL_QURA
  CalculationMethod.DUBAI -> AdhanCalculationMethod.DUBAI
  CalculationMethod.MOONSIGHTINGCOMMITTEE -> AdhanCalculationMethod.MOON_SIGHTING_COMMITTEE
  CalculationMethod.NORTHAMERICA -> AdhanCalculationMethod.NORTH_AMERICA
  CalculationMethod.KUWAIT -> AdhanCalculationMethod.KUWAIT
  CalculationMethod.QATAR -> AdhanCalculationMethod.QATAR
  CalculationMethod.SINGAPORE -> AdhanCalculationMethod.SINGAPORE
  CalculationMethod.TEHRAN -> AdhanCalculationMethod.OTHER
  CalculationMethod.TURKEY -> AdhanCalculationMethod.TURKEY
  CalculationMethod.OTHER -> AdhanCalculationMethod.OTHER
}

/** Preset parameters for a method, in the shape JS sees (matches adhan-swift's presets). */
internal fun CalculationMethod.presetParameters(): CalculationParameters {
  val p = toAdhan().parameters
  val isTehran = this == CalculationMethod.TEHRAN
  return CalculationParameters(
    method = this,
    fajrAngle = if (isTehran) TEHRAN_FAJR_ANGLE else p.fajrAngle,
    maghribAngle = if (isTehran) TEHRAN_MAGHRIB_ANGLE else null,
    ishaAngle = if (isTehran) TEHRAN_ISHA_ANGLE else p.ishaAngle,
    ishaInterval = p.ishaInterval.toDouble(),
    madhab = p.madhab.toNitro(),
    highLatitudeRule = p.highLatitudeRule?.toNitro(),
    adjustments = p.prayerAdjustments.toNitro(),
    rounding = p.rounding.toNitro(),
    shafaq = p.shafaq.toNitro()
  )
}

/**
 * Starts from the method preset so its method adjustments are kept, then applies every
 * user-facing field. `maghribAngle` is not supported by adhan2 and is ignored.
 */
internal fun CalculationParameters.toAdhan(): AdhanCalculationParameters =
  method.toAdhan().parameters.copy(
    fajrAngle = fajrAngle,
    ishaAngle = ishaAngle,
    ishaInterval = ishaInterval.roundToInt(),
    madhab = madhab.toAdhan(),
    highLatitudeRule = highLatitudeRule?.toAdhan(),
    prayerAdjustments = adjustments.toAdhan(),
    rounding = rounding.toAdhan(),
    shafaq = shafaq.toAdhan()
  )

internal fun nowInstant(): Instant = Instant.fromEpochMilliseconds(System.currentTimeMillis())
