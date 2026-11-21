require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "NitroAdhan"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => min_ios_version_supported }
  s.source       = { :git => "https://github.com/ISnowFoxI/react-native-nitro-adhan.git", :tag => "v#{s.version}" }

  s.source_files = [
    "ios/**/*.{swift}",
    "ios/**/*.{m,mm}",
    "cpp/**/*.{hpp,cpp}",
  ]

  s.dependency 'React-jsi'
  s.dependency 'React-callinvoker'

  # adhan-swift is distributed via Swift Package Manager only (>= 1.5.0)
  spm_dependency(s,
    url: 'https://github.com/batoulapps/adhan-swift.git',
    requirement: { kind: 'upToNextMajorVersion', minimumVersion: '1.5.0' },
    products: ['Adhan']
  )

  load 'nitrogen/generated/ios/NitroAdhan+autolinking.rb'
  add_nitrogen_files(s)

  install_modules_dependencies(s)
end
