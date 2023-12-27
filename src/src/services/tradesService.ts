import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../redux/store";
import { tradeApiUrl } from "../config/variables";
import { EFXOrder } from "@payconstruct/pp-types";

export type CreateTradeResponse = {
  orderReference: string;
  id: string;
};
export interface TradeResponse {
  orders: EFXOrder[];
}

export interface OrderResponse {
  order: EFXOrder;
}

export const tradeApi = createApi({
  reducerPath: "tradeApi",
  baseQuery: fetchBaseQuery({
    baseUrl: tradeApiUrl,
    prepareHeaders: (headers, { getState }) => {
      // By default, if we have a token in the store, let's use that for authenticated requests
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    }
  }),
  tagTypes: ["Trade", "VendorDetails", "Deposits"],
  endpoints: (builder) => ({
    createTrade: builder.mutation<CreateTradeResponse, any>({
      query: (credentials) => ({
        url: "orders",
        method: "POST",
        body: credentials
      }),
      invalidatesTags: ["Trade"]
    }),
    acceptTrade: builder.mutation<CreateTradeResponse, any>({
      query: ({ id }) => ({
        url: `order/${id}/accept`,
        method: "POST"
      }),
      invalidatesTags: ["Trade"]
    }),
    rejectTrade: builder.mutation<CreateTradeResponse, any>({
      query: ({ id }) => ({
        url: `order/${id}/reject`,
        method: "POST"
      }),
      invalidatesTags: ["Trade"]
    }),
    getTrades: builder.query<TradeResponse, any>({
      query: () => {
        return {
          url: "orders",
          method: "GET"
        };
      }
    }),
    getTradeByID: builder.query<EFXOrder, { id: string }>({
      query: ({ id }) => {
        return {
          url: `order/${id}`,
          method: "GET"
        };
      },
      transformResponse: (response: OrderResponse) => {
        return response.order;
      },
      providesTags: ["Trade"]
    }),
    cancelOrder: builder.mutation<{ message: string }, any>({
      query: ({ id }) => ({
        url: `order/${id}/cancel`,
        method: "PUT"
      }),
      invalidatesTags: ["Trade"]
    }),
    requoteDeposit: builder.mutation<
      { message: string },
      { id: string; buyAmount: number }
    >({
      query: ({ id, buyAmount }) => ({
        url: `order/${id}/requote`,
        method: "PUT",
        body: { buyAmount }
      }),
      invalidatesTags: ["Trade"]
    })
  })
});
export const {
  useGetTradesQuery,
  useCreateTradeMutation,
  useAcceptTradeMutation,
  useRejectTradeMutation,
  useCancelOrderMutation,
  useGetTradeByIDQuery,
  useRequoteDepositMutation
} = tradeApi;
