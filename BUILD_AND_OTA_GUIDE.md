# SARTHI OS v1.0 — Cloud APK / AAB Build & OTA Guide

This document outlines the cloud build pipelines and Over-The-Air (OTA) update mechanism for **SARTHI OS**.

---

## 1. Cloud Build Pipelines

### A. PWABuilder Cloud Build (Easiest - 1 Click)
1. Deploy SARTHI OS web build to your production domain (e.g. `https://sarthi.app`).
2. Visit [PWABuilder.com](https://www.pwabuilder.com).
3. Enter your web application URL (`https://sarthi.app`).
4. Click **Package for Android**.
5. PWABuilder automatically validates `manifest.json`, `sw.js`, and icon assets, then generates signed `.apk` (for side-loading) and `.aab` (for Google Play Store).

### B. GitHub Actions Automated Pipeline
The repository includes automated CI/CD build scripts in `ANDROID_BUILD_GUIDE.md`. Every push to `main` executes:
- `npm run build`
- `bubblewrap build --manifest=./twa-manifest.json`
- Generates `app-release-signed.apk` and `app-release-bundle.aab`.

---

## 2. Versioning & Update Strategy

- **Version Name**: `1.0.0`
- **Version Code**: `1`
- **Application ID**: `com.sarthi.app`

When releasing updates:
1. Increment `versionName` in `VERSION.json`, `public/manifest.json`, and `twa-manifest.json`.
2. Increment `versionCode` (e.g. `2`, `3`) for native binary updates.

---

## 3. Over-The-Air (OTA) Instant Web Updates

Because SARTHI OS runs on a **Trusted Web Activity (TWA)** / **WebAPK** container:
- **No Native Re-installation Needed**: Any front-end UI updates, bug fixes, or non-native code updates pushed to the web deployment server are instantly downloaded by the Service Worker (`sw.js`).
- **Cache Invalidation**: Updating `CACHE_NAME` in `public/sw.js` (e.g. `sarthi-os-v1.1`) causes client devices to purge old cached assets on next app launch and seamlessly fetch the updated bundle in the background.
- **Native binary re-builds** (new APK / AAB) are ONLY required when changing `packageId`, app name, launcher icons, or adding new native device permissions (e.g. camera, bluetooth).
