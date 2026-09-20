export const SUPPORTED_CURRENCIES = [
  "PHP",
  "USD",
  "EUR",
  "GBP",
  "AUD",
  "CAD",
  "SGD",
  "MYR",
  "JPY",
] as const;

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export function formatCurrency(
  amount: number,
  currency: SupportedCurrency = "PHP",
) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export const CURRENCY_OPTIONS: {
  value: SupportedCurrency;
  label: string;
}[] = [
  { value: "PHP", label: "PHP — Philippine Peso (₱)" },
  { value: "USD", label: "USD — US Dollar ($)" },
  { value: "EUR", label: "EUR — Euro (€)" },
  { value: "GBP", label: "GBP — British Pound (£)" },
  { value: "AUD", label: "AUD — Australian Dollar (A$)" },
  { value: "CAD", label: "CAD — Canadian Dollar (C$)" },
  { value: "SGD", label: "SGD — Singapore Dollar (S$)" },
  { value: "MYR", label: "MYR — Malaysian Ringgit (RM)" },
  { value: "JPY", label: "JPY — Japanese Yen (¥)" },
];
