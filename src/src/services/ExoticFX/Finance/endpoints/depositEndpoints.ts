import {
  AssignFundsRequest,
  SaveLegRequest,
  VendorDetailsResponse,
  DepositDetailsResponse,
  DepositResponse,
  financeApi,
  VendorDepositResponse,
  VendorDepositRequest
} from "../financeService";

export const api = financeApi.injectEndpoints({
  endpoints: (builder) => ({
    getDeposits: builder.query<VendorDetailsResponse, any>({
      query: ({ id }) => {
        return {
          url: `deposits/${id}`,
          method: "GET"
        };
      },
      providesTags: ["Deposits"]
    }),
    confirmDeposit: builder.mutation<any, any>({
      query: (confirmDepositPayload) => ({
        url: `confirm/deposit`,
        method: "POST",
        body: confirmDepositPayload
      }),
      invalidatesTags: ["Deposits"]
    }),
    getBatchRemittanceDeposits: builder.query<
      DepositResponse,
      { currency: string; vendorId: string }
    >({
      query: ({ currency, vendorId }) => {
        return {
          url: `deposits/status/pending_remittance`,
          method: "GET",
          params: {
            currency,
            vendorId
          }
        };
      }
    }),
    confirmRemittance: builder.mutation<any, any>({
      query: (confirmRemittancePayload) => ({
        url: `confirm/remittance`,
        method: "POST",
        body: confirmRemittancePayload
      }),
      invalidatesTags: ["Deposits"]
    }),
    depositDetail: builder.mutation<any, any>({
      query: (detailPayload) => ({
        url: `details`,
        method: "POST",
        body: detailPayload
      }),
      invalidatesTags: ["VendorDetails"]
    }),
    getDepositDetail: builder.query<
      DepositDetailsResponse,
      { id: string; currency: string }
    >({
      query: ({ id, currency }) => {
        return {
          url: `details/${id}?currency=${currency}`,
          method: "GET"
        };
      },
      providesTags: ["VendorDetails"]
    }),
    saveLeg: builder.mutation<
      SaveLegRequest,
      Partial<SaveLegRequest> & Pick<SaveLegRequest, "orderId">
    >({
      query: ({ orderId, ...legDetails }) => ({
        url: `saveLeg/${orderId}`,
        method: "POST",
        body: legDetails
      }),
      invalidatesTags: ["VendorDetails", "Deposits"]
    }),
    assignFunds: builder.mutation<
      AssignFundsRequest,
      Partial<AssignFundsRequest> & Pick<AssignFundsRequest, "orderId">
    >({
      query: ({ orderId, ...depositFundsPayload }) => ({
        url: `assign/${orderId}`,
        method: "POST",
        body: depositFundsPayload
      }),
      invalidatesTags: ["Deposits"]
    }),
    editDepositDetailsForVendor: builder.mutation<
      VendorDepositResponse,
      VendorDepositRequest
    >({
      query: (payload) => ({
        url: `details/${payload.vendorId}`,
        method: "PUT",
        body: payload
      })
      // invalidatesTags: ["Deposits"]
    })
  }),

  overrideExisting: true
});

export const {
  useGetDepositsQuery,
  useGetDepositDetailQuery,
  useConfirmDepositMutation,
  useConfirmRemittanceMutation,
  useGetBatchRemittanceDepositsQuery,
  useDepositDetailMutation,
  useAssignFundsMutation,
  useSaveLegMutation,
  useEditDepositDetailsForVendorMutation
} = api;
