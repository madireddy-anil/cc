import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../redux/store";
import { ratesApiUrl } from "../config/variables";
import { Rate } from "@payconstruct/pp-types";

export interface RatesResponse {
  vendorRates: Rate[];
}
export interface RatePost {
  vendorId: string;
  pair: string;
  rate: number;
  expiresAt: string;
  vendorName: string;
}

export const rateApi = createApi({
  reducerPath: "rateApi",
  keepUnusedDataFor: 5,
  tagTypes: ["Rates", "Rate"],
  baseQuery: fetchBaseQuery({
    baseUrl: ratesApiUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    }
  }),
  endpoints: (builder) => ({
    getAllRates: builder.query<RatesResponse, {}>({
      query: () => {
        return {
          url: `rates`,
          method: "GET"
        };
      },
      providesTags: (result) => {
        if (result && result.vendorRates) {
          return [
            ...result.vendorRates.map(({ vendorId, pair }) => ({
              type: "Rates" as const,
              id: `${vendorId}-${pair}` //To reset a specific rate
            })),
            { type: "Rates", id: "LIST" } // To reset All Rates
          ];
        }
        // If no rates are returned, we still need to provide a tag
        return [{ type: "Rates", id: "LIST" }];
      }
    }),
    setRates: builder.mutation<RatePost, RatePost>({
      query: (credentials) => ({
        url: "rates",
        method: "POST",
        body: credentials
      }),
      invalidatesTags: (result, error, { pair, vendorId }) => [
        { type: "Rates", id: `${vendorId}-${pair}` }
      ]
    })
  })
});

export const { useGetAllRatesQuery, useSetRatesMutation } = rateApi;
