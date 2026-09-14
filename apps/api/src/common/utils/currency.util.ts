import {
  SUPPORTED_CURRENCIES,
  SupportedCurrency,
} from '../constants/currencies';

export function isSupportedCurrency(
  currency: string,
): currency is SupportedCurrency {
  return SUPPORTED_CURRENCIES.includes(
    currency as SupportedCurrency,
  );
}