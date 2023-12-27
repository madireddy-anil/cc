import { EFXOrderFinancials, VendorLeg } from "@payconstruct/pp-types";

export type DepositsType = {
  depositAmount: number;
  accountId: string;
  maxCapacity?: number;
  maxShotSize?: number;
  balancePreDeposit: number;
  balanceId: string;
};

export type VendorType = {
  pair: string;
  counterparty: string;
  rate: string;
  buyAmount: string;
  buyCurrency: string;
  sellAmount: string;
  sellCurrency: string;
  deposits: Array<DepositsType>;
  internalRate: string;
  spread: number;
  profit: number;
  name: string;
};

export type ClientType = {
  counterparty: string;
  buyAmount: string;
  buyCurrency: string;
  sellAmount: string;
  sellCurrency: string;
  pair: string;
  spread: number;
  profit: number;
  internalRate: string;
  rate: string;
};

// export type LegType = {
//   vendor: Array<VendorType>;
//   client: ClientType;
// };

// export type RouteType = {
//   exchange: LegType;
//   local?: LegType;
// };

export type { EFXOrderFinancials, VendorLeg };
