import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../redux/store";
import { validationOnData } from "../transformer";
import { userLogoutAction } from "../general/actions";
import {
  clientManagementApi,
  GetClientsRequest
} from "../../services/clientManagement";
import {
  formatGenericInfoForInitialData,
  formatProductsData
} from "../transformer";

type SliceState = {
  appliedClientFilters: any[];
  clients: any;
  genericInformation: any;
  linkedUsers: any[];
  selectedUsers: any[];
  selectedGroup: { [key: string]: string };
  groupId: string;
  basicCompanyInfo: any;
  companyWebsites: any[];
  initialCompanyInfoFormData: any;
  selectedIndustryInfo: any;
  isCompanyInfoUpdated: boolean;
  contentEditable: boolean;
  initialFormWebsiteAddress: { [key: string]: string };
  addressType: string;
  riskAndKycInfo: any;
  preSignedURLData: any;
  unLinkUserData: any;
  selectedRequiredProducts: any[];
  initialBrandFormData: any;
  searchQuery: string;
  paginationProps: {
    current: number;
    pageSize: number;
    count: number;
  };
  clientsFilterProps: GetClientsRequest;
  isUserLoading: boolean;
  termsOfService: any[];
  isGroupLoading: boolean;
  btnLoading: boolean;
  isCompanyInfoLoader: boolean;
  isClientSummaryInfoFetched: boolean;
  regulatoryDetails: {
    licenses: any;
    flowOfFundsComment: string;
    isOperatingInRiskCountries: boolean;
    majorityClientBase: string[];
    majorityClientJurisdiction: string[];
    reasonForUsingOurServices: string;
    transactionMonitor: boolean;
    subjectToRegulatoryEnforcement: boolean;
  };
  moduleType: "linked_users" | "linked_groups";
};

const initialState: SliceState = {
  appliedClientFilters: [],
  clients: {},
  genericInformation: {},
  linkedUsers: [],
  selectedUsers: [],
  selectedGroup: {},
  groupId: "",
  basicCompanyInfo: {},
  companyWebsites: [],
  initialCompanyInfoFormData: {},
  selectedIndustryInfo: {},
  isCompanyInfoUpdated: false,
  contentEditable: false,
  initialFormWebsiteAddress: {},
  addressType: "registered",
  riskAndKycInfo: {},
  preSignedURLData: {},
  unLinkUserData: {},
  selectedRequiredProducts: [],
  initialBrandFormData: {},
  searchQuery: "",
  paginationProps: {
    current: 0,
    pageSize: 0,
    count: 0
  },
  clientsFilterProps: {
    key: 0,
    current: 0,
    pageSize: 0,
    companyName: "",
    tradingName: "",
    kycStatus: "",
    riskCategory: ""
  },
  isUserLoading: false,
  isGroupLoading: false,
  btnLoading: false,

  termsOfService: [],
  isCompanyInfoLoader: false,
  isClientSummaryInfoFetched: false,
  regulatoryDetails: {
    licenses: [],
    flowOfFundsComment: "",
    isOperatingInRiskCountries: false,
    majorityClientBase: [],
    majorityClientJurisdiction: [],
    reasonForUsingOurServices: "",
    transactionMonitor: false,
    subjectToRegulatoryEnforcement: false
  },
  moduleType: "linked_users"
};

const clientManagementSlice = createSlice({
  name: "clientManagement",
  initialState: initialState,
  reducers: {
    updateClientFilterData: (state, action) => {
      state.appliedClientFilters = action.payload;
    },
    updateSelectedIndustryInfo: (state, action) => {
      state.selectedIndustryInfo = action.payload;
    },
    updateContentEditable(state, action) {
      return {
        ...state,
        contentEditable: action.payload
      };
    },
    removeWebsiteAddress: (state, action) => {
      state.genericInformation.websiteAddress = action.payload;
    },
    updateInitialFormWebsiteAddress: (state, action) => {
      state.initialFormWebsiteAddress = action.payload;
    },
    changeAddressType: (state, action) => {
      return {
        ...state,
        addressType: action.payload
      };
    },
    updateGroupId: (state, action) => {
      return {
        ...state,
        groupId: action.payload
      };
    },
    updateSelectedUsers: (state, action) => {
      return {
        ...state,
        selectedUsers: action.payload
      };
    },
    updateSelectedGroup: (state, action) => {
      return {
        ...state,
        selectedGroup: action.payload
      };
    },
    updateLinkedUsers: (state, action) => {
      return {
        ...state,
        linkedUsers: action.payload
      };
    },
    updatePaginationProps: (state, action) => {
      return {
        ...state,
        paginationProps: {
          current: action.payload.current,
          pageSize: action.payload.pageSize,
          count: state.paginationProps.count + 1
        }
      };
    },
    updateUsersPaginationProps: (state, action) => {
      return {
        ...state,
        clientsFilterProps: {
          key:
            state.clientsFilterProps.current === action.payload.current
              ? state.clientsFilterProps.key + 1
              : state.clientsFilterProps.key,
          current: action.payload.current,
          pageSize: action.payload.pageSize,
          ...action.payload
        }
      };
    },
    updateUserSearchLoading: (state, action) => {
      return {
        ...state
      };
    },
    updateSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setBtnLoading: (state, action) => {
      return {
        ...state,
        btnLoading: action.payload
      };
    },
    updateModuleType: (state, action) => {
      return {
        ...state,
        moduleType: action.payload
      };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(userLogoutAction, () => {
        return initialState;
      })
      .addMatcher(
        clientManagementApi.endpoints.getClientDetail.matchFulfilled,
        (state, { payload }) => {
          const kycRefreshInformation =
            state?.clients?.kycInformation?.kycRefreshInformation;
          state.clients = validationOnData(payload?.data, "object");
          state.genericInformation = validationOnData(
            payload?.data?.genericInformation,
            "object"
          );
          state.groupId = validationOnData(
            payload?.data?.genericInformation.groupId,
            "string"
          );
          state.basicCompanyInfo = {
            registeredCompanyName: validationOnData(
              payload?.data?.genericInformation?.registeredCompanyName,
              "string"
            ),
            tradingName: validationOnData(
              payload?.data?.genericInformation?.tradingName,
              "string"
            ),
            companyNumber: validationOnData(
              payload?.data?.genericInformation?.companyNumber,
              "string"
            ),
            companyIncorporation: validationOnData(
              payload?.data?.genericInformation?.addresses,
              "array"
            ),
            industry: validationOnData(
              payload?.data?.genericInformation?.industries,
              "array"
            ),
            tier: validationOnData(
              payload?.data?.genericInformation?.tier,
              "string"
            ),
            relationshipManager:
              payload?.data?.genericInformation?.entityAssignees.length &&
              validationOnData(
                payload?.data?.genericInformation?.entityAssignees[0]
                  .relationshipManager,
                "string"
              ),
            customerAccountSpecialist:
              payload?.data?.genericInformation?.entityAssignees.length &&
              validationOnData(
                payload?.data?.genericInformation?.entityAssignees[0]
                  .customerAccountSpecialist,
                "string"
              )
          };
          state.initialCompanyInfoFormData = formatGenericInfoForInitialData(
            payload.data?.genericInformation
          );
          state.selectedIndustryInfo = {
            industryName:
              validationOnData(
                payload?.data?.genericInformation.industries,
                "array"
              ).length > 0 &&
              payload?.data?.genericInformation.industries[0].industryType,
            industrySubTypes:
              validationOnData(
                payload?.data?.genericInformation.industries,
                "array"
              ).length > 0 &&
              payload?.data?.genericInformation.industries[0].subType,
            isIndustryOther:
              validationOnData(
                payload?.data?.genericInformation.industries,
                "array"
              ).length > 0 &&
              payload?.data?.genericInformation.industries[0].industryType ===
                "other"
          };
          state.companyWebsites = validationOnData(
            state?.clients?.genericInformation?.websiteAddress,
            "array"
          );
          state.isCompanyInfoUpdated = false;
          state.riskAndKycInfo = {
            riskCategory: validationOnData(
              state?.clients?.riskCategory,
              "string"
            ),
            externalScreeningResult: validationOnData(
              state?.clients?.externalScreeningResult,
              "string"
            ),
            kycStatus: validationOnData(
              state?.clients?.kycInformation?.kycStatus,
              "string"
            ),
            kycApprovedAt: validationOnData(
              state?.clients?.kycInformation?.kycApprovedAt,
              "string"
            ),
            nextKycRefreshDate: validationOnData(
              state?.clients?.kycInformation?.kycRefreshDate,
              "string"
            ),
            kycApprovedBy: validationOnData(
              state?.clients?.kycInformation?.kycApprovedBy,
              "string"
            ),
            riskAndKycTableColumn: [
              {
                name: "KYC Refresh",
                timeDate: Array.isArray(kycRefreshInformation?.event)
                  ? validationOnData(
                      kycRefreshInformation?.event[
                        kycRefreshInformation?.event.length - 1
                      ]?.dateOfKycRefresh,
                      "string"
                    )
                  : "--"
              },
              {
                name: "Onboarding",
                timeDate: validationOnData(state?.clients?.createdAt, "string")
              }
            ]
          };
          state.selectedRequiredProducts = validationOnData(
            payload?.data?.requiredProduct,
            "array"
          );
          state.initialBrandFormData = formatProductsData(
            validationOnData(payload.data?.requiredProduct, "array")
          );
          state.termsOfService = validationOnData(
            payload?.data?.termsOfService,
            "array"
          );
          state.isClientSummaryInfoFetched = false;
          state.regulatoryDetails = validationOnData(
            state?.clients?.regulatoryDetails,
            "object"
          );
        }
      )
      .addMatcher(
        clientManagementApi.endpoints.getClientDetail.matchPending,
        (state, { payload }) => {
          state.isClientSummaryInfoFetched = true;
        }
      )
      .addMatcher(
        clientManagementApi.endpoints.getClientDetail.matchRejected,
        (state, { payload }) => {
          state.isClientSummaryInfoFetched = false;
        }
      )
      .addMatcher(
        clientManagementApi.endpoints.updateClientDetail.matchPending,
        (state, { payload }) => {
          state.isCompanyInfoLoader = true;
        }
      )
      .addMatcher(
        clientManagementApi.endpoints.updateClientDetail.matchFulfilled,
        (state, { payload }) => {
          state.isCompanyInfoLoader = false;
        }
      )
      .addMatcher(
        clientManagementApi.endpoints.updateClientDetail.matchRejected,
        (state, { payload }) => {
          state.isCompanyInfoLoader = false;
        }
      )
      .addMatcher(
        clientManagementApi.endpoints.updateClientDetail.matchPending,
        (state, { payload }) => {
          state.isCompanyInfoLoader = true;
        }
      )
      .addMatcher(
        clientManagementApi.endpoints.getUsersOnSearch.matchPending,
        (state, { payload }) => {
          state.isUserLoading = true;
        }
      )
      .addMatcher(
        clientManagementApi.endpoints.getUsersOnSearch.matchFulfilled,
        (state, { payload }) => {
          state.isUserLoading = false;
        }
      )
      .addMatcher(
        clientManagementApi.endpoints.getUsersOnSearch.matchRejected,
        (state, { payload }) => {
          state.isUserLoading = false;
        }
      )
      .addMatcher(
        clientManagementApi.endpoints.getGroupsOnSearch.matchPending,
        (state, { payload }) => {
          state.isGroupLoading = true;
        }
      )
      .addMatcher(
        clientManagementApi.endpoints.getGroupsOnSearch.matchFulfilled,
        (state, { payload }) => {
          state.isGroupLoading = false;
        }
      )
      .addMatcher(
        clientManagementApi.endpoints.getGroupsOnSearch.matchRejected,
        (state, { payload }) => {
          state.isGroupLoading = false;
        }
      )
      .addMatcher(
        clientManagementApi.endpoints.updateClientDetail.matchFulfilled,
        (state, { payload }) => {
          state.isCompanyInfoUpdated = true;
        }
      )
      .addMatcher(
        clientManagementApi.endpoints.getPresignedURL.matchFulfilled,
        (state, { payload }) => {
          state.preSignedURLData = payload;
        }
      )
      .addMatcher(
        clientManagementApi.endpoints.deleteUnlinkUser.matchFulfilled,
        (state, { payload }) => {
          state.unLinkUserData = payload;
        }
      );
  }
});

export const searchQuery = (state: RootState) =>
  state.payerSelection.searchQuery;
export const selectTermsOfService = (state: RootState) =>
  state.clientManagement.termsOfService;
export const selectEntityId = (state: RootState) =>
  state.clientManagement.clients?.id;
export const selectClientsFilterProps = (state: RootState) =>
  state.clientManagement.clientsFilterProps;

export const {
  updateClientFilterData,
  updateSelectedIndustryInfo,
  updateContentEditable,
  removeWebsiteAddress,
  updateInitialFormWebsiteAddress,
  changeAddressType,
  updateGroupId,
  updateSelectedUsers,
  updateSelectedGroup,
  updateSearchQuery,
  updateLinkedUsers,
  updatePaginationProps,
  updateUsersPaginationProps,
  updateUserSearchLoading,
  setBtnLoading,
  updateModuleType
} = clientManagementSlice.actions;

export default clientManagementSlice.reducer;
