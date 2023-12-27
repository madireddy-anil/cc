import { FC, ReactElement } from "react";
import {
  Modal,
  Form as DSForm,
  Notification
} from "@payconstruct/design-system";

import {
  useGetClientEntitiesQuery,
  useGetCompaniesQuery,
  useGetVendorsQuery
} from "../../../../../services/ControlCenter/endpoints/entitiesEndpoint";
import {
  useGetAccountCurrenciesQuery,
  useGetVendorAccountsQuery
} from "../../../../../services/bmsService";
import {
  useGetAccountsQuery,
  useCreateAccountMutation
} from "../../../../../services/accountService";
import { useGetBrandsQuery } from "../../../../../services/ControlCenter/endpoints/optionsEndpoint";
import countriesData from "../../../../../components/StaticData/Countries";
import {
  DropDownGroupType,
  DropDownOptionType,
  FormDataType,
  PageConfigType,
  FormButtonConfigType
} from "../accountListTypes";
// import { updateCurrencyType } from "../../../../../config/account/accountSlice";

import Page1 from "./Page1";
import Page2 from "./Page2";
import css from "./style.module.css";

export const initialPageConfig: PageConfigType = {
  page: "page-1",
  type: "client",
  title: "New Client Payment Account",
  subTitle: "Enter details required for a new account",
  currencyType: "fiat",
  isAutoGenerate: false,
  caption: ""
};

export const initialFormData: Partial<FormDataType> = {
  accountIssuer: "",
  accountName: "",
  accountOwner: "",
  productBrandId: undefined,
  productId: undefined,
  currency: undefined,
  mainCurrency: undefined,
  linkedVendorAccount: undefined,
  parentId: undefined
};

const getAccountFormItems = (
  modalPageConfig: PageConfigType,
  dropDownData: any,
  setModalPageConfig: (e: any) => void,
  form: any,
  setModalFormData: (option: any) => void,
  modalFormData: any
) => {
  const { page, type, currencyType } = modalPageConfig;
  const {
    clientEntityData,
    companyEntityData,
    vendorEntityData,
    vendorAccountData,
    accountCurrencyData,
    brandsData,
    accounts
  } = dropDownData;

  const cryptoList: Array<string> = [];
  let LoadPage: ReactElement, dropdownList: DropDownGroupType;

  const getEntityOptions = (optionsData: any, type: string = "entity") => {
    const optionRows: Array<DropDownOptionType> = [];
    if (type === "vendor" || type === "company" || type === "client") {
      for (const x in optionsData) {
        if (optionsData[x]["genericInformation"]["registeredCompanyName"]) {
          let optionItem: DropDownOptionType = [
            optionsData[x]["id"],
            optionsData[x]["genericInformation"]["registeredCompanyName"]
          ];
          optionRows.push(optionItem);
        }
      }
    }
    if (type === "vendorClientAccount") {
      for (const account in optionsData) {
        if (optionsData[account]["accountName"]) {
          if (optionsData[account]["accountType"] === "vendor_client") {
            let optionItem: DropDownOptionType = [
              optionsData[account]["id"],
              `${optionsData[account]["accountName"]} - ${optionsData[account]["currency"]}`
            ];
            optionRows.push(optionItem);
          }
        }
      }
    }
    if (type === "vendorPlAccount") {
      for (const account in optionsData) {
        if (optionsData[account]["accountName"]) {
          if (optionsData[account]["accountType"] === "vendor_pl") {
            let optionItem: DropDownOptionType = [
              optionsData[account]["id"],
              `${optionsData[account]["accountName"]} - ${optionsData[account]["currency"]}`
            ];
            optionRows.push(optionItem);
          }
        }
      }
    }
    if (type === "vendorAccount") {
      for (const account in optionsData) {
        if (optionsData[account]["accountName"]) {
          let optionItem: DropDownOptionType = [
            optionsData[account]["id"],
            `${optionsData[account]["accountName"]} - ${optionsData[account]["currency"]}`
          ];
          optionRows.push(optionItem);
        }
      }
    }
    if (type === "vendorClientAccount") {
      for (const account in optionsData) {
        if (optionsData[account]["accountName"]) {
          if (optionsData[account]["accountType"] === "vendor_client") {
            let optionItem: DropDownOptionType = [
              optionsData[account]["id"],
              `${optionsData[account]["accountName"]} - ${optionsData[account]["currency"]}`
            ];
            optionRows.push(optionItem);
          }
        }
      }
    }
    if (type === "vendorPlAccount") {
      for (const account in optionsData) {
        if (optionsData[account]["accountName"]) {
          if (optionsData[account]["accountType"] === "vendor_pl") {
            let optionItem: DropDownOptionType = [
              optionsData[account]["id"],
              `${optionsData[account]["accountName"]} - ${optionsData[account]["currency"]}`
            ];
            optionRows.push(optionItem);
          }
        }
      }
    }
    if (type === "suspenseAccount") {
      for (const y in optionsData) {
        if (optionsData[y]["accountType"] === "suspense") {
          let optionItem: DropDownOptionType = [
            optionsData[y]["id"],
            `${optionsData[y]["accountName"]}`
          ];
          optionRows.push(optionItem);
        }
      }
    }
    if (type === "linkedNetworkFeeAccount") {
      for (const Z in optionsData) {
        if (
          optionsData[Z]["accountType"] === "vendor_client" ||
          optionsData[Z]["accountType"] === "vendor_pl"
        ) {
          let optionItem: DropDownOptionType = [
            optionsData[Z]["id"],
            `${optionsData[Z]["accountName"]}`
          ];
          optionRows.push(optionItem);
        }
      }
    }
    if (type === "parent_client") {
      for (const Z in optionsData) {
        if (optionsData[Z]["accountType"] === "vendor_client") {
          let optionItem: DropDownOptionType = [
            optionsData[Z]["id"],
            `${optionsData[Z]["accountName"]}`
          ];
          optionRows.push(optionItem);
        }
      }
    }
    if (type === "parentvendor_client") {
      for (const Z in optionsData) {
        if (
          optionsData[Z]["accountType"] === "client" ||
          optionsData[Z]["accountType"] === "suspense"
        ) {
          let optionItem: DropDownOptionType = [
            optionsData[Z]["id"],
            `${optionsData[Z]["accountName"]}`
          ];
          optionRows.push(optionItem);
        }
      }
    }
    if (type === "parentvendor_pl") {
      for (const Z in optionsData) {
        if (
          optionsData[Z]["accountType"] === "pl" ||
          optionsData[Z]["accountType"] === "suspense"
        ) {
          let optionItem: DropDownOptionType = [
            optionsData[Z]["id"],
            `${optionsData[Z]["accountName"]}`
          ];
          optionRows.push(optionItem);
        }
      }
    }
    if (type === "product") {
      for (const x in optionsData) {
        let optionItem: DropDownOptionType = [
          optionsData[x]["id"],
          optionsData[x]["product"]
        ];
        optionRows.push(optionItem);
      }
    }
    if (type === "country") {
      for (const x in optionsData) {
        let optionItem: DropDownOptionType = [
          optionsData[x]["country_code"],
          optionsData[x]["country"]
        ];
        optionRows.push(optionItem);
      }
    }
    if (type === "currency") {
      for (const x in optionsData) {
        let optionItem: DropDownOptionType = [
          optionsData[x]["id"],
          `${optionsData[x]["code"]}`
        ];
        if (optionsData[x]["type"] === "crypto")
          cryptoList.push(optionsData[x]["id"]);
        optionRows.push(optionItem);
      }
    }
    if (type === "mainCurrency") {
      for (const x in optionsData) {
        if (optionsData[x]["mainCurrency"] === true) {
          let optionItem: DropDownOptionType = [
            optionsData[x]["id"],
            // optionsData[x]["code"],
            `${optionsData[x]["name"]}`
          ];
          optionRows.push(optionItem);
        }
      }
    }
    return optionRows && optionRows;
  };

  if (page === "page-1") {
    dropdownList = {
      currency: getEntityOptions(accountCurrencyData, "currency"),
      mainCurrency: getEntityOptions(accountCurrencyData, "mainCurrency")
    };
    if (type === "client") {
      dropdownList.accountOwner = getEntityOptions(clientEntityData, "client");
      dropdownList.issuerCompany = getEntityOptions(
        companyEntityData,
        "company"
      );
      dropdownList.issuerVendor = getEntityOptions(vendorEntityData, "vendor");
      // dropdownList.linkedVendor = getEntityOptions(
      //   vendorAccountData,
      //   "vendorClientAccount"
      // );
      dropdownList.product = getEntityOptions(
        brandsData[0].products,
        "product"
      );
      dropdownList.parentAccount = getEntityOptions(accounts, "parent_client");
    }
    if (type === "pl") {
      // dropdownList.linkedVendor = getEntityOptions(
      //   vendorAccountData,
      //   "vendorPlAccount"
      // );
      dropdownList.accountOwner = dropdownList.issuerCompany = getEntityOptions(
        companyEntityData,
        "company"
      );
    }
    if (type === "vendor-client") {
      dropdownList.accountOwner = getEntityOptions(
        companyEntityData,
        "company"
      );
      dropdownList.issuerVendor = getEntityOptions(vendorEntityData, "vendor");
      dropdownList.suspenseAccount = getEntityOptions(
        accounts,
        "suspenseAccount"
      );
      dropdownList.linkedNetworkFeeAccount = getEntityOptions(
        accounts,
        "linkedNetworkFeeAccount"
      );
      dropdownList.parentAccount = getEntityOptions(
        accounts,
        "parentvendor_client"
      );
    }
    if (type === "vendor-pl") {
      dropdownList.accountOwner = getEntityOptions(
        companyEntityData,
        "company"
      );
      dropdownList.issuerVendor = getEntityOptions(vendorEntityData, "vendor");
      dropdownList.suspenseAccount = getEntityOptions(
        accounts,
        "suspenseAccount"
      );
      dropdownList.linkedNetworkFeeAccount = getEntityOptions(
        accounts,
        "linkedNetworkFeeAccount"
      );
      dropdownList.parentAccount = getEntityOptions(
        accounts,
        "parentvendor_pl"
      );
    }
    if (type === "suspense") {
      dropdownList.accountOwner = getEntityOptions(
        companyEntityData,
        "company"
      );
      dropdownList.issuerCompany = getEntityOptions(
        companyEntityData,
        "company"
      );
      // dropdownList.linkedVendor = getEntityOptions(
      //   vendorAccountData,
      //   "vendorAccount"
      // );
    }

    LoadPage = (
      <Page1
        pageType={type}
        dropdownList={dropdownList}
        setModalPageConfig={setModalPageConfig}
        accounts={accounts}
        form={form}
        setModalFormData={setModalFormData}
        modalFormData={modalFormData}
        vendorAccountData={vendorAccountData}
        modalPageConfig={modalPageConfig}
      />
    );
  } else if (page === "page-2") {
    dropdownList = {
      region: getEntityOptions(countriesData, "country")
    };
    LoadPage = (
      <Page2
        currencyType={currencyType}
        dropdownList={dropdownList}
        setModalPageConfig={setModalPageConfig}
        modalPageConfig={modalPageConfig}
      />
    );
  } else if (page === "submit") {
    LoadPage = <>Please wait..</>;
  } else if (page === "fail" || page === "success") {
    LoadPage = <>{modalPageConfig.caption}</>;
  } else {
    LoadPage = <></>;
  }

  return <div className={css["modal-form"]}>{LoadPage}</div>;
};

interface PropTypes {
  modalVisibility?: true | false;
  setModalVisibility: (option: any) => void;
  modalPageConfig: PageConfigType;
  setModalPageConfig: (option: any) => void;
  modalButtonSettings: FormButtonConfigType;
  setModalButtonSettings: (option: any) => void;
  setModalFormData: (option: any, option2?: any) => void;
  modalFormData: any;
}

const NewAccountModalForm: FC<PropTypes> = ({
  modalVisibility,
  setModalVisibility,
  modalPageConfig,
  setModalPageConfig,
  modalButtonSettings,
  setModalButtonSettings,
  setModalFormData,
  modalFormData
}) => {
  const [form] = DSForm.useForm();
  const { onOkayText, onCancelText, onClickCancel } = modalButtonSettings;
  const { page, title, subTitle } = modalPageConfig;
  const [createAccount] = useCreateAccountMutation();

  // Owner
  const { data: clientEntity, isLoading: isClientEntityLoading } =
    useGetClientEntitiesQuery(
      // { limit: 50 },
      { refetchOnMountOrArgChange: true }
    );
  // Issuer
  const { data: companyEntity, isLoading: isCompanyEntityLoading } =
    useGetCompaniesQuery({}, { refetchOnMountOrArgChange: true });
  // Vendor
  const { data: vendorEntity, isLoading: isVendorEntityLoading } =
    useGetVendorsQuery({}, { refetchOnMountOrArgChange: true });
  // Vendor Account
  const { data: vendorAccount, isLoading: isVendorAccountLoading } =
    useGetVendorAccountsQuery({}, { refetchOnMountOrArgChange: true });
  // Account Currency
  const { data: accountCurrency, isLoading: isAccountCurrencyLoading } =
    useGetAccountCurrenciesQuery({}, { refetchOnMountOrArgChange: true });
  // Brands
  const { data: brands, isLoading: isBrandsLoading } = useGetBrandsQuery(
    {},
    { refetchOnMountOrArgChange: true }
  );
  // accounts
  const { data: accountsData, isLoading: isAccountsLoading } =
    useGetAccountsQuery(
      { pageSize: 1000 },
      {
        refetchOnMountOrArgChange: 10
      }
    );

  const allDropDownComplete =
    !isClientEntityLoading &&
    !isCompanyEntityLoading &&
    !isVendorEntityLoading &&
    !isVendorAccountLoading &&
    // !isProductsLoading &&
    !isBrandsLoading &&
    !isAccountCurrencyLoading &&
    !isAccountsLoading;

  let dropDownData: any;

  if (allDropDownComplete) {
    const {
      data: { entities: clientEntityData }
    } = clientEntity;
    const {
      data: { entities: companyEntityData }
    } = companyEntity;
    const {
      data: { entities: vendorEntityData }
    } = vendorEntity;
    const {
      data: { vendorAccounts: vendorAccountData }
    } = vendorAccount;
    const {
      data: { currency: accountCurrencyData }
    } = accountCurrency;

    const { brands: brandsData } = brands?.data || { brands };
    const {
      data: { accounts }
    } = accountsData;

    dropDownData = {
      clientEntityData,
      companyEntityData,
      vendorEntityData,
      vendorAccountData,
      accountCurrencyData,
      accountCurrency,
      brandsData,
      accounts
    };
  }

  const page1 = () => {
    setModalButtonSettings({
      onOkayText: "Proceed to Account Details",
      onCancelText: "Cancel",
      onClickCancel: () => setModalVisibility(false)
    });
    setModalPageConfig({
      ...modalPageConfig,
      page: "page-1",
      title: initialPageConfig.title,
      subTitle: initialPageConfig.subTitle
    });
  };

  const page2 = (dsFormData: any) => {
    const currency = dropDownData.accountCurrencyData.find(
      (obj: any) => obj.id === dsFormData.currencyId
    );
    const mainCurrency = dropDownData.accountCurrencyData.find(
      (obj: any) => obj.id === dsFormData.mainCurrencyId
    );

    setModalButtonSettings({
      onOkayText: "Submit",
      onCancelText: "Back",
      onClickCancel: () => page1()
    });
    setModalPageConfig({
      ...modalPageConfig,
      page: "page-2",
      currency: currency.code,
      currencyType: currency.type,
      mainCurrency: mainCurrency?.code,
      title: initialPageConfig.title,
      subTitle: initialPageConfig.subTitle
    });
  };

  const pageSubmit = () => {
    setModalButtonSettings({
      onOkayText: undefined,
      onCancelText: undefined,
      onClickCancel: undefined
    });
    setModalPageConfig({
      ...modalPageConfig,
      page: "submit",
      title: "",
      subTitle: ""
    });
  };

  const handleSetModalFormData = async (data: any, finish: any = false) => {
    if (finish) {
      const payload = {
        ...modalFormData,
        currencyType: modalPageConfig.currencyType,
        currency: modalPageConfig.currency,
        mainCurrency: modalPageConfig.mainCurrency,
        accountIdentification: {
          ...data,
          autoGenerateFromBank: modalPageConfig.isAutoGenerate
        }
      };
      setModalButtonSettings({
        onOkayText: undefined,
        onCancelText: "Back",
        onClickCancel: () => page2(payload)
      });

      console.log("data", data);
      console.log(payload);
      console.log(modalPageConfig.type);
      const accountType = modalPageConfig.type;

      try {
        await createAccount({
          accountType,
          payload
        }).unwrap();
        setModalPageConfig({
          ...modalPageConfig,
          page: "success",
          title: "",
          subTitle: "",
          caption: <div>Success.</div>
        });
        setModalButtonSettings({
          onOkayText: undefined,
          onCancelText: "Finish",
          onClickCancel: () => setModalVisibility(false)
        });
      } catch (err: any) {
        const { data } = err;
        setModalPageConfig({
          ...modalPageConfig,
          page: "fail",
          title: "",
          subTitle: "",
          caption: (
            <>
              <div>Error: {data.data?.title}</div>
              {data.data?.message && <div>{data.data?.message}</div>}
            </>
          )
        });
        console.log("Error:", err);
      }
    } else {
      setModalFormData({ ...modalFormData, ...data });
    }
  };

  const onFinish = (dsFormData: any) => {
    if (page === "page-1") {
      // Next Step
      handleSetModalFormData(dsFormData);
      page2(dsFormData);
    }
    if (page === "page-2") {
      // Next Step
      if (
        dsFormData?.accountNumber !== undefined ||
        dsFormData?.IBAN !== undefined ||
        modalPageConfig.isAutoGenerate
        // Either Account Number or IBAN || auto generate
      ) {
        pageSubmit();
        handleSetModalFormData(dsFormData, true);
      } else {
        Notification({
          message: "Enter Account Number or IBAN",
          description: "Either Account Number or IBAN is mandatory",
          type: "error"
        });
      }
    }
  };

  const getTitle = () => {
    const { type } = modalPageConfig;
    switch (type) {
      case "client":
        return "New Client Payment Account";
      case "pl":
        return "New PL Payment Account";
      case "vendor-client":
        return "New Vendor Client Payment Account";
      case "vendor-pl":
        return "New Vendor PL Payment Account";
      case "suspense":
        return "New Suspense Payment Account";
      default:
        return title;
    }
  };

  return (
    <Modal
      title={getTitle()}
      subTitle={subTitle}
      modalView={modalVisibility}
      modalWidth={600}
      onOkText={allDropDownComplete ? onOkayText : undefined}
      onCancelText={allDropDownComplete ? onCancelText : undefined}
      onClickOk={() => {
        form.submit();
      }}
      onClickCancel={onClickCancel}
      description={
        allDropDownComplete ? (
          <DSForm
            form={form}
            onFinish={onFinish}
            initialValues={initialFormData}
          >
            {getAccountFormItems(
              modalPageConfig,
              dropDownData,
              setModalPageConfig,
              form,
              setModalFormData,
              modalFormData
            )}
          </DSForm>
        ) : (
          <>Loading Forms, Please wait...</>
        )
      }
    ></Modal>
  );
};

export default NewAccountModalForm;
