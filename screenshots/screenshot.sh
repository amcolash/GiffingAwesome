#!/bin/sh

if [ "$#" -ne 1  ]; then
  echo "Usage: screenshot.sh ImageName.png"
  exit 1
fi

adb shell screencap -p /sdcard/screencap.png
adb pull /sdcard/screencap.png
mv screencap.png $1
