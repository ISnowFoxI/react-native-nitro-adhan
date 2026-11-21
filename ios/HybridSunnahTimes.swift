import Adhan
import Foundation
import NitroModules

final class HybridSunnahTimes: HybridSunnahTimesSpec {
  let times: Adhan.SunnahTimes

  init(times: Adhan.SunnahTimes) {
    self.times = times
    super.init()
  }

  var middleOfTheNight: Double { times.middleOfTheNight.epochMs }
  var lastThirdOfTheNight: Double { times.lastThirdOfTheNight.epochMs }
}
