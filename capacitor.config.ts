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
