import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  Account as PPTypesAccount,
  BalanceUpdated
} from "@payconstruct/pp-types";
import { RootState } from "../redux/store";
import { currencyAccountsApi } from "../config/variables";

export interface Account extends Omit<PPTypesAccount, "accountIdentification"> {
  balance: BalanceUpdated; //Not Mapped
  isActiveAccount: boolean; // Not Mapped
  accountStatus: "active" | "inactive" | "closed" | "blocked";
  productId: string;
  productBrandId: string;
  accountIdentification: {
    accountRegion: string;
    accountNumber: string;
    bankCode: string;
    IBAN: string;
    BIC: string;
  };
  accountHolderName: string;
  accountAddress: string;
  issuerName: string;
  mainCurrency: string;
}
export interface AccountsResponse {
  data: Account[];
  accounts: Account[];
}

export interface AccountResponse {
  data: Account;
}

export interface AccountByEntityIdResponse {
  data: {
    accounts: Account[];
  };
}

export interface TransactionsResponse {
  data: Transaction[];
}

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

export interface Transaction {
  amount: string;
  availableBalance: string;
  balance: string;
  balanceId: string;
  blockUnblock: string;
  blockedBalance: string;
  correctedValueDate: string;
  createdAt: string;
  id: string;
  payments: Payment;
  reference: string;
  remarks: string;
  status: string;
  valueDate: string;
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

export interface CreateAccountResponse {
  status: "success" | "fail";
  data?: {
    title: string;
    message?: string;
  };
}

export const accountApi = createApi({
  reducerPath: "accountApi",
  baseQuery: fetchBaseQuery({
    baseUrl: currencyAccountsApi,
    prepareHeaders: (headers, { getState }) => {
      // By default, if we have a token in the store, let's use that for authenticated requests
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    }
  }),
  tagTypes: ["Account", "Transactions"],
  endpoints: (builder) => ({
    getAccounts: builder.query<any, any>({
      query: (args) => {
        const { pageNumber, pageSize, accountParams } = args;
        return {
          url: "accounts",
          params: { page: pageNumber, limit: pageSize, ...accountParams }
        };
      }
    }),
    getAccount: builder.query<AccountResponse, any>({
      query: ({ accountId }) => {
        return {
          url: `accounts/${accountId}`,
          method: "GET"
        };
      },
      providesTags: ["Account"]
    }),
    getAccountByEntityId: builder.query<
      AccountByEntityIdResponse,
      { entityId: string; accountType: "client" | "company" }
    >({
      query: ({ entityId, accountType }) => {
        // accounts?limit=50&page=1&accountType=client&ownerEntityId=501dde17-94fb-403e-bc40-ff47ff6c97e6
        return {
          url: `accounts?accountType=${accountType}&ownerEntityId=${entityId}`,
          method: "GET"
        };
      }
    }),
    getTransactions: builder.query<TransactionsResponse, { accountId: string }>(
      {
        query: ({ accountId }) => {
          return {
            url: `accounts/${accountId}/transactions`,
            method: "GET"
          };
        },
        providesTags: ["Transactions"]
      }
    ),
    getAccountVendors: builder.query({
      query: () => "accounts/vendor-accounts?&limit=0"
    }),
    updateAccount: builder.mutation<
      AccountResponse,
      { accountId: string; accountType: string; payload: object }
    >({
      query: ({ accountId, accountType, payload }) => ({
        url: `accounts/${accountType}/${accountId}`,
        method: "PUT",
        body: payload
      })
    }),

    createAccount: builder.mutation<
      CreateAccountResponse,
      {
        accountType:
          | "client"
          | "pl"
          | "vendor-client"
          | "vendor-pl"
          | "suspense";
        payload: object;
      }
    >({
      query: ({ accountType, payload }) => ({
        url: `accounts/${accountType}`,
        method: "POST",
        body: payload
      })
    }),
    getAllAccounts: builder.query<any, any>({
      query: ({ entityId }) => ({
        url: `accounts?ownerEntityId=${entityId}`,
        method: "GET"
      })
    }),
    getAccountStatement: builder.query({
      query: (args) => ({
        url: `accounts/statements?startDate=${args.startDate}&endDate=${args.endDate}&accountId=${args.id}`,
        method: "GET"
      })
    }),
    createManualCreditOrDebit: builder.mutation<
      ManualCreditOrDebitResponse,
      ManualCreditOrDebitRequest
    >({
      query: ({ id, payload }) => ({
        url: `accounts/${id}/balance-adjustment`,
        method: "POST",
        body: payload
      })
      // invalidatesTags: ["Transactions"]
    })
  })
});

export const {
  useGetAccountsQuery,
  useGetAccountQuery,
  useGetAccountByEntityIdQuery,
  useGetTransactionsQuery,
  useGetAccountVendorsQuery,
  useUpdateAccountMutation,
  useCreateAccountMutation,
  useGetAllAccountsQuery,
  useGetAccountStatementQuery,
  useCreateManualCreditOrDebitMutation
} = accountApi;
