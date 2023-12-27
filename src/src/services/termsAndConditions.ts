import { api as ccServiceApi } from "./ControlCenter/ccService";

export interface TermsOfServiceRequest {
  versionNo: string;
  fileName: string;
}
export interface TermsOfServicesResponse {
  status: string;
  data: { [key: string]: any };
  message: string;
}

export interface TermsOfServiceUpdateRequest {
  documentId: string;
  data: {
    versionNo: string;
    fileName: string;
  };
}
export interface TermsOfServicesUpdateResponse {
  status: string;
  data: { [key: string]: any };
  message: string;
}

export const termsAndConditionsApi = ccServiceApi.injectEndpoints({
  endpoints: (builder) => ({
    getTermsOfServices: builder.query<TermsOfServicesResponse, any>({
      query: (args) => {
        const { current, pageSize } = args;
        const page = current ? `page=${current}&` : ``;
        const total = pageSize ? `limit=${pageSize}` : `limit=0`;

        return {
          url: `terms-of-service?${page}${total}`,
          method: "GET"
        };
      }
    }),
    createTermsOfService: builder.mutation<
      TermsOfServicesResponse,
      TermsOfServiceRequest
    >({
      query: (args) => {
        return {
          url: `terms-of-service`,
          method: "POST",
          body: args
        };
      }
    }),
    updateTermsOfService: builder.mutation<
      TermsOfServicesUpdateResponse,
      TermsOfServiceUpdateRequest
    >({
      query: (args) => {
        const { documentId, data } = args;
        return {
          url: `terms-of-service/${documentId}`,
          method: "PUT",
          body: data
        };
      }
    }),
    deleteTermsOfService: builder.mutation<any, any>({
      query: (args) => {
        return {
          url: `terms-of-service/${args}`,
          method: "DELETE"
        };
      }
    })
  })
});

export const {
  useGetTermsOfServicesQuery,
  useCreateTermsOfServiceMutation,
  useUpdateTermsOfServiceMutation,
  useDeleteTermsOfServiceMutation
} = termsAndConditionsApi;
