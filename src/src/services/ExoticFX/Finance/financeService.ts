import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../../../redux/store";
import { financeApiUrl } from "../../../config/variables";

export interface TimeZone {
  value?: string;
  label?: string;
  offset: string;
  abbrev: string;
  altName: string;
}
export interface OrderDepositDetails {
  PK: string;
  SK: string;
  valueDate: string;
  currency: string;
  accountId: string;
  orderId: string;
  balanceId: string;
  status: "complete" | string;
  vendorId: string;
  remittanceDocument: string[];
  depositDocument: string[];
  depositedExchangeAmount: string;
  expectedRate: string;
  exchangedCurrency: string;
  exchangedAmount: string;
  batchId: string;
  remitted: string;
  deposited: string;
  expected: string;
  isFirstLeg: boolean;
  type: "exchange" | "local";
  key: string;
  accountNumber: string;
  country: string;
  instructions: string;
  notes: string;
  minAmount: number;
  maxAmount: number;
  time: string;
  timeZone: TimeZone;
  locked: boolean;
}

export interface OrderLegVendorDetails {
  name: string;
  expected: string;
  unassigned: number;
  leg: "exchange" | "local";
  vendorId: string;
  currency: string;
  locked: boolean;
  deposits: OrderDepositDetails[];
}

export interface DepositDetailsResponse {
  deposits: OrderDepositDetails[];
}

export interface VendorDetailsResponse {
  deposits: OrderLegVendorDetails[];
}

export interface DepositResponse {
  deposits: any[];
  orders: any[];
}

export interface AssignFundsRequest {
  orderId: string;
  id: string; // the uuid or accountNumber you select from the dropdown
  leg: "exchange" | "local"; // leg attached to modal
  vendorId: string; // vendor attached to modal
  amount: number; // input in modal
  currency: string; // ccy attached to modal
}

export interface VendorDepositRequest {
  vendorId: string;
  accountNumber?: string;
  instructions?: string;
  notes?: string;
  minAmount?: number;
  maxAmount?: number;
  time?: string;
  timeZone: string;
}

export interface VendorDepositResponse extends VendorDepositRequest {}

export interface SaveLegRequest {
  orderId: string;
  leg: "exchange" | "local";
  vendorId: string;
  currency: string;
}

export const financeApi = createApi({
  reducerPath: "financeApi",
  baseQuery: fetchBaseQuery({
    baseUrl: financeApiUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    }
  }),
  tagTypes: ["VendorDetails", "Deposits"],
  endpoints: () => ({})
});
