export const expoConfig = {
  scheme: 'myapp',
  name: 'SpotMe',
  slug: 'SpotMe',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/images/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },

  assetBundlePatterns: ['**/*'],
  ios: {
    bundleIdentifier: 'com.anonymous.SpotMe',
    supportsTablet: true,
    infoPlist: {
      "UIBackgroundModes": [
        "location",
        "fetch",
        "remote-notification"
      ]
    }
  },
  android: {
    package: 'com.anonymous.SpotMe',
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    permissions: [
      "android.permission.ACCESS_COARSE_LOCATION",
      "android.permission.ACCESS_FINE_LOCATION",
      "android.permission.FOREGROUND_SERVICE"
    ],
    intentFilters: [
      {
        action: 'VIEW',
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    "expo-router",
    [
      "expo-location",
      {
        "locationAlwaysAndWhenInUsePermission": "Allow Spot Me to use your location."
      }
    ]
  ],
  experiments: {
    typedRoutes: true
  },
  extra: {
    ...env.parsed,
  },
};

export default expoConfig;