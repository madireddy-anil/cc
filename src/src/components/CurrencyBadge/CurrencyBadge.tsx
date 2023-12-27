import React from "react";
import { Icon, Text, Colors } from "@payconstruct/design-system";

interface CurrencyBadgeProps {
  currency: "EUR" | "GBP" | "CNY";
}

export const CurrencyBadge: React.FC<CurrencyBadgeProps> = ({ currency }) => {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        borderRadius: 20,
        paddingRight: 8,
        backgroundColor: Colors.grey.outlineLight
      }}
    >
      <Icon name={`flag${currency}`} size="medium" />
      <Text
        size="small"
        weight="bold"
        isTextUppercase
        color={Colors.grey.neutral700}
        label={currency}
      />
    </div>
  );
};
