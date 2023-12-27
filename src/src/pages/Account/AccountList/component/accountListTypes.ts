export type DropDownOptionType = [any, any];

export type DropDownGroupType = {
  region?: DropDownOptionType[];
  accountOwner?: DropDownOptionType[];
  issuerCompany?: DropDownOptionType[];
  issuerVendor?: DropDownOptionType[];
  currency?: DropDownOptionType[];
  mainCurrency?: DropDownOptionType[];
  linkedVendor?: DropDownOptionType[];
  brand?: DropDownOptionType[];
  product?: DropDownOptionType[];
  suspenseAccount?: DropDownOptionType[];
  linkedNetworkFeeAccount?: DropDownOptionType[];
  parentAccount?: DropDownOptionType[];
};

export type CurrencySetType = "fiat" | "crypto" | undefined;

export type CurrentPageType =
  | "page-1"
  | "page-2"
  | "success"
  | "fail"
  | "submit";

export type FormPageType =
  | "client"
  | "pl"
  | "vendor-client"
  | "vendor-pl"
  | "suspense";

export type FormDataType = {
  accountIssuer: undefined | string;
  accountName: undefined | string;
  accountOwner: undefined | string;
  // isTreasury: boolean;
  currency: undefined | string;
  linkedVendorAccount: undefined | string;
  ownerEntityId: string;
  issuerEntityId: string;
  currencyId: string;
  isBlockedInbound: boolean;
  isBlockedOutbound: boolean;
  productBrandId: string;
  productId: string;
  currencyType: "crypto" | "fiat";
  mainCurrency: undefined | string;
  mainCurrencyId: string;
  isNetworkFee: boolean;
  suspenseAccountId: undefined | string;
  networkFeeAccountId: undefined | string;
  parentId: undefined | string;
  accountIdentification: {
    autoGenerateFromBank: true;
    accountRegion?: string;
    accountNumber?: string;
    bankCode?: string;
    IBAN?: string;
    BIC?: string;
  };
};

export type PageConfigType = {
  page: CurrentPageType;
  type: FormPageType;
  title: string;
  subTitle?: string | undefined;
  isAutoGenerate?: true | false;
  isLoading?: boolean;
  currency?: string;
  mainCurrency?: string;
  currencyType?: "fiat" | "crypto" | undefined;
  caption?: string;
};

export type FormButtonConfigType = {
  onOkayText?: string | undefined;
  onCancelText?: string | undefined;
  onClickCancel?: () => void | undefined;
};
