import Adhan
import Foundation
import NitroModules

// Nitro-generated types (Coordinates, Prayer, CalculationParameters, ...) shadow the
// Adhan types of the same name inside this module, so Adhan types are always qualified.

extension Coordinates {
  func toAdhan() -> Adhan.Coordinates {
    return Adhan.Coordinates(latitude: latitude, longitude: longitude)
  }
}

extension DateComponents {
  func toAdhan() -> Foundation.DateComponents {
    return Foundation.DateComponents(year: Int(year), month: Int(month), day: Int(day))
  }
}

extension PrayerAdjustments {
  init(adhan a: Adhan.PrayerAdjustments) {
    self.init(
      fajr: Double(a.fajr),
      sunrise: Double(a.sunrise),
      dhuhr: Double(a.dhuhr),
      asr: Double(a.asr),
      maghrib: Double(a.maghrib),
      isha: Double(a.isha)
    )
  }

  func toAdhan() -> Adhan.PrayerAdjustments {
    return Adhan.PrayerAdjustments(
      fajr: Int(fajr.rounded()),
      sunrise: Int(sunrise.rounded()),
      dhuhr: Int(dhuhr.rounded()),
      asr: Int(asr.rounded()),
      maghrib: Int(maghrib.rounded()),
      isha: Int(isha.rounded())
    )
  }
}

extension Madhab {
  init(adhan: Adhan.Madhab) {
    switch adhan {
    case .shafi: self = .shafi
    case .hanafi: self = .hanafi
    }
  }

  func toAdhan() -> Adhan.Madhab {
    switch self {
    case .shafi: return .shafi
    case .hanafi: return .hanafi
    }
  }
}

extension Prayer {
  init(adhan: Adhan.Prayer) {
    switch adhan {
    case .fajr: self = .fajr
    case .sunrise: self = .sunrise
    case .dhuhr: self = .dhuhr
    case .asr: self = .asr
    case .maghrib: self = .maghrib
    case .isha: self = .isha
    }
  }

  func toAdhan() -> Adhan.Prayer {
    switch self {
    case .fajr: return .fajr
    case .sunrise: return .sunrise
    case .dhuhr: return .dhuhr
    case .asr: return .asr
    case .maghrib: return .maghrib
    case .isha: return .isha
    }
  }
}

// The remaining enums are String-backed in Adhan with the same camelCase names as the
// TypeScript unions, so they map through their string values.

extension CalculationMethod {
  func toAdhan() throws -> Adhan.CalculationMethod {
    guard let method = Adhan.CalculationMethod(rawValue: stringValue) else {
      throw RuntimeError.error(withMessage: "Unknown calculation method: \(stringValue)")
    }
    return method
  }
}

extension HighLatitudeRule {
  init(adhan: Adhan.HighLatitudeRule) {
    self.init(fromString: adhan.rawValue)!
  }

  func toAdhan() throws -> Adhan.HighLatitudeRule {
    guard let rule = Adhan.HighLatitudeRule(rawValue: stringValue) else {
      throw RuntimeError.error(withMessage: "Unknown high latitude rule: \(stringValue)")
    }
    return rule
  }
}

extension Rounding {
  init(adhan: Adhan.Rounding) {
    self.init(fromString: adhan.rawValue)!
  }

  func toAdhan() throws -> Adhan.Rounding {
    guard let rounding = Adhan.Rounding(rawValue: stringValue) else {
      throw RuntimeError.error(withMessage: "Unknown rounding: \(stringValue)")
    }
    return rounding
  }
}

extension Shafaq {
  init(adhan: Adhan.Shafaq) {
    self.init(fromString: adhan.rawValue)!
  }

  func toAdhan() throws -> Adhan.Shafaq {
    guard let shafaq = Adhan.Shafaq(rawValue: stringValue) else {
      throw RuntimeError.error(withMessage: "Unknown shafaq: \(stringValue)")
    }
    return shafaq
  }
}

extension CalculationParameters {
  init(adhan p: Adhan.CalculationParameters) {
    self.init(
      method: CalculationMethod(fromString: p.method.rawValue)!,
      fajrAngle: p.fajrAngle,
      maghribAngle: p.maghribAngle,
      ishaAngle: p.ishaAngle,
      ishaInterval: Double(p.ishaInterval),
      madhab: Madhab(adhan: p.madhab),
      highLatitudeRule: p.highLatitudeRule.map { HighLatitudeRule(adhan: $0) },
      adjustments: PrayerAdjustments(adhan: p.adjustments),
      rounding: Rounding(adhan: p.rounding),
      shafaq: Shafaq(adhan: p.shafaq)
    )
  }

  /// Starts from the method preset so its internal method adjustments are kept,
  /// then applies every user-facing field.
  func toAdhan() throws -> Adhan.CalculationParameters {
    var p = try method.toAdhan().params
    p.fajrAngle = fajrAngle
    p.maghribAngle = maghribAngle
    p.ishaAngle = ishaAngle
    p.ishaInterval = Int(ishaInterval.rounded())
    p.madhab = madhab.toAdhan()
    p.highLatitudeRule = try highLatitudeRule?.toAdhan()
    p.adjustments = adjustments.toAdhan()
    p.rounding = try rounding.toAdhan()
    p.shafaq = try shafaq.toAdhan()
    return p
  }
}

extension Date {
  init(epochMs: Double) {
    self.init(timeIntervalSince1970: epochMs / 1000)
  }

  var epochMs: Double {
    return (timeIntervalSince1970 * 1000).rounded()
  }
}
