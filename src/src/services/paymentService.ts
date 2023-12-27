import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../redux/store";
import { paymentUrl } from "../config/variables";

export interface ManualCreditOrDebitRequest {
  id: string;
  payload: {
    amount: number;
    debitCredit: string;
    remarks: string;
    valueDate: string;
  };
}

export interface ManualCreditOrDebitResponse {
  data: Payment[];
}
export interface CurrencyPairRequest {
  currency: string | undefined;
}

export interface Payment {
  accountBalanceId: string;
  accountId: string;
  accountingResult: string;
  chargeBearer: string;
  createdAt: string;
  createdBy: string;
  creditAmount: number;
  creditCurrency: string;
  creditor: { creditorName: string };
  creditorAccount: string;
  creditorAccountType: string;
  creditorAgent: { creditorAgentId: string };
  debitAmount: null;
  debtorAccount: string;
  debtorAccountType: string;
  debtorAgent: { debtorAgentId: string };
  endToEndReference: string;
  exitStatusCode: string;
  fees: {
    actualInvoiceFee: number;
    actualLiftingFee: number;
    invoiceAmount: number;
    invoiceCurrency: string;
    invoiceFeeMethod: string;
    liftingFeeAmount: number;
    liftingFeeCurrency: string;
    liftingFeeMethod: string;
    pricingProfileId: string;
  };
  debtor?: {
    debtorName: string;
  };
  debitCurrency?: string;
  id: string;
  instructionPriority: string;
  instructionReceivedDate: string;
  instructionReference: string;
  isDuplicate: boolean;
  isOutbound: boolean;
  isReturn: boolean;
  isTreasury: boolean;
  messageState: string;
  messageType: string;
  messageValidationResult: string;
  originalInstructedAmount: string;
  ownerEntityId: string;
  processFlow: string;
  reference: {
    settlementVendorId: string;
    debtorCurrencyType: "fiat" | "crypto";
  };
  remittanceInformation: string;
  requestedValueDate: string;
  settlementChannel: string;
  transactionReference: string;
  uetr: string;
  updatedAt: string;
  valueDate: string;
  vendorAccountId: string;
  vendorBalanceId: string;
  foreignExchange: {
    allInRate: string;
  };
  internalPayment: boolean;
}

export const paymentApi = createApi({
  reducerPath: "paymentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: paymentUrl,
    prepareHeaders: (headers, { getState }) => {
      // By default, if we have a token in the store, let's use that for authenticated requests
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    }
  }),
  tagTypes: ["Transactions"],
  endpoints: (builder) => ({
    createNewPayment: builder.mutation<any, any>({
      query: (args) => {
        console.log(paymentUrl);
        return {
          url: `payments`,
          method: "post",
          body: args
        };
      }
    }),
    createManualCreditOrDebit: builder.mutation<
      ManualCreditOrDebitResponse,
      ManualCreditOrDebitRequest
    >({
      query: ({ id, payload }) => ({
        url: `${id}/balance-adjustment`,
        method: "POST",
        body: payload
      }),
      invalidatesTags: ["Transactions"]
    }),
    // ToDo: change any to corresponding type
    getCurrencyPair: builder.query<any, any>({
      query: ({ currency, mainCurrency }) => {
        const queryParam = mainCurrency ? `?mainCurrency=${mainCurrency}` : "";
        return {
          url: `payments/currency-pair/${currency}${queryParam}`,
          method: "GET"
        };
      }
    }),
    getPaymentDetails: builder.query<any, any>({
      query: (args) => {
        const {
          entityId,
          accountId,
          currencyPair,
          direction,
          type,
          priority,
          amount,
          creditorAccountId,
          beneficiaryId
        } = args;
        return {
          url: `payments/${entityId}/${accountId}/${currencyPair}`,
          method: "GET",
          params: {
            direction,
            type,
            priority,
            amount,
            creditorAccountId,
            beneficiaryId,
            source: "bms"
          }
        };
      }
    })
  })
});

export const {
  useCreateNewPaymentMutation,
  useCreateManualCreditOrDebitMutation,
  useGetCurrencyPairQuery,
  useGetPaymentDetailsQuery
} = paymentApi;
