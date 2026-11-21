import Adhan
import Foundation

/// Duha window derived from adhan-swift prayer times.
///
/// adhan-swift has no Duha calculation, so it's defined here as fixed offsets from
/// sunrise and Dhuhr. This file depends only on Adhan and Foundation (no Nitro/React),
/// so it can also be compiled into a widget extension alongside the Adhan package.
public struct DuhaTimes: Equatable {
  public static let defaultAfterSunriseMinutes = 25
  public static let defaultBeforeDhuhrMinutes = 15

  /// When Duha starts: sunrise + `afterSunriseMinutes`.
  public let start: Date
  /// When Duha ends: Dhuhr − `beforeDhuhrMinutes`.
  public let end: Date

  /// Returns nil when the offsets leave no window between sunrise and Dhuhr.
  public init?(
    prayerTimes: Adhan.PrayerTimes,
    afterSunriseMinutes: Int = DuhaTimes.defaultAfterSunriseMinutes,
    beforeDhuhrMinutes: Int = DuhaTimes.defaultBeforeDhuhrMinutes
  ) {
    let start = prayerTimes.sunrise.addingTimeInterval(TimeInterval(afterSunriseMinutes * 60))
    let end = prayerTimes.dhuhr.addingTimeInterval(TimeInterval(-beforeDhuhrMinutes * 60))
    guard end > start else { return nil }
    self.start = start
    self.end = end
  }
}
