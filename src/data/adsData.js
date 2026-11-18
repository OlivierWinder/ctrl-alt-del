/** Fake ad images — timers start only after desktop is active. */

export const FIRST_AD_DELAY_MS = 10 * 1000;
export const NEXT_AD_MIN_MS = 30 * 1000;
export const NEXT_AD_MAX_MS = 60 * 1000;

export const fakeAds = [
  '/RESOURCES/ads/ad_01.png',
  '/RESOURCES/ads/ad_02.png',
  '/RESOURCES/ads/ad_03.png',
  '/RESOURCES/ads/ad_04.png',
  '/RESOURCES/ads/ad_05.png',
  '/RESOURCES/ads/ad_06.png',
  '/RESOURCES/ads/ad_07.png',
  '/RESOURCES/ads/ad_08.png',
  '/RESOURCES/ads/ad_09.png',
  '/RESOURCES/ads/ad_10.png',
  '/RESOURCES/ads/ad_11.png',
  '/RESOURCES/ads/ad_12.png',
  '/RESOURCES/ads/ad_13.png',
];

export const adDictionPrompt = {
  id: 'AD_DICTION',
  title: 'ad-diction',
  message: 'ad detected',
  icon: '/RESOURCES/icon_adblocker.png',
  actions: [
    { id: 'more_info', label: 'more info...' },
  ],
};

export const offGridPrompt = {
  id: 'OFF_GRID',
  title: 'ad-diction',
  message:
    'IMPORTANT: Ads can not legally be blocked in this dystopian economy, but we can block your internet connection entirely. Wish to continue off the grid?',
  icon: '/RESOURCES/icon_adblocker.png',
  actions: [
    { id: 'yes', label: 'Yes' },
    { id: 'no', label: 'No' },
  ],
};

export function randomEuroPerAd() {
  return 50 + Math.floor(Math.random() * 51);
}

export function randomNextAdDelay() {
  return NEXT_AD_MIN_MS + Math.random() * (NEXT_AD_MAX_MS - NEXT_AD_MIN_MS);
}
