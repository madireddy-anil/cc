import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { tradeApi } from "../../services/tradesService";
import { RootState } from "../../redux/store";
import { userLogoutAction } from "../general/actions";
import { IndicativeRate } from "../../services/routesService";

export type SliceState = {
  list: IndicativeRate[];
  showFilters: boolean;
  currentPageList: any[];
  filteredList: any[];
  pageNumber: number;
};

const initialState: SliceState = {
  list: [],
  showFilters: false,
  currentPageList: [],
  filteredList: [],
  pageNumber: 0
};

const indicativeRateSlice = createSlice({
  name: "indicativeRate",
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
          state.filteredList = payload.orders ?? payload.orders;
        }
      );
  }
});

export const {
  showFilterAction,
  changePageAction,
  filterListAction,
  setListAction
} = indicativeRateSlice.actions;

export const selectIndicativeRate = (state: RootState) => state.indicativeRate;

export const selectIndicativeRateList = (state: RootState) =>
  state.indicativeRate.list;

export const selectShowFilter = (state: RootState) =>
  state.trades.tradesHistory.showFilters;

export default indicativeRateSlice.reducer;
