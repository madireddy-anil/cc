import {
  configureStore,
  ThunkAction,
  Action,
  combineReducers
} from "@reduxjs/toolkit";
import localeReducer from "../config/i18n/localeSlice";

/**
 *
 *  Service imports
 *
 */
import { api } from "../services/ControlCenter/ccService";
import { accountApi } from "../services/accountService";
import { paymentApi } from "../services/paymentService";
import { routesApi } from "../services/routesService";
import { bmsApi } from "../services/bmsService";
import { rateApi } from "../services/ratesService";
import { errorQueueApi } from "../services/errorQueueService";
import { clientManagementApi } from "../services/clientManagement";
import { termsOfServiceDocumentsApi } from "../services/termsOfServiceDocument";
import { documentUploadApi } from "../services/documentUploadService";
import { api as financeApi } from "../services/ExoticFX/Finance/endpoints/depositEndpoints";
import { gppApi } from "../services/gppService";
import { filesApi } from "../services/clientFileService";

/**
 *
 *  Slice imports
 *
 */
import authReducer from "../config/auth/authSlice";
import generalReducer from "../config/general/generalSlice";
import accountReducer from "../config/account/accountSlice";
import tradeReducer from "../config/trades/tradeSlice";
import beneficiaryReducer from "../pages/Components/Beneficiary/BeneficiarySlice";
import depositAmountReducer from "../pages/Components/DepositAmount/DepositAmountSlice";
import selectAccountReducer from "../pages/Components/AccountSelection/AccountSelectionSlice";
import errorQueueReducer from "../config/errorQueue/errorQueueSlice";
import ratesReducer from "../config/rate/rateSlice";
import clientReducer from "../pages/Components/ClientSelection/ClientSelectionSlice";
import currenciesReducer from "../config/currencies/currenciesSlice";
import paymentReducer from "../pages/Payments/PaymentSlice";
import countriesReducer from "../config/countries/countriesSlice";
import clientManagementReducer from "../config/ClientMangement/ClientManagementSlice";
import termsOfServiceReducer from "../config/TermsAndConditions/termsAndConditionsSlice";
import rememberReducer from "../config/auth/rememberMeSlice";
import termsOfServiceDocumentReducer from "../config/TermsAndConditions/termsOfServiceDocumentSlice";
import documentUploadReducer from "../config/documentUpload/documentUploadSlice";
import payerSelectionReducer from "../pages/Payments/components/PayerSelection/payerSelectionSlice";
import moveBetweenAccountSelectionReducer from "../pages/Payments/components/PaymentBeneficiary/moveBetweenAccountSlice";
import paymentForReducer from "../pages/Payments/components/PaymentFor/paymentForSlice";
import applicationApprovalReducer from "../config/applicationApproval/applicationApprovalSlice";
import clientFilesReducer from "../config/ClientFiles/ClientFilesSlice";

import {
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER
} from "redux-persist";
import { tradeApi } from "../services/tradesService";
import { beneficiaryApi } from "../services/beneficiaryService";
import { revokeTokenApi } from "../services/tokenService";

import {
  authPersistConfig,
  tradesPersistConfig,
  persistConfig,
  errorQueuesPersistConfig
} from "./persistorConfiguration";
import indicativeRateReducer from "../config/rate/indicativeRateSlice";

const rootReducer = combineReducers({
  // reducers and persistor
  auth: persistReducer(authPersistConfig, authReducer),
  trades: persistReducer(tradesPersistConfig, tradeReducer),
  indicativeRate: persistReducer(tradesPersistConfig, indicativeRateReducer),
  errorQueue: persistReducer(errorQueuesPersistConfig, errorQueueReducer),

  // reducers apis
  [api.reducerPath]: api.reducer,
  [tradeApi.reducerPath]: tradeApi.reducer,
  [beneficiaryApi.reducerPath]: beneficiaryApi.reducer,
  [accountApi.reducerPath]: accountApi.reducer,
  [routesApi.reducerPath]: routesApi.reducer,
  [paymentApi.reducerPath]: paymentApi.reducer,
  [bmsApi.reducerPath]: bmsApi.reducer,
  [rateApi.reducerPath]: rateApi.reducer,
  [errorQueueApi.reducerPath]: errorQueueApi.reducer,
  [clientManagementApi.reducerPath]: clientManagementApi.reducer,
  [documentUploadApi.reducerPath]: documentUploadApi.reducer,
  [termsOfServiceDocumentsApi.reducerPath]: termsOfServiceDocumentsApi.reducer,
  [financeApi.reducerPath]: financeApi.reducer,
  [gppApi.reducerPath]: gppApi.reducer,
  [revokeTokenApi.reducerPath]: revokeTokenApi.reducer,
  [filesApi.reducerPath]: filesApi.reducer,

  // reducers
  locale: localeReducer,
  beneficiary: beneficiaryReducer,
  depositAmount: depositAmountReducer,
  selectAccount: selectAccountReducer,
  general: generalReducer,
  account: accountReducer,
  rates: ratesReducer,
  currencies: currenciesReducer,
  client: clientReducer,
  payment: paymentReducer,
  countries: countriesReducer,
  clientManagement: clientManagementReducer,
  termsAndConditions: termsOfServiceReducer,
  remember: rememberReducer,
  termsOfServiceDocuments: termsOfServiceDocumentReducer,
  documentUpload: documentUploadReducer,
  payerSelection: payerSelectionReducer,
  moveBetweenAccountSelection: moveBetweenAccountSelectionReducer,
  paymentForSelection: paymentForReducer,
  applicationApproval: applicationApprovalReducer,
  clientFiles: clientFilesReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
      }
    }).concat(
      api.middleware,
      accountApi.middleware,
      paymentApi.middleware,
      tradeApi.middleware,
      beneficiaryApi.middleware,
      financeApi.middleware,
      routesApi.middleware,
      bmsApi.middleware,
      rateApi.middleware,
      errorQueueApi.middleware,
      clientManagementApi.middleware,
      gppApi.middleware,
      filesApi.middleware
    )
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
