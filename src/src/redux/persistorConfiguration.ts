import storage from "redux-persist/lib/storage";
import { encryptTransform } from "redux-persist-transform-encrypt";
import { persistEncryptKey } from "../config/variables";

// CP stands for Client Portal, use CP before any persist key
// to not persist data from Control Center(CC) by mistake

const encryptor = encryptTransform({
  secretKey: persistEncryptKey
});

export const persistConfig = {
  key: "cc",
  version: 1,
  storage,
  blacklist: [
    "auth",
    "account",
    "accountApi",
    "tradeHistory",
    "trades",
    "tradeApi"
  ],
  transforms: [encryptor]
};

// Don't Persist MFA Token after Refresh
export const authPersistConfig = {
  key: "cc-auth",
  storage,
  blacklist: ["showMFAModal", "mfa_token", "portal"],
  transforms: [encryptor]
};

// Don't Persist Deposit data
export const tradesPersistConfig = {
  key: "cc-trades",
  storage,
  blacklist: [
    "deposit",
    "list",
    "something",
    "currentPageList",
    "tradesHistory"
  ],
  transforms: [encryptor]
};

export const errorQueuesPersistConfig = {
  key: "cc-error-queues",
  storage,
  blacklist: ["rows"],
  transforms: [encryptor]
};
