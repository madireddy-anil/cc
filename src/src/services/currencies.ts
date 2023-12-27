import { accountApi as apiUrl } from "./accountService";

export interface CurrenciesResponse {
  data: any;
}

export interface Currency {
  code: string;
  createdAt: string;
  currencyAccount: string;
  currencyReference: string;
  decimals: string;
  deposits: string;
  id: string;
  name: string;
  numericCode: string;
  mainCurrency: string;
  payments: string;
  restrictedDeposits: string;
  type: string;
  updatedAt: string;
}

export const currenciesApi = apiUrl.injectEndpoints({
  endpoints: (builder) => ({
    getCurrencies: builder.query<CurrenciesResponse, any>({
      query: () => {
        return {
          url: "currencies?limit=0",
          method: "GET"
        };
      }
    })
  })
});

export const { useGetCurrenciesQuery } = currenciesApi;
