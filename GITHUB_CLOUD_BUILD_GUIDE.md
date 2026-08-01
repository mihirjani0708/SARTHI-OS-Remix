# SARTHI OS v1.0 — GitHub Cloud Build & Automated CI/CD Guide

This guide describes the automated GitHub Actions CI/CD workflow configured in `.github/workflows/android-build.yml` to compile and release Android APK and AAB packages in the cloud without requiring a local Android Studio setup.

---

## 1. GitHub Actions Workflow Overview

The `.github/workflows/android-build.yml` pipeline automatically builds SARTHI OS on GitHub-hosted cloud runners (`ubuntu-latest`).

### Workflow Triggers
1. **Push to `main` branch**: Runs automatically on every push or merged PR.
2. **Git Tag Creation (`v*`)**: Triggered when a new version tag is created (e.g. `v1.0.0`).
3. **Manual Trigger (`workflow_dispatch`)**: Can be run manually anytime from the **Actions** tab in GitHub.

---

## 2. Automated Build Pipeline Steps

1. **Environment Provisioning**:
   - Checks out repository source code.
   - Provisions Node.js 20 with `npm` caching.
   - Provisions Java JDK 17 (Temurin).
   - Sets up Android SDK Tools & Build Tools 34.0.0.
2. **Web & Native Compilation**:
   - Executes `npm ci` to install pinned dependencies.
   - Executes `npm run build` to compile TypeScript & Vite into `dist/`.
   - Executes `npx cap sync android` to sync web bundle & permissions into native `android/` project.
3. **Android Gradle Package Generation**:
   - Runs `./gradlew assembleRelease` to produce `app-release-unsigned.apk`.
   - Runs `./gradlew bundleRelease` to produce `app-release.aab`.
4. **Artifact Upload**:
   - Saves `sarthi-release-apk` and `sarthi-release-aab` as downloadable workflow artifacts for 90 days.
5. **Release Publishing (On Version Tag)**:
   - When a tag like `v1.0.0` is pushed, it automatically creates a GitHub Release and attaches the generated APK and AAB binaries alongside `RELEASE_NOTES_v1.0.md`.

---

## 3. How to Download APK and AAB Artifacts

1. Navigate to your GitHub repository on GitHub.com.
2. Click on the **Actions** tab at the top.
3. Select the latest run under **Build SARTHI Android APK & AAB**.
4. Scroll down to the **Artifacts** section at the bottom of the summary page.
5. Click **`sarthi-release-apk`** to download the side-loadable `.apk` file.
6. Click **`sarthi-release-aab`** to download the Play Store `.aab` bundle.

---

## 4. How to Publish a GitHub Release

### Option A: Via Git Tag (Automated)
Run the following commands in your terminal:
```bash
git tag v1.0.0
git push origin v1.0.0
```
GitHub Actions will automatically build the native binaries and create a published release on the GitHub **Releases** page.

### Option B: Manual Release Creation
1. Go to your repository's **Releases** section on GitHub.
2. Click **Draft a new release**.
3. Select or create tag `v1.0.0`.
4. Upload `app-release-unsigned.apk` and `app-release.aab` from your local build or downloaded workflow artifacts.
5. Paste contents of `RELEASE_NOTES_v1.0.md` as the release description.
6. Click **Publish release**.
