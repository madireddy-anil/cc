import { combineReducers, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { tradeApi } from "../../services/tradesService";
import { routesApi } from "../../services/routesService";
import { EFXOrder, Account, Route as TRoute } from "@payconstruct/pp-types";
import depositReducer from "../../pages/Trades/Deposit//DepositSlice";
import { RootState } from "../../redux/store";
import { userLogoutAction } from "../general/actions";

export type { EFXOrder, Account };

export interface Route extends TRoute {
  vendorAllRate: string;
}

export type SliceState = {
  list: EFXOrder[];
  showFilters: boolean;
  currentPageList: any[];
  filteredList: any[];
  deposit: {
    step: number;
    selectedAccount: Account | null;
    youSellCurrency: string | null;
    youSellAmount: string | null;
    youBuyCurrency: string | null;
    requestedAccountType: "personal" | "corporate";
    accountType: "day" | "overnight";
    remarks: string;
    depositDate: string | null;
  };
  tempSelectedRoute: Route | null;
  selectedRoute: Route | null;
  selectedRouteIndex: string;
  showRouteDetailsModal: boolean;
  routeList: Route[];
  pageNumber: number;
  editAccount: boolean;
  selectedAccount: {
    GSI1PK?: string;
    PK?: string;
    SK?: string;
    accountNumber: string;
    currency: string;
    instructions: string;
    maxAmount: string;
    minAmount: string;
    notes: string;
    time: string;
    timeZone: string;
    uuid?: string;
    vendorId: string;
  };
};

const initialState: SliceState = {
  list: [],
  showFilters: false,
  currentPageList: [],
  filteredList: [],
  deposit: {
    step: 0,
    selectedAccount: null,
    youSellCurrency: null,
    youSellAmount: null,
    youBuyCurrency: null,
    requestedAccountType: "personal",
    accountType: "day",
    remarks: "",
    depositDate: ""
  },
  tempSelectedRoute: null,
  selectedRoute: null,
  selectedRouteIndex: "",
  showRouteDetailsModal: false,
  routeList: [],
  pageNumber: 0,
  editAccount: false,
  selectedAccount: {
    GSI1PK: "",
    PK: "",
    SK: "",
    accountNumber: "",
    currency: "",
    instructions: "",
    maxAmount: "",
    minAmount: "",
    notes: "",
    time: "",
    timeZone: "",
    uuid: "",
    vendorId: ""
  }
};

const tradeSlice = createSlice({
  name: "tradesHistory",
  initialState: initialState,
  reducers: {
    showFilterAction(state, action: PayloadAction<boolean>) {
      return {
        ...state,
        showFilters: action.payload
      };
    },
    changePageAction(state, action: PayloadAction<any[]>) {
      let pageOptions = action.payload.length < 25 ? 25 : action.payload.length;
      if (pageOptions > 25 && pageOptions < 50) {
        pageOptions = 50;
      } else if (pageOptions > 50) {
        pageOptions = 100;
      }
      return {
        ...state,
        currentPageList: action.payload,
        pageNumber: pageOptions
      };
    },
    setListAction(state, action: PayloadAction<any[]>) {
      return {
        ...state,
        list: action.payload
      };
    },
    filterListAction(state, action: PayloadAction<any[]>) {
      return {
        ...state,
        filteredList: action.payload
      };
    },
    selectRoute(state, action: PayloadAction<Route | null>) {
      return {
        ...state,
        selectedRoute: action.payload
      };
    },
    selectRouteIndex(state, action: PayloadAction<string>) {
      return {
        ...state,
        selectedRouteIndex: action.payload
      };
    },
    tempSelectRoute(state, action: PayloadAction<Route | null>) {
      return {
        ...state,
        tempSelectedRoute: action.payload
      };
    },
    showRouteDetailsModalAction(state, action: PayloadAction<boolean>) {
      return {
        ...state,
        showRouteDetailsModal: action.payload
      };
    },
    routeListAction(state, action: PayloadAction<Route[]>) {
      return {
        ...state,
        routeList: action.payload
      };
    },
    editAccountAction(state, action: PayloadAction<boolean>) {
      return {
        ...state,
        editAccount: action.payload
      };
    },
    selectedAccountAction(state, action: PayloadAction<any>) {
      return {
        ...state,
        selectedAccount: action.payload
      };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(userLogoutAction, () => {
        return initialState;
      })
      .addMatcher(
        tradeApi.endpoints.getTrades.matchFulfilled,
        (state, { payload }) => {
          state.list = payload.orders; //TODO Change to Final API Response after It's defined and deployed
          state.filteredList = payload.orders; //TODO Change to Final API Response after It's defined and deployed
        }
      )
      .addMatcher(
        routesApi.endpoints.getRouteList.matchFulfilled,
        (state, { payload }) => {
          state.routeList = payload.routes;
        }
      )
      .addMatcher(
        routesApi.endpoints.getCalculatedRoutes.matchFulfilled,
        (state, { payload }) => {
          state.routeList = payload.routes;
        }
      );
  }
});

export const {
  showFilterAction,
  changePageAction,
  filterListAction,
  setListAction,
  selectRoute,
  selectRouteIndex,
  tempSelectRoute,
  showRouteDetailsModalAction,
  routeListAction,
  editAccountAction,
  selectedAccountAction
} = tradeSlice.actions;

export const selectTrades = (state: RootState) => state.trades;
export const selectTradeList = (state: RootState) =>
  state.trades.tradesHistory.list;
export const selectedRoute = (state: RootState) =>
  state.trades.tradesHistory.selectedRoute;
export const selectedRouteIndex = (state: RootState) =>
  state.trades.tradesHistory.selectedRouteIndex;
export const tempSelectedRoute = (state: RootState) =>
  state.trades.tradesHistory.tempSelectedRoute;
export const showRouteDetailsModal = (state: RootState) =>
  state.trades.tradesHistory.showRouteDetailsModal;
export const routeList = (state: RootState) =>
  state.trades.tradesHistory.routeList;
export const selectEditAccount = (state: RootState) =>
  state.trades.tradesHistory.editAccount;
export const selectedAccount = (state: RootState) =>
  state.trades.tradesHistory.selectedAccount;

const tradesReducer = combineReducers({
  [tradeSlice.name]: tradeSlice.reducer,
  deposit: depositReducer
});

export default tradesReducer;
