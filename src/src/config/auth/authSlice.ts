import { createSlice } from "@reduxjs/toolkit";
import { api } from "../../services/ControlCenter/ccService";
import type { RootState } from "../../redux/store";
import { userLogoutAction } from "../general/actions";

type AuthState = {
  portal: "bms";
  clientId: string;
  firstName: string;
  lastName: string;
  email: string | null;
  role: { [key: string]: string };
  token: string | null;
  refresh_token: string | null;
  mfa_token: string | null;
  barcodeUri: string;
  isMFAset: boolean;
  mfa_required: boolean;
  showMFAModal: boolean;
  showSetupMFAModal: boolean;
  rememberMe: boolean;
  message?: string | null;
  emailVerified?: boolean;
  profile: any;
};

const initialState = {
  portal: "bms",
  clientId: "",
  firstName: "",
  lastName: "",
  email: null,
  token: null,
  mfa_token: null,
  mfa_required: false,
  isMFAset: false,
  barcodeUri: "",
  showMFAModal: false,
  showSetupMFAModal: false,
  rememberMe: false,
  message: null,
  emailVerified: false,
  profile: {}
} as AuthState;

const authSlice = createSlice({
  name: "auth",
  initialState: initialState,
  reducers: {
    updateAccessToken(state, action) {
      return {
        ...state,
        token: action.payload
      };
    },
    updateEmailAction(state, action) {
      return {
        ...state,
        email: action.payload
      };
    },
    showMFAModalAction(state, action) {
      return {
        ...state,
        showMFAModal: action.payload
      };
    },
    showSetupMFAModalAction(state, action) {
      return {
        ...state,
        isMFAset: state.isMFAset ? true : false,
        showSetupMFAModal: action.payload
      };
    },
    setRememberMeAction(state, action) {
      return {
        ...state,
        rememberMe: action.payload
      };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(userLogoutAction, () => {
        return initialState;
      })
      .addMatcher(api.endpoints.login.matchFulfilled, (state, { payload }) => {
        state.mfa_token = payload.data.mfa_token;
        state.refresh_token = payload.data.refresh_token;
        state.token = payload?.data?.access_token
          ? payload?.data?.access_token
          : null;
        state.isMFAset = payload.data.isMFAset;
        state.mfa_required = payload.data.mfa_required;
        state.showMFAModal =
          !payload.data.mfa_required && payload.data?.isMFAset;
        state.showSetupMFAModal =
          payload.data?.mfa_required && payload.data.mfa_required;
      })
      .addMatcher(
        api.endpoints.twoFactorAuthentication.matchFulfilled,
        (state, { payload }) => {
          state.showSetupMFAModal = false;
          state.token = payload.data.access_token;
          state.message = payload.message;
        }
      )
      .addMatcher(
        api.endpoints.setupTwoFA.matchFulfilled,
        (state, { payload }) => {
          state.mfa_token = payload.data.mfa_token;
          state.barcodeUri = payload.data.barcodeUri;
        }
      )
      .addMatcher(
        api.endpoints.getTwoFAQrCode.matchFulfilled,
        (state, { payload }) => {
          state.barcodeUri = payload?.data?.barcode_uri;
        }
      )
      .addMatcher(
        api.endpoints.verifyMFACode.matchFulfilled,
        (state, { payload }) => {
          state.isMFAset = true;
          state.showSetupMFAModal = false;
        }
      )
      .addMatcher(api.endpoints.signup.matchFulfilled, (state, { payload }) => {
        state.token = payload.data.access_token;
        state.message = payload.message;
      })
      .addMatcher(
        api.endpoints.resetPassword.matchFulfilled,
        (state, { payload }) => {
          state.message = payload.message;
        }
      )
      .addMatcher(
        api.endpoints.getProfile.matchFulfilled,
        (state, { payload }) => {
          state.profile = payload.data;
          state.email = payload?.data?.email;
          state.clientId = payload.data.entityId;
          state.firstName = payload.data.firstName;
          state.lastName = payload.data.lastName;
          state.emailVerified = payload.data.emailVerified;
          state.isMFAset = payload?.data?.mfaEnabled;
        }
      );
  }
});

// Pull Actions and Reducer from AuthSlice
const { actions, reducer } = authSlice;

// Export All the actions
export const {
  updateEmailAction,
  showMFAModalAction,
  showSetupMFAModalAction,
  setRememberMeAction,
  updateAccessToken
} = actions;

// Export default the reducer
export default reducer;

//Export select to get specific data from the store
export const selectAuth = (state: RootState) => state.auth;
export const selectCurrentUser = (state: RootState) => state.auth.firstName;
export const selectMFAToken = (state: RootState) => state.auth.mfa_token;
export const selectEntity = (state: RootState) => state.auth.profile?.entity;
export const selectEntityId = (state: RootState) =>
  state.auth.profile?.entityId;

export const selectId = (state: RootState) => state.auth?.profile?.id;
