#!/usr/bin/env bash
set -e

# Run CocoaPods install in a minimal environment to avoid Conda/Anaconda contamination
# Adjust PATH if you have a custom Xcode location
env -i PATH=/Applications/Xcode.app/Contents/Developer/usr/bin:/usr/bin:/bin:/usr/sbin:/sbin HOME="$HOME" USER="$USER" pod install --repo-update --project-directory=ios
