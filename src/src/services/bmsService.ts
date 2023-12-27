import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../redux/store";
import { bmsServiceUrl } from "../config/variables";

export interface CountriesResponse {
  data: {
    country: any[];
  };
}

export const bmsApi = createApi({
  reducerPath: "bmsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: bmsServiceUrl,
    prepareHeaders: (headers, { getState }) => {
      // By default, if we have a token in the store, let's use that for authenticated requests
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    }
  }),
  endpoints: (builder) => ({
    getAccounts: builder.query<any, any>({
      query: () => {
        return {
          url: `accounts`,
          method: "GET"
        };
      }
    }),
    getCountries: builder.query<CountriesResponse, any>({
      query: () => {
        return {
          url: "countries?limit=0",
          method: "GET"
        };
      }
    }),
    getAccountCurrencies: builder.query({
      query: () => "currencies?limit=0"
    }),
    getVendorAccounts: builder.query({
      query: () => "accounts/vendor-accounts?limit=0"
    })
  })
});

export const {
  useGetCountriesQuery,
  useGetAccountsQuery,
  useGetAccountCurrenciesQuery,
  useGetVendorAccountsQuery
} = bmsApi;
