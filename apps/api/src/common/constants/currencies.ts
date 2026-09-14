export const SUPPORTED_CURRENCIES = [
  'PHP',
  'USD',
  'EUR',
  'GBP',
  'AUD',
  'CAD',
  'SGD',
  'MYR',
  'JPY',
] as const;

export type SupportedCurrency =
  (typeof SUPPORTED_CURRENCIES)[number];