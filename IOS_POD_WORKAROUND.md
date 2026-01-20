Title: iOS CocoaPods glog build workaround

Overview
---------
This project encountered a CocoaPods build failure when installing the `glog` pod while running `pod install` / building the iOS app. The root causes were:

- Outdated/incorrect autotools helper scripts in the `glog` source (`missing` script reported `Unknown '--is-lightweight' option`).
- Environment CFLAGS/CXXFLAGS from local dev environment (e.g., `conda`/Anaconda) were leaking into the iOS cross-compile environment and caused `configure` to fail.

What we changed
----------------
To make the project build reliably on the local machine, we applied the following transient fixes to the `glog` prepare step (persisted using `patch-package`):

1. Run `autoreconf -fiv` before `./configure` to regenerate the autotools helper scripts (so `missing`, `configure` etc. are up-to-date).
2. Unset/override `CFLAGS`, `CXXFLAGS`, `CPPFLAGS`, and `LDFLAGS` when running `./configure` to avoid passing incompatible host-specific flags into the iOS cross-compilation stage.

How the change is persisted
---------------------------
The fix is applied to the `react-native` package's prepare script via `patch-package`. The repository contains:

- `patches/react-native+0.83.1.patch` — automatically applied by `patch-package`.
- `package.json` now includes a `postinstall` script that runs `patch-package` after `npm install`.

This ensures the fix persists across `npm install` on your machine.

Commands and verification
-------------------------
- Re-apply patches after a fresh install:

  npm install

- Re-run CocoaPods in the iOS folder:

  cd ios
  pod install --repo-update

- Try building the app:

  npm run ios

If `pod install` fails for `glog`, inspect the cached glog folder:

  ls -d ~/Library/Caches/CocoaPods/Pods/External/glog*
  tail -n 200 <that-folder>/config.log

What to do if the iOS build still fails
--------------------------------------
- Clean Xcode DerivedData and retry a build in Xcode (this provides better diagnostics):

  rm -rf ~/Library/Developer/Xcode/DerivedData/*
  open ios/PhoneApp.xcworkspace
  (Build in Xcode and examine the first failing compile unit.)

- Common root cause: development environment contamination (e.g., Anaconda/Conda) can inject non-SDK headers and toolchain wrappers into the build, causing module/header validation failures. Try one of the following to run the build in a clean environment:

  # Option A: Temporarily deactivate Conda in your shell
  conda deactivate
  cd ios && pod install --repo-update
  cd .. && env -i PATH=/Applications/Xcode.app/Contents/Developer/usr/bin:/usr/bin:/bin:/usr/sbin:/sbin HOME="$HOME" USER="$USER" xcodebuild -workspace ios/PhoneApp.xcworkspace -scheme PhoneApp -configuration Debug -destination 'platform=iOS Simulator,name=iPhone 17 Pro' clean build

  # Option B: Use a minimal environment for a single command (no Conda variables or extra PATH entries)
  env -i PATH=/Applications/Xcode.app/Contents/Developer/usr/bin:/usr/bin:/bin:/usr/sbin:/sbin HOME="$HOME" USER="$USER" pod install --repo-update --project-directory=ios
  env -i PATH=/Applications/Xcode.app/Contents/Developer/usr/bin:/usr/bin:/bin:/usr/sbin:/sbin HOME="$HOME" USER="$USER" xcodebuild -workspace ios/PhoneApp.xcworkspace -scheme PhoneApp -configuration Debug -destination 'platform=iOS Simulator,name=iPhone 17 Pro' clean build

- If you want convenience wrappers, this repo includes helper scripts (in `scripts/ios/`) that run `pod install` and `xcodebuild` in a minimal environment. Running builds with those wrappers avoids Conda contamination even if your shell auto-activates Conda.

  # Example usage from the repo root:
  scripts/ios/run_pod_install_clean.sh
  scripts/ios/run_xcodebuild_clean.sh

  # Or check for Conda before running (fails if Conda detected):
  scripts/ios/check_conda.sh && scripts/ios/run_xcodebuild_clean.sh

  (Make the scripts executable with `chmod +x scripts/ios/*.sh` if needed.)

- Run `npx react-native doctor` and follow fixes suggested.
- If the underlying issue is fixed upstream (in `glog` or `react-native`), remove the patch and update the package. To revert the patch:

  npx patch-package --revert react-native

Notes and follow-up
------------------
- This is a pragmatic workaround to get the local project building; it is intentionally minimal and conservative.
- If you prefer, we can open a PR/issue upstream with the patch to avoid local workarounds in future releases.

Optional Podfile guard to warn about Conda
-----------------------------------------
If you want to fail fast on developer machines with an active Conda environment, add this check to `ios/Podfile` near the top of the `post_install` block:

```ruby
if ENV['CONDA_PREFIX'] || ENV['CONDA_EXE']
  puts "WARNING: Conda/Anaconda detected in the environment. Consider running 'conda deactivate' before 'pod install' or building in Xcode."
end
```

If you want, I can now try building the workspace in Xcode (open `ios/PhoneApp.xcworkspace`) and capture the Xcode build log to diagnose the `xcodebuild` error 65 you saw. Which would you like me to do next?
