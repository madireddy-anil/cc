import { api as ccServiceApi } from "./ControlCenter/ccService";
export interface KYCRefreshRequest {
  entityId: string;
  data?: {
    kycStatus: string;
    nextKycRefreshDate: any;
  };
}
export interface KYCRefreshResponse {
  data?: {
    brands: any[];
    clientBrands: any[];
    companyStatus: string;
    createdAt: string;
    documentsComment: any[];
    entityType: string;
    externalScreeningResult: string;
    genericInformation: {
      registeredCompanyName: string;
      tradingName: string;
      companyNumber: string;
      companyType: string;
      tier: string;
      countryOfIncorporation: string;
      addresses: any[];
      websiteAddress: any[];
      linkedCompanyIds: any[];
      industries: any[];
      entityAssignees: any[];
      groupId: string;
    };
    id: string;
    isCorporateAccount: boolean;
    isPersonalAccount: boolean;
    kycInformation: {
      kycApprovedAt: string;
      kycApprovedBy: string;
      kycRefreshDate: string;
      kycRefreshInformation: {
        questions: {
          isExpectedChanges: boolean;
        };
        kycStatus: string;
      };
    };
    operationsDetails: {
      currencyAccount: {
        inboundCurrencies: any[];
        outboundCurrencies: any[];
      };
      ecommercePayments: {
        deposits_payins: any[];
        payouts: any[];
      };
      exoticFx: {
        exoticFxCurrencyPairs: any[];
      };
      fx: {
        fxCurrencyPairs: any[];
      };
      globalAccounts: {
        inbound: any[];
        outbound: any[];
      };
      restrictedCurrency: {
        restrictedCurrencyMarkets: any[];
        beneficiaries: any[];
      };
    };
    profile: {
      cryptoCurrencyPreferences: {
        depositCurrencies: any[];
        settlementCurrencies: any[];
      };
      currencyPreferences: {
        depositCurrencies: any[];
        settlementCurrencies: any[];
      };
      productPreferences: any[];
      settlementPreferences: any[];
      tradingPreference: {
        fxIndex: string;
        isInverse: boolean;
        isNewCalculation: boolean;
      };
    };
    progressLogs: {
      isAllDirectorsAdded: boolean;
      isCompanyInformationDone: boolean;
      isCompanyRequirementsDone: boolean;
      isCompanyStakeholdersAddedDone: boolean;
      isDocumentsUploadedDone: boolean;
      isOperationInformationDone: boolean;
      isRegulatoryInformationDone: boolean;
    };
    regulatoryDetails: {
      isOperatingInRiskCountries: boolean;
      licenses: any[];
      majorityClientBase: any[];
      majorityClientJurisdiction: any[];
      reasonForUsingOurServices: string;
      transactionMonitor: boolean;
    };
    requiredProduct: any[];
    riskCategory: string;
    status: boolean;
    termsOfService: any[];
    type: string;
    updatedAt: string;
    _id: string;
  };
}

export const gppApi = ccServiceApi.injectEndpoints({
  endpoints: (builder) => ({
    updateKycRefresh: builder.mutation<KYCRefreshResponse, KYCRefreshRequest>({
      query: ({ entityId, data }) => {
        return {
          url: `kyc-status/${entityId}`,
          body: data,
          method: "PUT"
        };
      }
    })
  })
});

export const { useUpdateKycRefreshMutation } = gppApi;
