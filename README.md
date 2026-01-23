# Phone - Dog Voting App ("Dog or Not")

A cross-platform mobile application built with React Native for voting on dog photos, similar to "Hot or Not" but for dogs. Users can vote "Like" or "Dislike" on dog photos, see voting results, and upload their own dog photos.

## Features

- **Photo Voting**: View random dog photos and vote with Like or Dislike
- **Real-time Results**: See voting percentages immediately after voting
- **Photo Upload**: Upload your own dog photos from your device
- **Auto-progression**: Automatically loads next photo after voting
- **Clean UI**: Minimalist, intuitive interface
- **Cross-platform**: Works on both iOS and Android

## Architecture

This project consists of two parts:
1. **Backend Server** (Node.js/Express): Handles photo storage, voting, and API endpoints
2. **Frontend App** (React Native): Mobile application for iOS and Android

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

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install backend dependencies:
```bash
npm install
```

3. Start the backend server:
```bash
npm start
```

The server will run on `http://localhost:3000`. Keep this running in a separate terminal.

### Frontend Setup

1. From the project root, install frontend dependencies:
```bash
npm install
```

2. For iOS, install CocoaPods dependencies:
```bash
cd ios && pod install && cd ..
```

## Running the Application

**Important**: Make sure the backend server is running before starting the app!

### iOS (iPhone)

```bash
npm run ios
```

To run on a specific simulator:
```bash
npx react-native run-ios --simulator="iPhone 15 Pro"
```

### Android (Google)

Make sure you have an Android emulator running or a device connected.

```bash
npm run android
```

**Note for Android Emulator**: The app is configured to connect to `localhost:3000`. If the backend is running on your host machine, you may need to update the API URL in `src/services/api.ts` to use `10.0.2.2:3000` instead of `localhost:3000`.

**Note for Physical Devices**: Update the `API_BASE_URL` in `src/services/api.ts` to use your computer's local network IP address (e.g., `http://192.168.1.100:3000/api`).

### Platform-specific notes & troubleshooting (macOS) ⚠️

- iOS / CocoaPods + Conda
  - If you use Conda/Anaconda, it can contaminate iOS builds. Deactivate Conda before pod install:
    ```bash
    conda deactivate
    cd ios && pod install
    ```
  - Or run the repo helper which runs CocoaPods in a minimal environment:
    ```bash
    bash scripts/ios/run_pod_install_clean.sh
    ```
  - If you hit build issues, ensure the Xcode CLI tools are selected and accept the license, then clear DerivedData:
    ```bash
    sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
    sudo xcodebuild -license accept
    rm -rf ~/Library/Developer/Xcode/DerivedData/*
    ```

- Android SDK / JDK / Emulator
  - Ensure your SDK location is defined (file or env). Example (project root):
    ```bash
    echo "sdk.dir=/Users/$(whoami)/Library/Android/sdk" > android/local.properties
    ```
  - Set env vars when building (example uses Temurin JDK 17 which is compatible):
    ```bash
    export JAVA_HOME=/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home
    export ANDROID_HOME=/Users/$(whoami)/Library/Android/sdk
    export PATH=$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH
    npm run android
    ```
  - If Metro / dev server can't be reached from the emulator, forward the port:
    ```bash
    adb reverse tcp:8081 tcp:8081
    ```

- API base URL handling (applied in this repo)
  - `src/services/api.ts` has been updated to choose the proper backend URL on Android emulators automatically:
    ```ts
    const API_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000/api' : 'http://localhost:3000/api';
    ```

- Android native builds & emulator ABI
  - To avoid arm64 native build problems for some dev setups, `android/app/build.gradle` was adjusted to build for x86 emulators by setting:
    ```groovy
    ndk { abiFilters "x86", "x86_64" }
    ```
  - If you need arm64 support, remove or adjust this filter and ensure required native tooling is available.

- Backend
  - Start the backend in a separate terminal:
    ```bash
    cd backend
    npm install
    npm start
    # health check:
    curl http://localhost:3000/api/health
    ```

If anything above doesn't match your environment or you want me to add a short troubleshooting script, tell me which platform and I'll add it. 🔧

### Metro Bundler

Start the Metro bundler separately (optional):
```bash
npm start
```

## Usage

1. **Start Backend**: Run `npm start` in the `backend/` directory
2. **Start App**: Run `npm run ios` or `npm run android` from the project root
3. **Upload Photos**: Tap "Upload Your Dog Photo" to add dog photos
4. **Vote**: Tap "Like" or "Dislike" to vote on photos
5. **View Results**: Results appear automatically after voting

## API Configuration

The app connects to the backend server at `http://localhost:3000/api` by default.

To change this (e.g., for physical devices):
1. Open `src/services/api.ts`
2. Update the `API_BASE_URL` constant with your server's address

Examples:
- Android Emulator: `http://10.0.2.2:3000/api`
- Physical Device: `http://YOUR_COMPUTER_IP:3000/api` (e.g., `http://192.168.1.100:3000/api`)

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
├── backend/              # Backend server
│   ├── server.js        # Express server with API endpoints
│   ├── package.json     # Backend dependencies
│   ├── data/            # JSON data storage
│   │   └── photos.json  # Photos database
│   ├── uploads/         # Uploaded dog photos
│   └── README.md        # Backend documentation
├── src/                 # Frontend source code
│   ├── components/      # React Native components
│   │   ├── VotingScreen.tsx      # Main voting interface
│   │   ├── ResultsOverlay.tsx    # Results display
│   │   └── UploadScreen.tsx      # Photo upload interface
│   ├── services/        # API services
│   │   └── api.ts       # Backend communication
│   └── types/           # TypeScript definitions
│       └── index.ts     # Type definitions
├── android/             # Android-specific code
├── ios/                 # iOS-specific code
├── __tests__/           # Test files
├── App.tsx              # Main application component
├── index.js             # Application entry point
├── package.json         # Frontend dependencies
└── README.md            # This file
```

## Backend API Endpoints

See `backend/README.md` for detailed API documentation.

Quick reference:
- `GET /api/photos/random` - Get a random dog photo
- `POST /api/photos/:id/vote` - Submit a vote
- `POST /api/photos/upload` - Upload a new photo
- `GET /api/health` - Health check

## Development