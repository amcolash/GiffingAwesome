#!/bin/sh

BUILD_DIR=platforms/android/build/outputs/apk
RELEASE_NAME="giffing-awesome.apk"

printf "[BUILD] Cleaning up build directory\n"
rm $BUILD_DIR/*.apk

printf "[BUILD] Run gradle build\n"
cordova build android --release

printf "[BUILD] Zipalign\n"
zipalign -v -p 4 $BUILD_DIR/android-release-unsigned.apk $BUILD_DIR/android-release-unsigned-aligned.apk

printf "[BUILD] Signing final app\n"
apksigner sign --ks ~/.android/release.jks --out $BUILD_DIR/$RELEASE_NAME $BUILD_DIR/android-release-unsigned-aligned.apk

printf "[BUILD] Verifying apk\n"
apksigner verify $BUILD_DIR/$RELEASE_NAME

printf "[BUILD] Build complete! Signed apk is located at %s/%s\n" "$BUILD_DIR" "$RELEASE_NAME"
