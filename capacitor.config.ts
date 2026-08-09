import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sweetrepostery.app',
  appName: 'MAREA dulce',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#FFFFFF",
      showSpinner: true,
      androidSpinnerStyle: "large",
      spinnerColor: "#6C5CE7",
    },
    Keyboard: {
      resize: 'body',
      style: 'light',
    }
  }
};

export default config;
