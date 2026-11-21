import Adhan
import Foundation
import NitroModules

final class HybridPrayerTimes: HybridPrayerTimesSpec {
  let times: Adhan.PrayerTimes
  let coordinates: Coordinates
  let date: DateComponents
  let calculationParameters: CalculationParameters

  init(
    times: Adhan.PrayerTimes,
    coordinates: Coordinates,
    date: DateComponents,
    calculationParameters: CalculationParameters
  ) {
    self.times = times
    self.coordinates = coordinates
    self.date = date
    self.calculationParameters = calculationParameters
    super.init()
  }

  var fajr: Double { times.fajr.epochMs }
  var sunrise: Double { times.sunrise.epochMs }
  var dhuhr: Double { times.dhuhr.epochMs }
  var asr: Double { times.asr.epochMs }
  var maghrib: Double { times.maghrib.epochMs }
  var isha: Double { times.isha.epochMs }

  func currentPrayer(at: Double?) throws -> Prayer? {
    let time = at.map { Date(epochMs: $0) } ?? Date()
    return times.currentPrayer(at: time).map { Prayer(adhan: $0) }
  }

  func nextPrayer(at: Double?) throws -> Prayer? {
    let time = at.map { Date(epochMs: $0) } ?? Date()
    return times.nextPrayer(at: time).map { Prayer(adhan: $0) }
  }

  func timeForPrayer(prayer: Prayer) throws -> Double {
    return times.time(for: prayer.toAdhan()).epochMs
  }

  func getDuhaTimes(options: DuhaOptions?) throws -> DuhaWindow {
    let after = options?.afterSunriseMinutes.map { Int($0.rounded()) }
      ?? DuhaTimes.defaultAfterSunriseMinutes
    let before = options?.beforeDhuhrMinutes.map { Int($0.rounded()) }
      ?? DuhaTimes.defaultBeforeDhuhrMinutes
    guard
      let duha = DuhaTimes(
        prayerTimes: times,
        afterSunriseMinutes: after,
        beforeDhuhrMinutes: before
      )
    else {
      throw RuntimeError.error(
        withMessage: "Duha window is empty: offsets overlap between sunrise and Dhuhr"
      )
    }
    return DuhaWindow(start: duha.start.epochMs, end: duha.end.epochMs)
  }
}
