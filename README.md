# Phone - Multi-Platform Mobile Application

A cross-platform mobile application built with React Native, supporting both iOS (iPhone) and Android (Google) platforms.

## Features

- **Multi-Platform Support**: Single codebase for both iOS and Android
- **React Native**: Latest version with TypeScript support
- **Modern Development**: Hot reloading, fast refresh, and comprehensive tooling

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 20 or higher
- **npm** or **yarn**: Package manager
- **React Native CLI**: Installed globally or use npx
- **For iOS Development**:
  - macOS
  - Xcode (latest version)
  - CocoaPods
- **For Android Development**:
  - Android Studio
  - Android SDK
  - Java Development Kit (JDK)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/dawud-shakir/phone.git
cd phone
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. For iOS, install CocoaPods dependencies:
```bash
cd ios && pod install && cd ..
```

## Running the Application

### iOS (iPhone)

```bash
npm run ios
# or
yarn ios
```

To run on a specific simulator:
```bash
npx react-native run-ios --simulator="iPhone 15 Pro"
```

### Android (Google)

Make sure you have an Android emulator running or a device connected.

```bash
npm run android
# or
yarn android
```

### Metro Bundler

Start the Metro bundler separately (optional):
```bash
npm start
# or
yarn start
```

## Development

### Linting

```bash
npm run lint
# or
yarn lint
```

### Testing

```bash
npm test
# or
yarn test
```

## Project Structure

```
phone/
├── android/          # Android-specific code and configuration
├── ios/              # iOS-specific code and configuration
├── __tests__/        # Test files
├── App.tsx           # Main application component
├── index.js          # Application entry point
├── package.json      # Dependencies and scripts
├── tsconfig.json     # TypeScript configuration
├── metro.config.js   # Metro bundler configuration
├── babel.config.js   # Babel configuration
└── app.json          # App configuration
```

## Building for Production

### iOS

1. Open `ios/PhoneApp.xcworkspace` in Xcode
2. Select your signing team
3. Archive the app (Product > Archive)
4. Follow Xcode's prompts to distribute to the App Store

### Android

```bash
cd android
./gradlew assembleRelease
```

The APK will be located at `android/app/build/outputs/apk/release/app-release.apk`

## Platform-Specific Notes

### iOS
- Requires macOS for development
- Uses CocoaPods for dependency management
- Minimum iOS version support defined in `ios/Podfile`

### Android
- Can be developed on any platform (Windows, macOS, Linux)
- Uses Gradle for builds
- Minimum Android version support defined in `android/build.gradle`

## Troubleshooting

### Metro Bundler Issues
```bash
npm start -- --reset-cache
```

### iOS Build Issues
```bash
cd ios
pod deintegrate
pod install
cd ..
```

### Android Build Issues
```bash
cd android
./gradlew clean
cd ..
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Learn More

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [React Native iOS Setup](https://reactnative.dev/docs/environment-setup?platform=ios)
- [React Native Android Setup](https://reactnative.dev/docs/environment-setup?platform=android)