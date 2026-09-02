/** Fullscreen fake ad images — timers start only after desktop is active. */

export const FIRST_AD_DELAY_MS = 10 * 1000;
export const NEXT_AD_MIN_MS = 30 * 1000;
export const NEXT_AD_MAX_MS = 60 * 1000;

export const fakeAds = [
  '/RESOURCES/ads/ad_01.jpg',
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
  '/RESOURCES/ads/ad_14.png',
  '/RESOURCES/ads/ad_15.png',
  '/RESOURCES/ads/ad_16.png',
  '/RESOURCES/ads/ad_17.png',
  '/RESOURCES/ads/ad_18.png',
  '/RESOURCES/ads/ad_19.png',
  '/RESOURCES/ads/ad_20.png',
  '/RESOURCES/ads/ad_21.png',
];

export const onlineOfflinePrompt = {
  id: 'ONLINE_OFFLINE',
  title: 'CONNECTION STATUS',
  message: 'Do you want to stay offline, or go online?',
  once: true,
  icon: '/RESOURCES/internet_connection_wiz.png',
  actions: [
    { id: 'offline', label: 'Offline' },
    { id: 'online', label: 'Online' },
  ],
};

export function randomNextAdDelay() {
  return NEXT_AD_MIN_MS + Math.random() * (NEXT_AD_MAX_MS - NEXT_AD_MIN_MS);
}
