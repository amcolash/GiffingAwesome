#!/bin/sh

# Export new versions of the svgs
for f in *.svg;
do
  inkscape -e $(basename $f .svg).png $f;
done

# Regenerate new versions of resources
ionic cordova resources

# Clear out icon folder
rm ../www/img/icons/*

# Copy new versions of icons
cp android/icon/* ../www/img/icons/

cp android/splash/drawable-land-xxhdpi-screen.png ../www/img/splash/splash-land.png
cp android/splash/drawable-port-xxhdpi-screen.png ../www/img/splash/splash-port.png

cp full_logo_transparent.png ../www/img/logos/giffing_awesome_full.png
