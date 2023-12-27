import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../redux/store";
import { routesApiUrl } from "../config/variables";
import { EFXOrderFinancials } from "@payconstruct/pp-types";
import { Route } from "../config/trades/tradeSlice";
// import { RouteType } from "../pages/Trades/TradeOffer/RouteOptions/Components/RouteTypes";
type CurrencyResponse = string[];

type ExitCurrencyResponse = {
  currency: string;
  exitCurrencies: string[];
};

export interface IndicativeRateRates {
  expiresAt: string | null;
  inverseRate: string;
  quoteCurrency: string;
  rate: string;
  updatedAt: string;
}

export interface IndicativeRate {
  clientId: string;
  currency: string;
  rates: IndicativeRateRates[];
}

export interface IndicativeRateResponse {
  indicativeRate: IndicativeRate[];
}

export type RouteListResponse = {
  routes: Route[];
};

// Add missing indexes for SelectRoute Response
interface SelectRouteResponse extends Route {}

export const routesApi = createApi({
  reducerPath: "routesApi",
  baseQuery: fetchBaseQuery({
    baseUrl: routesApiUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    }
  }),
  tagTypes: ["Routes", "Price"],
  endpoints: (builder) => ({
    getExitCurrency: builder.query<ExitCurrencyResponse, { currency: string }>({
      query: ({ currency }) => {
        return {
          url: `currency/${currency}`,
          method: "GET"
        };
      }
    }),
    getRoutes: builder.query<CurrencyResponse, { orderId: string }>({
      query: ({ orderId }) => {
        return {
          url: `routes/calculate/${orderId}`,
          method: "GET"
        };
      },
      providesTags: ["Routes"]
    }),
    getRouteList: builder.query<RouteListResponse, { id: string }>({
      query: ({ id }) => {
        return {
          url: `routes/list/${id}`,
          method: "GET"
        };
      }
    }),
    getCalculatedRoutes: builder.query<RouteListResponse, { id: string }>({
      query: ({ id }) => ({
        url: `routes/calculate/${id}`,
        method: "GET"
      }),
      keepUnusedDataFor: 5
    }),
    resetRouteSelection: builder.mutation<any, { id: string }>({
      query: ({ id }) => ({
        url: `reset/${id}`,
        method: "POST"
      }),
      invalidatesTags: ["Routes"]
    }),
    adjustPrice: builder.mutation<
      EFXOrderFinancials,
      { id: string; payload: { exchange: number } }
    >({
      query: ({ id, payload }) => ({
        url: `price/${id}`,
        method: "PUT",
        body: payload
      })
    }),
    selectRoute: builder.mutation<
      SelectRouteResponse,
      { routeId: string; orderId: string }
    >({
      query: (selectRoutePayload) => ({
        url: "routes/select",
        method: "POST",
        body: selectRoutePayload
      }),
      invalidatesTags: (result, error, { orderId }) => [
        { type: "Price" as const, orderId }
      ]
    }),
    setPriceApprove: builder.mutation<RouteListResponse, { id: string }>({
      query: ({ id }) => ({
        url: `price/${id}/approve`,
        method: "POST"
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Price" as const, id }
      ]
    }),
    getFinancials: builder.query<EFXOrderFinancials, { id: string }>({
      query: ({ id }) => {
        console.log("EFX Order ID: ", id);
        return {
          url: `price/${id}`,
          method: "GET"
        };
      },
      keepUnusedDataFor: 5,
      providesTags: (result, error, { id }) => [{ type: "Price" as const, id }]
    }),
    getIndicativeRate: builder.query<
      IndicativeRateResponse,
      { clientId: string }
    >({
      query: ({ clientId }) => {
        return {
          url: `indicativeRate?${clientId ? "clientId=" + clientId : ""}`,
          method: "GET"
        };
      }
    })
  })
});
export const {
  useGetExitCurrencyQuery,
  useGetRoutesQuery,
  useGetRouteListQuery,
  useGetCalculatedRoutesQuery,
  useAdjustPriceMutation,
  useSelectRouteMutation,
  useSetPriceApproveMutation,
  useGetFinancialsQuery,
  useResetRouteSelectionMutation,
  useGetIndicativeRateQuery
} = routesApi;
