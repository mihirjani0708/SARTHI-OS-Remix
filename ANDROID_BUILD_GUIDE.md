# SARTHI OS v1.0.0 — Android APK & AAB Packaging Guide

This guide details the complete, automated workflow to package SARTHI OS into an Android APK (for Closed Beta side-loading) and AAB (Android App Bundle for Google Play Store release) using **Trusted Web Activity (TWA)** / **Bubblewrap**.

---

## 1. Prerequisites
- **Node.js**: v18 or v20+
- **JDK**: Java 17 LTS or higher
- **Android SDK**: Build Tools `34.0.0` or higher
- **Bubblewrap CLI**: `@bubblewrap/cli`

---

## 2. Fast-Track APK Build via Bubblewrap CLI

### Step 1: Install Bubblewrap
```bash
npm install -g @bubblewrap/cli
```

### Step 2: Initialize or Use Existing TWA Manifest
The project includes a pre-configured `twa-manifest.json` at root. To validate:
```bash
bubblewrap validate
```

### Step 3: Generate Android Project
```bash
bubblewrap init --manifest=https://sarthi.app/manifest.json
```
or generate directly from local `twa-manifest.json`:
```bash
bubblewrap build
```

---

## 3. GitHub Actions CI/CD Automated Workflow

Create `.github/workflows/android-build.yml` in your repository:

```yaml
name: Build SARTHI Android APK & AAB

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build-android:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Setup Java JDK
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'

      - name: Install Bubblewrap CLI
        run: npm install -g @bubblewrap/cli

      - name: Build Web Application
        run: |
          npm ci
          npm run build

      - name: Build Android APK
        run: bubblewrap build

      - name: Upload APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: sarthi-release-apk
          path: app-release-signed.apk
```

---

## 4. Digital Asset Links Verification (`.well-known/assetlinks.json`)

To run the Android app in full-screen standalone mode without a browser URL bar, ensure `/public/.well-known/assetlinks.json` matches your keystore SHA-256 fingerprint:

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.sarthi.app",
      "sha256_cert_fingerprints": [
        "YOUR_KEYSTORE_SHA256_FINGERPRINT"
      ]
    }
  }
]
```

---

## 5. Play Store Readiness Checklist
- [x] Package Name: `com.sarthi.app`
- [x] Version: `1.0.0` (Version Code `1`)
- [x] Icons: 16x16 up to 512x512 + SVG Maskable Icon
- [x] Theme Color: `#1E3A8A` (Deep Blue)
- [x] Background Color: `#FFFFFF`
- [x] Orientation: `portrait`
- [x] Permissions: Microphone (`RECORD_AUDIO`), Web Notifications (`POST_NOTIFICATIONS`)
- [x] Service Worker: Caching `v1.0` with offline fallback
- [x] PWA Manifest: Full compliance with WebAPK standards
