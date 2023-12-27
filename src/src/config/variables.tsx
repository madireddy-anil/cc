const authApiUrl = process.env.REACT_APP_AUTH_API_URL;
const tradeApiUrl = process.env.REACT_APP_TRADES_API_URL;
const routesApiUrl = process.env.REACT_APP_ROUTES_API_URL;
const bmsServiceUrl = process.env.REACT_APP_BMS_SERVICE_API_URL;
const currencyAccountsApi = process.env.REACT_APP_BMS_SERVICE_API_URL;
const beneficiaryApiUrl = process.env.REACT_APP_BENEFICIARY_API_URL;
const paymentUrl = process.env.REACT_APP_PAYMENT_API_URL;
const ratesApiUrl = process.env.REACT_APP_RATES_API_URL;
const financeApiUrl = process.env.REACT_APP_FINANCE_API_URL;
const termsOfServiceDocumentsUrl = process.env.REACT_APP_TERMS_SERVICES_DOC_URL;
const gppURL = process.env.REACT_APP_GPP_API_URL;
const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID || "";
const audience = process.env.REACT_APP_AUTH0_AUDIENCE || "";
const domain = process.env.REACT_APP_AUTH0_DOMAIN || "";
const redirectionUrl =
  process.env.REACT_APP_AUTH0_REDIRECTION_URL ||
  "http://localhost:3000/verify-authorization";
const auth0Scope =
  process.env.REACT_APP_AUTH0_SCOPE ||
  "openid profile email address phone offline_access enroll";
const logoutUrl =
  process.env.REACT_APP_LOGOUT_URL || "http://localhost:3000/login";
const revokeTokenUrl = process.env.REACT_APP_REVOKE_TOKEN_API_URL;
const persistEncryptKey =
  process.env.REACT_PERSIST_ENCRYPT_KEY || "orbital_control_center_platform";
const uploadFilesApiUrl = process.env.REACT_APP_UPLOAD_FILES_API_URL;

export {
  authApiUrl,
  bmsServiceUrl,
  paymentUrl,
  currencyAccountsApi,
  tradeApiUrl,
  routesApiUrl,
  beneficiaryApiUrl,
  ratesApiUrl,
  financeApiUrl,
  termsOfServiceDocumentsUrl,
  gppURL,
  clientId,
  audience,
  domain,
  redirectionUrl,
  auth0Scope,
  logoutUrl,
  revokeTokenUrl,
  persistEncryptKey,
  uploadFilesApiUrl
};
