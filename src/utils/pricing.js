export const SUBSCRIPTION_PRICE_INR = 499;

const EURO_REGIONS = [
  'AT', 'BE', 'CY', 'DE', 'EE', 'ES', 'FI', 'FR', 'GR', 'HR', 'IE', 'IT',
  'LT', 'LU', 'LV', 'MT', 'NL', 'PT', 'SI', 'SK',
];

const REGION_CURRENCY = {
  IN: 'INR',
  US: 'USD',
  GB: 'GBP',
  CA: 'CAD',
  AU: 'AUD',
  NZ: 'NZD',
  SG: 'SGD',
  AE: 'AED',
  SA: 'SAR',
  QA: 'QAR',
  KW: 'KWD',
  BH: 'BHD',
  OM: 'OMR',
  JP: 'JPY',
  KR: 'KRW',
  CN: 'CNY',
  HK: 'HKD',
  MY: 'MYR',
  TH: 'THB',
  PH: 'PHP',
  ID: 'IDR',
  VN: 'VND',
  NP: 'NPR',
  BD: 'BDT',
  PK: 'PKR',
  LK: 'LKR',
  ZA: 'ZAR',
  NG: 'NGN',
  KE: 'KES',
  BR: 'BRL',
  MX: 'MXN',
  TR: 'TRY',
};

EURO_REGIONS.forEach(region => {
  REGION_CURRENCY[region] = 'EUR';
});

const TIMEZONE_CURRENCY = {
  'Asia/Calcutta': 'INR',
  'Asia/Kolkata': 'INR',
  'Europe/London': 'GBP',
  'Europe/Dublin': 'EUR',
  'Asia/Dubai': 'AED',
  'Asia/Singapore': 'SGD',
  'Asia/Tokyo': 'JPY',
  'Asia/Seoul': 'KRW',
  'Australia/Sydney': 'AUD',
  'Pacific/Auckland': 'NZD',
};

const TIMEZONE_PREFIX_CURRENCY = {
  'America/': 'USD',
  'Europe/': 'EUR',
  'Australia/': 'AUD',
};

const INR_TO_CURRENCY_RATE = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0095,
  CAD: 0.016,
  AUD: 0.018,
  NZD: 0.02,
  SGD: 0.016,
  AED: 0.044,
  SAR: 0.045,
  QAR: 0.044,
  KWD: 0.0037,
  BHD: 0.0045,
  OMR: 0.0046,
  JPY: 1.8,
  KRW: 16.2,
  CNY: 0.086,
  HKD: 0.093,
  MYR: 0.056,
  THB: 0.44,
  PHP: 0.68,
  IDR: 190,
  VND: 305,
  NPR: 1.6,
  BDT: 1.4,
  PKR: 3.35,
  LKR: 3.6,
  ZAR: 0.21,
  NGN: 16,
  KES: 1.55,
  BRL: 0.066,
  MXN: 0.22,
  TRY: 0.39,
};

const DECIMAL_CURRENCIES = new Set(['KWD', 'BHD', 'OMR']);

function getBrowserLocales() {
  if (typeof navigator === 'undefined') return ['en-IN'];
  if (Array.isArray(navigator.languages) && navigator.languages.length) {
    return navigator.languages;
  }
  return [navigator.language || 'en-IN'];
}

function getBrowserTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  } catch {
    return '';
  }
}

function getRegionFromLocale(locale) {
  if (!locale) return '';
  try {
    if (typeof Intl.Locale === 'function') {
      return new Intl.Locale(locale).region || '';
    }
  } catch {
    // Fall through to regex parsing.
  }

  const match = String(locale).match(/[-_]([A-Z]{2}|\d{3})\b/i);
  return match ? match[1].toUpperCase() : '';
}

function resolveCurrency(locales = getBrowserLocales(), timeZone = getBrowserTimeZone()) {
  for (const locale of locales) {
    const region = getRegionFromLocale(locale);
    if (region && REGION_CURRENCY[region]) return REGION_CURRENCY[region];
  }

  if (TIMEZONE_CURRENCY[timeZone]) return TIMEZONE_CURRENCY[timeZone];

  const prefix = Object.keys(TIMEZONE_PREFIX_CURRENCY).find(key => timeZone.startsWith(key));
  if (prefix) return TIMEZONE_PREFIX_CURRENCY[prefix];

  return 'INR';
}

function roundLocalAmount(amount, currency) {
  if (currency === 'INR') return SUBSCRIPTION_PRICE_INR;
  if (DECIMAL_CURRENCIES.has(currency)) return Math.ceil(amount * 10) / 10;
  if (amount < 1) return 1;
  if (amount < 100) return Math.round(amount);
  if (amount < 1000) return Math.round(amount / 10) * 10;
  return Math.round(amount / 100) * 100;
}

export function formatCurrency(amount, currency, locale = 'en-IN') {
  const hasDecimals = !Number.isInteger(amount);
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: hasDecimals ? 1 : 0,
    maximumFractionDigits: hasDecimals ? 1 : 0,
  }).format(amount);
}

export function getLocalizedSubscriptionPrice(locales = getBrowserLocales()) {
  const locale = locales[0] || 'en-IN';
  const currency = resolveCurrency(locales);
  const rate = INR_TO_CURRENCY_RATE[currency] || INR_TO_CURRENCY_RATE.USD;
  const amount = roundLocalAmount(SUBSCRIPTION_PRICE_INR * rate, currency);
  const baseFormatted = formatCurrency(SUBSCRIPTION_PRICE_INR, 'INR', 'en-IN');
  const formatted = formatCurrency(amount, currency, locale);

  return {
    amount,
    currency,
    locale,
    formatted,
    baseFormatted,
    isInr: currency === 'INR',
    monthlyLabel: `${formatted}/month`,
    shortMonthlyLabel: `${formatted}/mo`,
    checkoutNote: currency === 'INR'
      ? 'Billed monthly'
      : `Approx. local price. Checkout is billed as ${baseFormatted}.`,
  };
}
