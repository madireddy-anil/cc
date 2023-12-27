import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../../redux/store";

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

type SliceState = {
  selectedClient?: ClientProfile;
  filteredClientList?: any[];
  currentPageList?: any[];
  resetPage: boolean;
  appliedPaginationProperty: Record<any, any> | undefined;
};

const initialState: SliceState = {
  selectedClient: undefined,
  filteredClientList: undefined,
  currentPageList: undefined,
  resetPage: false,
  appliedPaginationProperty: undefined
};

const ClientsProfileSelectionSlice = createSlice({
  name: "client",
  initialState: initialState,
  reducers: {
    selectClientAction: (state, action: PayloadAction<any>) => {
      state.selectedClient = action.payload;
    },
    setFilteredClients: (state, action: PayloadAction<any>) => {
      state.filteredClientList = action.payload;
    },
    changePageAction(state, action: PayloadAction<any[]>) {
      return {
        ...state,
        currentPageList: action.payload
      };
    },
    resetPagination: (state, action: PayloadAction<boolean>) => {
      state.resetPage = action.payload;
    },
    setToInitialCLient: (state) => {
      state.selectedClient = undefined;
    },
    shiftSelectedAccount: (state) => {
      const { selectedClient, filteredClientList } = state;
      const startIndex: number =
        filteredClientList?.findIndex((clients) => {
          return clients?.id === selectedClient?.id;
        }) ?? 0;
      let arr: any[] = [];
      if (startIndex > 0 && filteredClientList) {
        arr = [
          filteredClientList[startIndex],
          ...filteredClientList?.slice(0, startIndex),
          ...filteredClientList?.slice(
            startIndex + 1,
            filteredClientList.length
          )
        ];
      }
      state.filteredClientList = arr;
    },
    updatePaginationProperty: (
      state,
      { payload }: PayloadAction<Record<any, any>>
    ) => {
      state.appliedPaginationProperty = payload;
    }
  }
});

export const selectClient = (state: RootState) => state.client.selectedClient;
export const selectCurrentPageList = (state: RootState) =>
  state.client.currentPageList;
export const selectFilteredClientList = (state: RootState) =>
  state.client.filteredClientList;
export const selectCurrentPage = (state: RootState) => state.client.resetPage;

export const paginationProperty = (state: RootState) =>
  state.client.appliedPaginationProperty;

export const {
  selectClientAction,
  setFilteredClients,
  changePageAction,
  resetPagination,
  setToInitialCLient,
  shiftSelectedAccount,
  updatePaginationProperty
} = ClientsProfileSelectionSlice.actions;

export default ClientsProfileSelectionSlice.reducer;
