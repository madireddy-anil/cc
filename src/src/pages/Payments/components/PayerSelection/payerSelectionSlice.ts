import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../../../redux/store";

export interface ClientProfile {
  genericInformation: {
    registeredCompanyName: string;
    tradingName: string;
    industries: Industries[];
  };
  id: string;
}

interface Industries {
  subType: ["broker", "platform service/provider"];
  _id: string;
  industryType: string;
}

export interface ClientsProfile {
  ClientsProfile: ClientProfile[];
}

interface paginationProperty {
  current: number;
  pageSize: number;
}

interface paymentForProperty {
  id: string;
  name: string;
  tag: string;
  icon: string;
}

type SliceState = {
  selectedPayForOption?: paymentForProperty;
  selectedPayer?: ClientProfile;
  filteredClientList?: any[];
  currentPageList?: any[];
  resetPage: boolean;
  appliedPaginationProperty: paginationProperty;
  searchQuery: string;
  searchedData: any[];
};

const initialState: SliceState = {
  selectedPayForOption: undefined,
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

const payerSelectionSlice = createSlice({
  name: "payerSelection",
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
    }
  }
});

export const payerPaginationProperty = (state: RootState) =>
  state.payerSelection.appliedPaginationProperty;

export const selectedPayer = (state: RootState) =>
  state.payerSelection.selectedPayer;

export const searchQuery = (state: RootState) =>
  state.payerSelection.searchQuery;

export const searchedData = (state: RootState) =>
  state.payerSelection.searchedData;

export const {
  updateSearchedData,
  selectPayerAction,
  updatePaginationProperty,
  updateSearchQuery
} = payerSelectionSlice.actions;

export default payerSelectionSlice.reducer;
