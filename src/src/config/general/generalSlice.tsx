import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../redux/store";
import { userLogoutAction } from "../general/actions";

import { clientManagementApi } from "../../services/clientManagement";

import { extendedApi } from "../../services/ControlCenter/endpoints/companiesEndpoint";

import { extendedApi as entitiesEndpoint } from "../../services/ControlCenter/endpoints/entitiesEndpoint";

// A "slice" is a collection of Redux reducer logic and
// actions for a single feature in your app

type SliceState = {
  isMenuEnabled: boolean;
  isMenuCollapsed: boolean;
  topBarViewFlip: boolean;
  isLoading: boolean;
  timezone: string;
  allClients: any[];
  companies: any[];
  // vendors: any[];
  allUsers: any[];
  accordion: {
    unCollapseOrderInformation: boolean;
    unCollapsePriceCalculation: boolean;
    unCollapsePriceLocal: boolean;
    unCollapsePriceExchange: boolean;
    unCollapseDepositInformation: boolean;
    unCollapseDepositInformationLocal: boolean;
    unCollapseDepositInformationExchange: boolean;
  };
  selectedProduct: string;
};

const initialState: SliceState = {
  isMenuEnabled: true,
  isMenuCollapsed: false,
  topBarViewFlip: false,
  isLoading: false,
  timezone: "Asia/Hong_Kong",
  allClients: [],
  companies: [],
  // vendors: [],
  allUsers: [],
  accordion: {
    unCollapseOrderInformation: false,
    unCollapsePriceCalculation: false,
    unCollapsePriceLocal: false,
    unCollapsePriceExchange: false,
    unCollapseDepositInformation: false,
    unCollapseDepositInformationLocal: false,
    unCollapseDepositInformationExchange: false
  },
  selectedProduct: ""
};

const generalSlice = createSlice({
  name: "general",
  initialState: initialState,
  reducers: {
    updateMenuShow(state, action) {
      return {
        ...state,
        isMenuEnabled: action.payload
      };
    },
    updateMenuCollapse(state, action) {
      return {
        ...state,
        isMenuCollapsed: action.payload
      };
    },
    updateTopBarShow(state, action) {
      return {
        ...state,
        topBarViewFlip: action.payload
      };
    },
    setLoading(state, action: PayloadAction<boolean>) {
      return {
        ...state,
        isLoading: action.payload
      };
    },
    setAccordion(state, action: PayloadAction<SliceState["accordion"]>) {
      return {
        ...state,
        accordion: action.payload
      };
    },
    updateSelectedProduct(state, action) {
      return {
        ...state,
        selectedProduct: action.payload
      };
    }
  },
  extraReducers: (builder) => {
    builder.addCase(userLogoutAction, () => {
      return initialState;
    });
    builder.addMatcher(
      entitiesEndpoint.endpoints.getAllClients.matchFulfilled,
      (state, { payload }) => {
        state.allClients = payload?.data?.entities;
      }
    );
    builder.addMatcher(
      extendedApi.endpoints.getAllCompanies.matchFulfilled,
      (state, { payload }) => {
        state.companies = payload;
      }
    );
    builder.addMatcher(
      clientManagementApi.endpoints.getAllUsers.matchFulfilled,
      (state, { payload }) => {
        state.allUsers = payload?.data?.entities;
      }
    );
  }
});

export const {
  updateMenuShow,
  updateTopBarShow,
  setLoading,
  updateMenuCollapse,
  setAccordion,
  updateSelectedProduct
} = generalSlice.actions;

export const selectMenuEnable = (state: RootState) =>
  state.general.isMenuEnabled;

export const selectMenuCollapsed = (state: RootState) =>
  state.general.isMenuCollapsed;

export const selectTopBarShow = (state: RootState) =>
  state.general.topBarViewFlip;
export const selectLoading = (state: RootState) => state.general.isLoading;

export const selectTimezone = (state: RootState) => state.general.timezone;

export const selectCompanies = (state: RootState) => state.general.companies;

export const selectClients = (state: RootState) => state.general.allClients;

// export const selectVendors = (state: RootState) => state.general.vendors;

export const selectUsers = (state: RootState) => state.general.allUsers;

export const selectAccordion = (state: RootState) => state.general.accordion;

export const selectedProduct = (state: RootState) =>
  state.general.selectedProduct;

export default generalSlice.reducer;
