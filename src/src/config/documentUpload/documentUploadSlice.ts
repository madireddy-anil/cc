import { createSlice } from "@reduxjs/toolkit";
import { documentUploadApi } from "../../services/documentUploadService";
import { userLogoutAction } from "../general/actions";

type SliceState = {
  uploadFileLoader: boolean;
};

const initialState: SliceState = {
  uploadFileLoader: false
};

const documentUploadSlice = createSlice({
  name: "documentUpload",
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(userLogoutAction, () => {
        return initialState;
      })
      .addMatcher(
        documentUploadApi.endpoints.addDocumentFile.matchFulfilled,
        (state, { payload }) => {
          state.uploadFileLoader = false;
        }
      )
      .addMatcher(
        documentUploadApi.endpoints.addDocumentFile.matchPending,
        (state, { payload }) => {
          state.uploadFileLoader = true;
        }
      )
      .addMatcher(
        documentUploadApi.endpoints.addDocumentFile.matchRejected,
        (state, { payload }) => {
          state.uploadFileLoader = false;
        }
      );
  }
});

// export const {} = documentUploadSlice.actions;

export default documentUploadSlice.reducer;
