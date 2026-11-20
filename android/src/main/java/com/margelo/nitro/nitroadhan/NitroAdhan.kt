package com.margelo.nitro.nitroadhan
  
import com.facebook.proguard.annotations.DoNotStrip

@DoNotStrip
class NitroAdhan : HybridNitroAdhanSpec() {
  override fun multiply(a: Double, b: Double): Double {
    return a * b
  }
}
