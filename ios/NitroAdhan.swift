import Adhan
import Foundation
import NitroModules

class NitroAdhan: HybridNitroAdhanSpec {
  func getCalculationParameters(calculationMethod: CalculationMethod) throws -> CalculationParameters {
    return CalculationParameters(adhan: try calculationMethod.toAdhan().params)
  }

  func recommendedHighLatitudeRule(coordinates: Coordinates) throws -> HighLatitudeRule {
    return HighLatitudeRule(adhan: .recommended(for: coordinates.toAdhan()))
  }

  func createPrayerTimes(
    coordinates: Coordinates,
    date: DateComponents,
    parameters: CalculationParameters
  ) throws -> (any HybridPrayerTimesSpec) {
    guard
      let times = Adhan.PrayerTimes(
        coordinates: coordinates.toAdhan(),
        date: date.toAdhan(),
        calculationParameters: try parameters.toAdhan()
      )
    else {
      throw RuntimeError.error(
        withMessage: "Unable to calculate prayer times for the given coordinates and date"
      )
    }
    return HybridPrayerTimes(
      times: times,
      coordinates: coordinates,
      date: date,
      calculationParameters: parameters
    )
  }

  func createSunnahTimes(prayerTimes: (any HybridPrayerTimesSpec)) throws -> (any HybridSunnahTimesSpec) {
    guard let prayerTimes = prayerTimes as? HybridPrayerTimes else {
      throw RuntimeError.error(withMessage: "prayerTimes must be created by createPrayerTimes")
    }
    guard let times = Adhan.SunnahTimes(from: prayerTimes.times) else {
      throw RuntimeError.error(
        withMessage: "Unable to calculate sunnah times: next day's prayer times could not be calculated"
      )
    }
    return HybridSunnahTimes(times: times)
  }

  func qibla(coordinates: Coordinates) throws -> Double {
    return Adhan.Qibla(coordinates: coordinates.toAdhan()).direction
  }
}
