import { createSlice } from "@reduxjs/toolkit";
import { gppApi } from "../../services/gppService";

type SliceState = {
  isKycStatusLoading: boolean;
};

const initialState: SliceState = {
  isKycStatusLoading: false
};

const applicationApprovalSlice = createSlice({
  name: "applicationApproval",
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addMatcher(
        gppApi.endpoints.updateKycRefresh.matchPending,
        (state, { payload }) => {
          state.isKycStatusLoading = true;
        }
      )
      .addMatcher(
        gppApi.endpoints.updateKycRefresh.matchFulfilled,
        (state, { payload }) => {
          state.isKycStatusLoading = false;
        }
      )
      .addMatcher(
        gppApi.endpoints.updateKycRefresh.matchRejected,
        (state, { payload }) => {
          state.isKycStatusLoading = false;
        }
      );
  }
});

export default applicationApprovalSlice.reducer;
