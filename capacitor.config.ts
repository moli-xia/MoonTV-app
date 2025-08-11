import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.moontv.app',
  appName: 'MoonTV',
  webDir: 'out',
  server: {
    url: 'http://45.142.166.74:3000',
    cleartext: true
  }
};

export default config;
