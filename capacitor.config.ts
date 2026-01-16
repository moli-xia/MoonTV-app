import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.moontv.app',
  appName: '月光TV',
  webDir: 'out',
  server: {
    url: 'http://129.154.52.248:3000',
    cleartext: true
  },
  plugins: {
    ScreenOrientation: {
      lock: false
    },
    StatusBar: {
      style: 'dark',
      overlaysWebView: false
    }
  }
};

export default config;
