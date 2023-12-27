import { createSlice } from "@reduxjs/toolkit";
import { termsOfServiceDocumentsApi } from "../../services/termsOfServiceDocument";
import { userLogoutAction } from "../general/actions";

export type SliceState = {
  selectedVersion: { [key: string]: any };
  preSignedURLData: { [key: string]: any };
  preSignedDownloadURL: string;
  existingFileName: string;
  currentFileName: string;
  termsBase64: string;
  uploadedFileList: any[];
  contentEditable: boolean;
  showTermsOfServiceCreateModal: boolean;
  showTermsOfServiceViewModal: boolean;
};

const initialState: SliceState = {
  selectedVersion: {},
  preSignedURLData: {},
  preSignedDownloadURL: "",
  existingFileName: "",
  currentFileName: "",
  termsBase64: "",
  uploadedFileList: [],
  contentEditable: false,
  showTermsOfServiceCreateModal: false,
  showTermsOfServiceViewModal: false
};

const termsOfServiceDocumentSlice = createSlice({
  name: "termsOfServiceDocuments",
  initialState: initialState,
  reducers: {
    UpdateSelectedVersion(state, action) {
      return {
        ...state,
        selectedVersion: action.payload
      };
    },
    UpdateShowTermsOfServiceViewModal(state, action) {
      return {
        ...state,
        showTermsOfServiceViewModal: action.payload
      };
    },
    UpdateShowTermsOfServiceCreateModal(state, action) {
      return {
        ...state,
        showTermsOfServiceCreateModal: action.payload
      };
    },
    updateExistingFileName(state, action) {
      return {
        ...state,
        existingFileName: action.payload
      };
    },
    updateCurrentFileName(state, action) {
      return {
        ...state,
        currentFileName: action.payload
      };
    },
    updateTermsBase64(state, action) {
      return {
        ...state,
        termsBase64: action.payload
      };
    },
    updateUploadedFileList(state, action) {
      return {
        ...state,
        uploadedFileList: action.payload
      };
    },
    updateContentEditable(state, action) {
      return {
        ...state,
        contentEditable: action.payload
      };
    },
    resetToInitialState: () => initialState
  },
  extraReducers: (builder) => {
    builder
      .addCase(userLogoutAction, () => {
        return initialState;
      })
      .addMatcher(
        termsOfServiceDocumentsApi.endpoints.getPresignedURL.matchFulfilled,
        (state, { payload }) => {
          state.preSignedURLData = payload;
        }
      )
      .addMatcher(
        termsOfServiceDocumentsApi.endpoints.getPresignedURLForDownload
          .matchFulfilled,
        (state, { payload }) => {
          state.preSignedDownloadURL = payload?.filePreSignedData;
        }
      )
      .addMatcher(
        termsOfServiceDocumentsApi.endpoints.deleteDocumentFile.matchFulfilled,
        (state, { payload }) => {
          state.preSignedURLData = {};
          state.preSignedDownloadURL = "";
        }
      );
  }
});

export const {
  UpdateSelectedVersion,
  UpdateShowTermsOfServiceCreateModal,
  UpdateShowTermsOfServiceViewModal,
  updateExistingFileName,
  updateCurrentFileName,
  updateTermsBase64,
  updateUploadedFileList,
  updateContentEditable,
  resetToInitialState
} = termsOfServiceDocumentSlice.actions;

export default termsOfServiceDocumentSlice.reducer;
