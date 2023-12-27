import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../../redux/store";
import { authApiUrl } from "../../config/variables";

export interface User {
  firstName: string;
  lastName: string;
}

export interface UserResponse {
  user: User;
  token: string;
  data: {
    mfa_token: string;
    isMFAset: boolean;
    mfa_required: boolean;
    refresh_token: string;
    access_token: string;
  };
  message: string;
}
export interface LoginRequest {
  portal: string;
  email: string | null;
  password: string | null;
  remember: boolean;
}

export interface SignupRequest {
  email: string;
  emailSubscription: boolean;
  firstName: string;
  lastName: string;
  password: string;
  portal: string;
  tAndCsAccepted: boolean;
  use_mfa: boolean;
}
export interface SignupResponse {
  status: string;
  data: {
    access_token: string;
    refresh_token: string;
    id_token: string;
    scope: string;
    expires_in: number;
    token_type: "Bearer";
  };
  message: string;
}

export interface SetupTwoFARequest {
  authenticator_types: any[];
  mfa_token: string | null;
}

export interface SetupTwoFAResponse {
  message: string;
  data: {
    barcodeUri: string;
    mfa_token: string;
  };
}

export interface TwoFAQrCodeResponse {
  data: {
    barcode_uri: string;
  };
}

export interface VerifyMFARequest {
  refreshToken: string | null;
  otp: string;
}

export interface User {
  addressValidated: boolean;
  addressVerified: boolean;
  mobilePhoneValidated: boolean;
  mobilePhoneVerified: boolean;
  emailValidated: boolean;
  emailVerified: true;
  loginFailCount: number;
  isProfileUpdated: boolean;
  tAndCsAccepted: boolean;
  emailSubscription: boolean;
  active: boolean;
  _id: string;
  entityId: string;
  firstName: string;
  lastName: string;
  email: string;
  portal: string;
  userType: string;
  mfaEnabled: boolean;
  role: { [key: string]: string };
}

export interface ProfileResponse {
  status: string;
  data: {
    addressValidated: boolean;
    addressVerified: boolean;
    mobilePhoneValidated: boolean;
    mobilePhoneVerified: boolean;
    emailValidated: boolean;
    emailVerified: true;
    loginFailCount: number;
    isProfileUpdated: boolean;
    tAndCsAccepted: boolean;
    emailSubscription: boolean;
    active: boolean;
    _id: string;
    entityId: string;
    firstName: string;
    lastName: string;
    email: string;
    portal: string;
    userType: string;
    mfaEnabled: boolean;
    role: { [key: string]: string };
    entity: {
      brands: [
        {
          products: any[];
        }
      ];
      documentsComment: any[];
      entityType: string;
      externalScreeningResult: string;
      genericInformation: {
        registeredCompanyName: string;
        tradingName: string;
        companyNumber: string;
        companyType: string;
        tier: string;
        parentId: string;
        countryOfIncorporation: string;
        isParent: string;
        hasPartnerCompanies: string;
        addresses: any[];
        websiteAddress: any[];
        linkedCompanyIds: any[];
        industries: any[];
      };
      kycInformation: {
        kycRefreshInformation: {
          questions: {
            isExpectedChanges: boolean;
          };
        };
        kycStatus: string;
      };
      profile: { [key: string]: any };
      progressLogs: { [key: string]: boolean };
      regulatoryDetails: {
        licenses: [
          {
            id: string;
            documentId: string;
            licenseType: string;
            licenseHolderName: string;
            licenseNumber: string;
            regulatedCountry: string;
            regulatoryLicenseShared: boolean;
            reason: string;
            comments: string;
          }
        ];
        licenseHolderName: string;
        transactionMonitor: boolean;
        amlPolicyDetails: {
          amlPolicyShared: boolean;
          comments: string;
        };
        isOperatingInRiskCountries: boolean;
        subjectToRegulatoryEnforcement: boolean;
        flowOfFundsComment: string;
        reasonForUsingOurServices: string;
        majorityClientBase: string;
        majorityClientJurisdiction: any[];
      };
      operationsDetails: {
        ecommercePayments: {
          deposits_payins: [
            {
              id: string;
              currency: string;
              monthlyNumberOfTransactions: string | number;
              monthlyValueOfTransactions: string | number;
              averageSingleTransactionValue: string | number;
            }
          ];
          payouts: [
            {
              id: string;
              currency: string;
              monthlyNumberOfTransactions: string | number;
              monthlyValueOfTransactions: string | number;
              averageSingleTransactionValue: string | number;
            }
          ];
        };
        exoticFx: { exoticFxCurrencyPairs: any[] };
        fx: { fxCurrencyPairs: any[] };
        globalAccounts: {
          inbound: any[];
          outbound: any[];
        };
      };
      riskCategory: string;
    };
  };
}

export interface MFARequest {
  code: string;
  email: string | null;
  mfa_token: string | null;
}

export interface MFAResponse {
  status: string;
  message: string;
  data: {
    access_token: string;
    expires_in: number;
    token_type: "Bearer";
    refresh_token: string;
  };
}

export interface ResetPasswordRequest {
  email: string;
}
//TODO Verify expected response data format
export interface ResetPasswordResponse {
  status: string;
  message: string;
  data: { [key: string]: string };
}

//TODO Verify expected Request data format
export interface ChangePasswordRequest {
  password: string;
  newPassword: string;
}

//TODO Verify expected response data format
export interface ChangePasswordResponse {
  message: string;
  data: { [key: string]: string };
}

//Send Email Verify expected request data format

export interface ResendEmailRequest {
  email: string | null;
}

//Send Email Verify expected response data format
export interface ResendEmailResponse {
  status: string;
  message: string;
  data: { [key: string]: string };
}

// update email address
export interface UpdateEmailRequest {
  email: string | null;
}

export interface UpdateEmailResponse {
  status: string;
  message: string;
  data: { [key: string]: string };
}

export const api = createApi({
  reducerPath: "ccApi",
  baseQuery: fetchBaseQuery({
    baseUrl: authApiUrl,
    prepareHeaders: (headers, { getState }) => {
      // By default, if we have a token in the store, let's use that for authenticated requests
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    }
  }),
  tagTypes: [
    "Unlink_Group_Get_Client_Detail",
    "Get_Users_Upon_New_User_Post",
    "Get_People_Upon_New_People_Post"
  ],
  endpoints: (builder) => ({
    login: builder.mutation<UserResponse, LoginRequest>({
      query: (credentials) => ({
        url: "auth/login",
        method: "POST",
        body: credentials
      })
    }),
    signup: builder.mutation<SignupResponse, SignupRequest>({
      query: (credentials) => ({
        url: "auth/signup",
        method: "POST",
        body: credentials
      })
    }),
    setupTwoFA: builder.mutation<SetupTwoFAResponse, SetupTwoFARequest>({
      query: (credentials) => ({
        url: "auth/setup-authenticator",
        method: "POST",
        body: credentials
      })
    }),
    getTwoFAQrCode: builder.mutation<TwoFAQrCodeResponse, any>({
      query: (credentials) => ({
        url: "two-factor",
        method: "POST",
        body: credentials
      })
    }),
    verifyMFACode: builder.mutation<any, VerifyMFARequest>({
      query: (credentials) => ({
        url: "verify-otp",
        method: "POST",
        body: credentials
      })
    }),
    resetPassword: builder.mutation<
      ResetPasswordResponse,
      ResetPasswordRequest
    >({
      query: (credentials) => ({
        url: "auth/password/reset",
        method: "POST",
        body: credentials
      })
    }),
    changePassword: builder.mutation<
      ChangePasswordResponse,
      ChangePasswordRequest
    >({
      query: (credentials) => ({
        url: "auth/password/change",
        method: "POST",
        body: credentials
      })
    }),
    getProfile: builder.query<ProfileResponse, any>({
      query: () => ({
        url: "profile",
        method: "GET"
      })
    }),
    protected: builder.mutation<{ message: string }, void>({
      query: () => "protected"
    }),
    twoFactorAuthentication: builder.mutation<MFAResponse, MFARequest>({
      query: (credentials) => ({
        url: "auth/login/otp",
        method: "POST",
        body: credentials
      })
    }),
    resendEmail: builder.mutation<ResendEmailResponse, ResendEmailRequest>({
      query: (email) => ({
        url: "confirm-email",
        method: "POST",
        body: email
      })
    }),
    updateEmailAddress: builder.mutation<
      UpdateEmailResponse,
      UpdateEmailRequest
    >({
      query: (email) => ({
        url: "email",
        method: "PUT",
        body: email
      })
    }),
    getClient: builder.query<any, any>({
      query: ({ clientId }) => ({
        url: `users?entityId=${clientId}`,
        method: "GET"
      })
    }),
    getUserById: builder.query<{ data: User }, { id: string }>({
      query: ({ id }) => ({
        url: `users/${id}`,
        method: "GET"
      })
    })
  })
});

export const {
  useLoginMutation,
  useProtectedMutation,
  useTwoFactorAuthenticationMutation,
  useSetupTwoFAMutation,
  useVerifyMFACodeMutation,
  useGetTwoFAQrCodeMutation,
  useGetProfileQuery,
  useSignupMutation,
  useChangePasswordMutation,
  useResetPasswordMutation,
  useResendEmailMutation,
  useUpdateEmailAddressMutation,
  useGetClientQuery,
  useGetUserByIdQuery
} = api;
