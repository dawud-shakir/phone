#!/usr/bin/env bash
set -e

# Build the Xcode workspace in a minimal environment (no Conda variables)
# Adjust the destination/device as needed
env -i PATH=/Applications/Xcode.app/Contents/Developer/usr/bin:/usr/bin:/bin:/usr/sbin:/sbin HOME="$HOME" USER="$USER" xcodebuild -workspace ios/PhoneApp.xcworkspace -scheme PhoneApp -configuration Debug -destination "platform=iOS Simulator,name=iPhone 17 Pro" clean build
