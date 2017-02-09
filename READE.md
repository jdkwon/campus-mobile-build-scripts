# campus-mobile-build scripts

Basic usage:
1) npm install
2) node build-apk.js

Generate the Android APK:
git clone https://github.com/UCSD/campus-mobile-build-scripts.git && cd campus-mobile-build-scripts && npm install && node build-apk.js

Generate and install the Android APK on device:
git clone https://github.com/UCSD/campus-mobile-build-scripts.git && cd campus-mobile-build-scripts && npm install && node build-apk.js && adb install ./bld/android/app/build/outputs/apk/app-release.apk
