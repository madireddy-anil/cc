import { Notification } from "@payconstruct/design-system";
export const isCurrencyPresent = (currency: string) => {
  const currencies = [
    "AOA",
    "BTC",
    "BCH",
    "CNY",
    "EUR",
    "ETB",
    "ETH",
    "GBP",
    "IDR",
    "INR",
    "JPY",
    "LTC",
    "USD",
    "USDT",
    "USDC",
    "VND",
    "MYR",
    "PHP",
    "SGD",
    "THB",
    "TST",
    "ZAR",
    "NGN",
    "PLN",
    "NOK",
    "SEK",
    "DKK",
    "CHF",
    "CZK",
    "HUF",
    "RON",
    "CAD"
  ];
  if (currencies.includes(currency)) {
    return currency as
      | "AOA"
      | "BTC"
      | "BCH"
      | "CNY"
      | "EUR"
      | "ETB"
      | "ETH"
      | "GBP"
      | "IDR"
      | "INR"
      | "JPY"
      | "LTC"
      | "USD"
      | "USDT"
      | "USDC"
      | "VND"
      | "MYR"
      | "PHP"
      | "SGD"
      | "THB"
      | "TST"
      | "ZAR"
      | "NGN"
      | "PLN"
      | "NOK"
      | "SEK"
      | "DKK"
      | "CHF"
      | "CZK"
      | "HUF"
      | "RON"
      | "CAD";
  }
  return undefined;
};

export const setNotification = (
  message: string,
  description: string,
  type: any
) => {
  return Notification({ message, description, type });
};
