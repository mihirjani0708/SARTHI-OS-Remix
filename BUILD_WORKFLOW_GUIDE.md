# SARTHI OS v1.0 — GitHub Actions APK Build Workflow Guide

This guide details how to use the GitHub Actions automated workflow (`.github/workflows/android-build.yml`) to compile, troubleshoot, and download Android APK release builds in the cloud.

---

## 1. Workflow Architecture & Configuration

The automated build pipeline runs on `ubuntu-latest` GitHub cloud runners with the following environment setup:
- **Runner OS**: Ubuntu Latest
- **Node.js**: v20 LTS with `npm` dependency caching
- **Java JDK**: v17 (Temurin) with `gradle` build caching
- **Android SDK**: Build Tools 34.0.0
- **Capacitor Sync**: Automatically syncs Vite compiled `dist/` bundle into `android/app/src/main/assets/public/`
- **Gradle Build**: Compiles release APK and AAB binaries using `./gradlew assembleRelease` and `./gradlew bundleRelease`

---

## 2. How to Trigger the Workflow

### Method A: Automatic Trigger on Code Push
- Push any commit to the **`main`** branch. The workflow will automatically start building the updated APK.
- Create or push a version tag (e.g. `git tag v1.0.0 && git push origin v1.0.0`) to trigger both the build and an automated GitHub Release entry.

### Method B: Manual Trigger (`workflow_dispatch`)
1. Go to your repository on GitHub.com.
2. Click the **Actions** tab at the top menu bar.
3. In the left sidebar, click **Build SARTHI Android APK & AAB**.
4. Click the **Run workflow** dropdown button on the right side.
5. Select the target branch (`main`) and click **Run workflow**.

---

## 3. Where to Download the APK

1. On the **Actions** tab, click on the specific workflow run name (e.g., *Build SARTHI Android APK & AAB #1*).
2. Scroll down to the bottom **Artifacts** section of the Summary page.
3. Download **`sarthi-release-apk`** (contains `app-release-unsigned.apk`).
4. Download **`sarthi-release-aab`** (contains `app-release.aab` for Play Store).
5. Unzip the downloaded file and install `app-release-unsigned.apk` directly onto any Android device (enabling "Install from Unknown Sources" if prompted).

---

## 4. How to Identify & Troubleshoot Build Failures

If a workflow run fails (marked with a red ❌ icon):

1. **Locate Failed Step**: Click on the failed workflow run, then click on the **build-android** job on the left panel.
2. **Expand Log Section**: Click on the step with the red cross (e.g. *Build Web Application* or *Build Unsigned Release APK*).
3. **Common Failure Points & Fixes**:
   - **TypeScript / Vite Compilation Error**: Check logs under *Build Web Application*. Ensure `npm run build` succeeds locally without type errors.
   - **Capacitor Sync Discrepancy**: Check logs under *Sync Capacitor Android*. Ensure `dist/` directory exists and `capacitor.config.ts` matches `appName` and `appId`.
   - **Gradle Permission Error**: Ensure `chmod +x android/gradlew` step runs prior to `./gradlew assembleRelease`.
   - **Missing Asset / Memory OOM**: Gradle caches speed up consecutive builds; if out of memory occurs, Gradle flags `--stacktrace` will output the precise stacktrace in the logs.

---

## 5. Summary & Verification Matrix

| Parameter | Configuration / Value |
| :--- | :--- |
| **Workflow File** | `/.github/workflows/android-build.yml` |
| **APK Artifact Path** | `android/app/build/outputs/apk/release/app-release-unsigned.apk` |
| **AAB Artifact Path** | `android/app/build/outputs/bundle/release/app-release.aab` |
| **Java JDK** | Java 17 Temurin |
| **Node.js** | Node 20 LTS |
| **Capacitor Version** | 6.0+ |
| **GitHub Actions Readiness** | ✅ 100% Configured & Verified |
