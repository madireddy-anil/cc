import { api } from "../ccService";

export interface CompaniesResponse {
  data: {
    entities: Entities[];
  };
}

export interface Entities {
  allowedCurrency: string[];
  allowedProducts: any[];
  companyStatus: string;
  createdAt: string;
  externalAllowed: boolean;
  genericInformation: {
    websiteAddress: any[];
    isExternalClient: false;
    linkedCompanyIds: any[];
    environment: string;
    linkedCompany: any[];
    registeredCompanyName: string;
  };
  id: string;
  internalAllowed: boolean;
  isCorporateAccount: boolean;
  isPersonalAccount: boolean;
  status: boolean;
  type: string;
  updatedAt: string;
  __v: number;
  _id: string;
  total: number;
}

export const extendedApi = api.injectEndpoints({
  endpoints: (build) => ({
    getAllCompanies: build.query<Entities[], any>({
      query: () => {
        return {
          url: `entities/companies?limit=0`,
          method: "GET"
        };
      },
      transformResponse: (response: CompaniesResponse) => {
        return response.data.entities;
      }
    })
  }),
  overrideExisting: true
});

export const { useGetAllCompaniesQuery } = extendedApi;
