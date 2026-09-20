"use client";

import { useMemo } from "react";

import { useWorkspace } from "@/hooks/auth/use-workspace";
import { useOrganizationSettings } from "@/hooks/settings/use-organization-settings";
import {
  formatCurrency as formatCurrencyValue,
  SUPPORTED_CURRENCIES,
  type SupportedCurrency,
} from "@/lib/currencies";

function isSupportedCurrency(
  value: string | null | undefined,
): value is SupportedCurrency {
  return (
    value !== undefined &&
    value !== null &&
    SUPPORTED_CURRENCIES.includes(value as SupportedCurrency)
  );
}

export function useCurrency() {
  const { activeMembership } = useWorkspace();

  const organizationId = activeMembership?.organizationId;

  const { data: organization, isLoading } =
    useOrganizationSettings(organizationId);

  const currency: SupportedCurrency = isSupportedCurrency(
    organization?.currency,
  )
    ? organization.currency
    : "PHP";

  const formatCurrency = useMemo(() => {
    return (amount: number) => formatCurrencyValue(amount, currency);
  }, [currency]);

  return {
    currency,
    formatCurrency,
    isLoading,
  };
}
