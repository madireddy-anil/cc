import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../redux/store";
import {
  Account,
  accountApi,
  Transaction
} from "../../services/accountService";
import { validationOnData } from "../transformer";
import { userLogoutAction } from "../general/actions";

type SliceState = {
  drawerVisible: boolean;
  accounts: Account[];
  currentPageList: Account[];
  account: Account | null;
  transactions: Transaction[];
  selectedTransaction: object;
  accountsListView: string;
  showFilters: boolean;
  appliedPaginationProperty: Record<any, any>;
  appliedFilters: object;
  cryptoCurrency: boolean;
  vendorChange: boolean;
  filterChange: boolean;
  childPageView: boolean;
  currency: any;
  mainCurrency: boolean;
};

const initialState: SliceState = {
  drawerVisible: false,
  accounts: [],
  currentPageList: [],
  account: null,
  transactions: [],
  selectedTransaction: {},
  accountsListView: "list",
  showFilters: false,
  appliedPaginationProperty: {
    pageNumber: 1,
    pageSize: 10
  },
  appliedFilters: {},
  cryptoCurrency: false,
  vendorChange: false,
  filterChange: false,
  childPageView: false,
  currency: undefined,
  mainCurrency: false
};

const accountSlice = createSlice({
  name: "account",
  initialState: initialState,
  reducers: {
    updateFilterProperty(state, action) {
      return {
        ...state,
        appliedFilters: action.payload
      };
    },
    updatePaginationProperty(state, action) {
      return {
        ...state,
        appliedPaginationProperty: action.payload
      };
    },
    updateDrawerShow(state, action) {
      return {
        ...state,
        drawerVisible: action.payload
      };
    },
    selectTransaction(state, action) {
      return {
        ...state,
        selectedTransaction: action.payload
      };
    },
    updateAccountsListView(state, action) {
      return {
        ...state,
        accountsListView: action.payload
      };
    },
    changePageAction(state, action: PayloadAction<Account[]>) {
      return {
        ...state,
        currentPageList: action.payload
      };
    },
    showFilterAction(state, action: PayloadAction<boolean>) {
      return {
        ...state,
        showFilters: action.payload
      };
    },
    updateCurrencyType(state, action) {
      return {
        ...state,
        cryptoCurrency: action.payload
      };
    },
    updateVendorChange(state, action) {
      return {
        ...state,
        vendorChange: action.payload
      };
    },
    updateFilterChange(state, action) {
      return {
        ...state,
        filterChange: action.payload
      };
    },
    updateChildPageView(state, action) {
      return {
        ...state,
        childPageView: action.payload
      };
    },
    updateSelectedCurrency(state, action) {
      return {
        ...state,
        currency: action.payload
      };
    },
    updateMainCurrency(state, action) {
      return {
        ...state,
        mainCurrency: action.payload
      };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(userLogoutAction, () => {
        return initialState;
      })
      .addMatcher(
        accountApi.endpoints.getAccounts.matchFulfilled,
        (state, { payload }) => {
          state.accounts = payload.data;
        }
      )
      .addMatcher(
        accountApi.endpoints.getAccount.matchFulfilled,
        (state, { payload }) => {
          const validatedData: any = validationOnData(payload.data, "object");
          state.account = validatedData;
        }
      )
      .addMatcher(
        accountApi.endpoints.getTransactions.matchFulfilled,
        (state, { payload }) => {
          state.transactions = payload.data;
        }
      );
  }
});

export const {
  updateDrawerShow,
  selectTransaction,
  updateAccountsListView,
  changePageAction,
  showFilterAction,
  updatePaginationProperty,
  updateFilterProperty,
  updateCurrencyType,
  updateVendorChange,
  updateFilterChange,
  updateChildPageView,
  updateSelectedCurrency,
  updateMainCurrency
} = accountSlice.actions;

export const selectDrawerVisibility = (state: RootState) =>
  state.account.drawerVisible;
export const selectAccounts = (state: RootState) => state.account.accounts;
export const selectAccount = (state: RootState) => state.account.account;

export const selectCurrentPageList = (state: RootState) =>
  state.account.currentPageList;

export const selectTransactions = (state: RootState) =>
  state.account.transactions;
export const selectedTransaction = (state: RootState) =>
  state.account.selectedTransaction;

export const selectAccountsListView = (state: RootState) =>
  state.account.accountsListView;
export const selectShowFilters = (state: RootState) =>
  state.account.showFilters;

export const selectAppliedFilter = (state: RootState) =>
  state.account.appliedFilters;

export const selectCryptoCurrency = (state: RootState) =>
  state.account.cryptoCurrency;

export const selectVendorChange = (state: RootState) =>
  state.account.vendorChange;

export const selectFilterChange = (state: RootState) =>
  state.account.filterChange;

export const selectAppliedPagination = (state: RootState) =>
  state.account.appliedPaginationProperty;

export const selectChildPageView = (state: RootState) =>
  state.account.childPageView;

export const selectCurrency = (state: RootState) => state.account.currency;

export const selectMainCurrency = (state: RootState) =>
  state.account.mainCurrency;

export default accountSlice.reducer;
