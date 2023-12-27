import { createSlice } from "@reduxjs/toolkit";
import { termsAndConditionsApi } from "../../services/termsAndConditions";
import { userLogoutAction } from "../general/actions";

export type SliceState = {
  showFilters: boolean;
  currentPageList: any[];
  termsOfService: any[];
  lastUpdatedVersionRecord: { [key: string]: any };
};

const initialState: SliceState = {
  showFilters: false,
  currentPageList: [],
  termsOfService: [],
  lastUpdatedVersionRecord: {}
};

const termsAndConditionsSlice = createSlice({
  name: "termsOfServices",
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(userLogoutAction, () => {
        return initialState;
      })
      .addMatcher(
        termsAndConditionsApi.endpoints.getTermsOfServices.matchFulfilled,
        (state, { payload }) => {
          const lastUpdatedVersion =
            payload.data?.termsOfService.length > 0 &&
            payload.data?.termsOfService?.reduce((a: any, b: any) =>
              a.updatedAt > b.updatedAt ? a : b
            );
          state.lastUpdatedVersionRecord = lastUpdatedVersion
            ? lastUpdatedVersion
            : {};
          state.termsOfService = payload.data?.termsOfService;
        }
      );
  }
});

//export const { } = termsAndConditionsSlice.actions;

export default termsAndConditionsSlice.reducer;
