import { api } from "../ccService";
// https://redux-toolkit.js.org/rtk-query/usage/code-splitting
export interface EntityClient {
  id: string;
  genericInformation: {
    tradingName: string;
    registeredCompanyName: string;
  };
}
export interface EntitiesResponse {
  status: string;
  data: {
    entities: EntityClient[];
  };
}
export const extendedApi = api.injectEndpoints({
  endpoints: (build) => ({
    getEntities: build.query({
      query: () => "entities"
    }),
    getAllClients: build.query<EntitiesResponse, any>({
      query: () => `entities/clients?limit=0`
    }),
    getClientById: build.query<any, { id: string }>({
      query: ({ id }) => `entities/clients/${id}`
    }),
    getCompanies: build.query({
      query: () => "entities/companies?limit=0"
    }),
    getVendors: build.query({
      query: () => "entities/vendors?limit=0"
    }),
    getClientEntities: build.query({
      query: (args) => `entities/clients?limit=${args.limit ?? 0}`
    }),
    getClientsByKycPass: build.query({
      query: (args) => {
        const { current, pageSize, kycStatus } = args;
        return {
          method: "GET",
          url: `entities/clients?kycInformation.kycStatus=${kycStatus}`,
          params: {
            page: current,
            limit: pageSize
          }
        };
      }
    }),
    getClientBySearch: build.query({
      query: (args) => {
        const { query, kycStatus } = args;
        return {
          method: "GET",
          url: `entities/clients/search/${query}?kycInformation.kycStatus=${kycStatus}`
        };
      }
    })
  }),
  overrideExisting: true
});

export const {
  useGetClientBySearchQuery,
  useGetClientsByKycPassQuery,
  useGetAllClientsQuery,
  useGetEntitiesQuery,
  useGetClientByIdQuery,
  useGetCompaniesQuery,
  useGetVendorsQuery,
  useGetClientEntitiesQuery
} = extendedApi;
