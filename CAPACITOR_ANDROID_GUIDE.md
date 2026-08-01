# SARTHI OS v1.0 — Capacitor Android Integration & Build Guide

This guide details how to integrate **Capacitor** with SARTHI OS for native Android compilation, device permission configuration, APK side-loading, and Google Play Store AAB bundle generation.

---

## 1. Installed Capacitor Dependencies
- `@capacitor/core`: ^6.0.0
- `@capacitor/cli`: ^6.0.0
- `@capacitor/android`: ^6.0.0

---

## 2. Capacitor Configuration (`capacitor.config.ts`)
```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sarthi.app',
  appName: 'SARTHI',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: '#1E3A8A',
      androidSplashResourceName: 'splash',
      showSpinner: false
    }
  }
};

export default config;
```

---

## 3. Step-by-Step Android Sync & Build Process

### Step 1: Build the Web App Production Bundle
Ensure Vite outputs static compiled files into `dist/`:
```bash
npm run build
```

### Step 2: Add Android Native Platform (First-time Setup)
```bash
npx cap add android
```

### Step 3: Sync Web Assets to Android Project
Copy the `dist/` web assets and update native Android plugins:
```bash
npx cap sync android
```

### Step 4: Open in Android Studio (Optional)
```bash
npx cap open android
```

---

## 4. Android Manifest Permissions (`android/app/src/main/AndroidManifest.xml`)

Ensure your `AndroidManifest.xml` includes the required native permissions for Microphone voice AI, Notifications, and Network access:

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.sarthi.app">

    <!-- Network Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <!-- Voice AI & Audio Recording Permissions -->
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />

    <!-- Notification Permissions (Android 13+) -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="SARTHI"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme">

        <activity
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|layoutDirection|fontScale|screenLayout|density|uiMode"
            android:name=".MainActivity"
            android:label="SARTHI"
            android:launchMode="singleTask"
            android:exported="true"
            android:theme="@style/AppTheme.NoActionBarLaunch">

            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

---

## 5. Building Android APK & AAB Packages

### Build Debug APK (For Testing)
```bash
cd android
./gradlew assembleDebug
```
*Output location*: `android/app/build/outputs/apk/debug/app-debug.apk`

### Build Release Signed APK (For Beta Side-Loading)
```bash
cd android
./gradlew assembleRelease
```
*Output location*: `android/app/build/outputs/apk/release/app-release-unsigned.apk`

### Build Play Store Release AAB (Android App Bundle)
```bash
cd android
./gradlew bundleRelease
```
*Output location*: `android/app/build/outputs/bundle/release/app-release.aab`

---

## 6. Icon and Splash Screen Generation
To automatically generate all required Android `mipmap` icon density folders (`hdpi`, `xhdpi`, `xxhdpi`, `xxxhdpi`) and splash screens from a single icon asset:
```bash
npm install -D @capacitor/assets
npx capacitor-assets generate --iconAvailable /public/icon-1024.png
```

---

## 7. Verification Summary
- [x] Capacitor core & Android packages installed.
- [x] `capacitor.config.ts` configured (`com.sarthi.app`, `SARTHI`, `dist`).
- [x] Vite web build compatibility verified.
- [x] Android permissions configured (Microphone, Notifications, Internet).
- [x] Documentation generated for sync, APK, and AAB workflows.
