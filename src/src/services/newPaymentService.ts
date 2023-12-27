import { accountApi as apiUrl } from "./accountService";

interface liftingFeeRequest {
  entityId: string;
  direction: string;
  type: string;
  priority: string;
  transactionCurrency: string;
}

export interface FxRateRequest {
  id: string;
  currencyPair: string;
  depositAmount: number;
}

export const newPaymentApi = apiUrl.injectEndpoints({
  endpoints: (builder) => ({
    getBeneficiaryValidationFields: builder.query<any, any>({
      query: (args) => {
        const { currency, country, type } = args;
        const countryParam = country ? `&country=${country}` : "";
        return {
          url: `beneficiaries/validation?currency=${currency}${countryParam}&type=${type}`,
          method: "GET"
        };
      }
    }),
    createNewPayment: builder.mutation<any, any>({
      query: (args) => {
        return {
          url: `payments`,
          method: "post",
          body: args
        };
      }
    }),
    getFXRateForPayment: builder.query<any, any>({
      query: (args) => {
        const { id, currencyPair, depositAmount } = args;
        return {
          url: `payments/fx-rate/${id}/${currencyPair}`,
          method: "GET",
          params: { depositAmount }
        };
      }
    }),
    getLiftingFee: builder.query<any, liftingFeeRequest>({
      query: (args) => {
        return {
          url: `pricing/pricing-payments`,
          params: args,
          method: "GET"
        };
      }
    })
  })
});

export const {
  // useGetBeneficiaryValidationFieldsQuery,
  useCreateNewPaymentMutation,
  useGetFXRateForPaymentQuery,
  useGetLiftingFeeQuery
} = newPaymentApi;
