import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../../../redux/store";
import { ClientProfile } from "../PayerSelection/payerSelectionSlice";

interface paginationProperty {
  current: number;
  pageSize: number;
}

type SliceState = {
  selectedPayer?: ClientProfile;
  filteredClientList?: any[];
  currentPageList?: any[];
  resetPage: boolean;
  appliedPaginationProperty: paginationProperty;
  searchQuery: string;
  searchedData: any[];
};

const initialState: SliceState = {
  selectedPayer: undefined,
  filteredClientList: undefined,
  currentPageList: undefined,
  resetPage: false,
  appliedPaginationProperty: {
    current: 1,
    pageSize: 10
  },
  searchQuery: "",
  searchedData: []
};

const moveBetweenSelectionSlice = createSlice({
  name: "moveBetweenAccountSelection",
  initialState: initialState,
  reducers: {
    updateSearchedData: (state, action: PayloadAction<any[]>) => {
      state.searchedData = action.payload;
    },
    updateSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    selectPayerAction: (state, action: PayloadAction<any>) => {
      state.selectedPayer = action.payload;
    },
    updatePaginationProperty: (
      state,
      { payload }: PayloadAction<paginationProperty>
    ) => {
      state.appliedPaginationProperty = payload;
    },
    setToInitial: (state) => {
      return {
        ...state,
        searchQuery: "",
        selectedPayer: undefined,
        searchedData: []
      };
    }
  }
});

export const payerPaginationProperty = (state: RootState) =>
  state.moveBetweenAccountSelection.appliedPaginationProperty;

export const selectedPayer = (state: RootState) =>
  state.moveBetweenAccountSelection.selectedPayer;

export const searchQuery = (state: RootState) =>
  state.moveBetweenAccountSelection.searchQuery;

export const searchedData = (state: RootState) =>
  state.moveBetweenAccountSelection.searchedData;

export const {
  updateSearchedData,
  selectPayerAction,
  updatePaginationProperty,
  updateSearchQuery,
  setToInitial
} = moveBetweenSelectionSlice.actions;

export default moveBetweenSelectionSlice.reducer;
