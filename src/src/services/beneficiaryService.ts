import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../redux/store";
import { beneficiaryApiUrl } from "../config/variables";
// import { BeneficiaryForm } from "@payconstruct/pp-types";
import {
  BeneficiaryDocument,
  BeneficiaryAccount,
  BeneficiaryDetails
} from "@payconstruct/pp-types/dist/entities/beneficiary";

// API Response mapped to Type
//TODO: walletAddress Changed to ---> walletDetails: {address: string;}
export interface newBeneficiaryDocument extends BeneficiaryDocument {
  walletDetails?: {
    address: string;
  };
  mainCurrency: string;
}

export interface BeneficiaryResponse {
  response: newBeneficiaryDocument[];
}

type CreateBeneficiaryResponse = {
  beneficiary: BeneficiaryObject;
};

export interface BeneficiaryByIdResponse {
  beneficiary: newBeneficiaryDocument;
}

export interface BeneficiaryObject {
  isSaved?: boolean;
  id: string;
  currency: string;
  isMigrated: boolean;
  status: string;
  accountDetails: BeneficiaryAccount;
  walletDetails?: {
    address: string;
  };
  beneficiaryDetails: BeneficiaryDetails;
  entityName: string;
  userReference?: string;
  aliasName?: string;
  type: string;
  createdAt: string;
}

export const beneficiaryApi = createApi({
  reducerPath: "beneficiaryApi",
  baseQuery: fetchBaseQuery({
    baseUrl: beneficiaryApiUrl,
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
    getAllBeneficiary: builder.query<BeneficiaryResponse, { limit: number }>({
      query: (args) => {
        return {
          url: `beneficiary?limit=${args?.limit ?? 0}`,
          method: "GET"
        };
      }
    }),
    getBeneficiaryId: builder.query<BeneficiaryByIdResponse, { id: string }>({
      query: ({ id }) => {
        return {
          url: `beneficiary/${id}`,
          method: "GET"
        };
      }
    }),
    getBeneficiaryByClientId: builder.query<
      BeneficiaryResponse,
      { entityId: string }
    >({
      query: (param) => {
        const { entityId } = param;
        return {
          url: `client/${entityId}`,
          method: "GET"
        };
      }
    }),
    createBeneficiary: builder.mutation<CreateBeneficiaryResponse, any>({
      query: (newBeneficiaryPayload) => ({
        url: "beneficiary/createBeneficiary",
        method: "POST",
        body: newBeneficiaryPayload
      })
    }),
    getBeneficiaryValidationFields: builder.query<any, any>({
      query: (args) => {
        const { currency, country, type } = args;
        const countryParam = country ? `&country=${country}` : "";
        return {
          url: `beneficiaryByValidation?currency=${currency}${countryParam}&type=${type}`,
          method: "GET"
        };
      }
    })
  })
});

export const {
  useGetAllBeneficiaryQuery,
  useGetBeneficiaryByClientIdQuery,
  useGetBeneficiaryIdQuery,
  useCreateBeneficiaryMutation,
  useGetBeneficiaryValidationFieldsQuery
} = beneficiaryApi;
