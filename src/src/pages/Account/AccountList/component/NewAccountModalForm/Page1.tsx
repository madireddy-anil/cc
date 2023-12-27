import { FC, useEffect, useState } from "react";
import {
  Input,
  Select,
  Switch,
  Text,
  Colors,
  Form as DSForm
} from "@payconstruct/design-system";
import { useGetAccountCurrenciesQuery } from "../../../../../services/bmsService";

import {
  FormPageType,
  DropDownGroupType,
  PageConfigType
} from "../accountListTypes";
import {
  updateCurrencyType,
  selectCryptoCurrency,
  updateVendorChange,
  selectVendorChange,
  updateSelectedCurrency,
  selectCurrency,
  updateMainCurrency,
  selectMainCurrency
} from "../../../../../config/account/accountSlice";
import {
  useAppDispatch,
  useAppSelector
} from "../../../../../redux/hooks/store";
import css from "./style.module.css";

interface PropTypes {
  pageType: FormPageType;
  dropdownList: DropDownGroupType;
  setModalPageConfig: (e: any) => void;
  modalPageConfig: PageConfigType;
  accounts?: any;
  vendorAccountData?: any;
  form?: any;
  setModalFormData: (option: any) => void;
  modalFormData: any;
}

const Page1: FC<PropTypes> = ({
  pageType,
  dropdownList,
  setModalPageConfig,
  modalPageConfig,
  vendorAccountData,
  accounts,
  form,
  setModalFormData,
  modalFormData
}) => {
  const dispatch = useAppDispatch();
  // const [mainCurrency, setMainCurrency] = useState(false);
  const [suspenseAccountRequired, setSuspenseAccount] = useState(false);
  const [suspenseAccount, setsuspenseAccountOption] = useState<any>([]);
  const [linkedNetworkFeeAccount, setLinkedNetworkFeeOption] = useState<any>(
    []
  );
  const [linkedVendorAccount, setLinkedVendorAccountOption] = useState<any>([]);
  const [networkFeeAccountRequired, setNetworkFeeAccount] = useState(false);
  const [suspenceAccount, setSuspenseAccountOption] = useState<any>([]);
  const { data: accountCurrency } = useGetAccountCurrenciesQuery(
    {},
    { refetchOnMountOrArgChange: true }
  );
  // const [selectVendorAccount, setVendorAccount] = useState(false);
  const cryptoCurrency = useAppSelector(selectCryptoCurrency);
  const selectVendorAccount = useAppSelector(selectVendorChange);
  const selectedCurrency = useAppSelector(selectCurrency);
  const mainCurrency = useAppSelector(selectMainCurrency);

  useEffect(() => {
    const currencyType = accountCurrency?.data?.currency?.find(
      (rec: any) => rec?.id === selectedCurrency
    );

    const suspenseAccountOption: Array<any> = [];
    const linkedNetworkFeeOption: Array<any> = [];
    const linkedVendorAccountOption: Array<any> = [];

    for (const y in accounts) {
      if (
        accounts[y]["accountType"] === "suspense" &&
        accounts[y]["currency"] === currencyType?.code
      ) {
        let selectedSuspence: any[] = [
          accounts[y]["id"],
          `${accounts[y]["accountName"]}`
        ];
        suspenseAccountOption.push(selectedSuspence);
      }
    }

    setSuspenseAccountOption(suspenseAccountOption);

    for (const y in accounts) {
      if (
        accounts[y]["currency"] === currencyType?.code &&
        accounts[y]["isNetworkFeeAccount"] === true
      ) {
        let selectedLinkedNetworkFee: any[] = [
          accounts[y]["id"],
          `${accounts[y]["accountName"]}`
        ];
        linkedNetworkFeeOption.push(selectedLinkedNetworkFee);
      }
    }
    setLinkedNetworkFeeOption(linkedNetworkFeeOption);

    for (const Z in vendorAccountData) {
      if (vendorAccountData[Z]["currency"] === currencyType?.code) {
        if (
          pageType === "client" &&
          vendorAccountData[Z]["accountType"] === "vendor_client"
        ) {
          let selectedLinkedVendorAccount: any[] = [
            vendorAccountData[Z]["id"],
            `${vendorAccountData[Z]["accountName"]}`
          ];
          linkedVendorAccountOption.push(selectedLinkedVendorAccount);
        } else if (
          pageType === "pl" &&
          vendorAccountData[Z]["accountType"] === "vendor_pl"
        ) {
          let selectedLinkedVendorAccount: any[] = [
            vendorAccountData[Z]["id"],
            `${vendorAccountData[Z]["accountName"]}`
          ];
          linkedVendorAccountOption.push(selectedLinkedVendorAccount);
        }
      }
    }

    setLinkedVendorAccountOption(linkedVendorAccountOption);
  }, [selectedCurrency]);

  const handleSelectCurrency = (e: any) => {
    dispatch(updateSelectedCurrency(e));

    const currencyType = accountCurrency?.data?.currency?.find(
      (rec: any) => rec?.id === e
    );

    if (currencyType.type === "crypto") {
      dispatch(updateCurrencyType(true));
      if (
        e === "862d2a55-0650-43f8-8fa5-c7031ba2a337" ||
        e === "11bddab9-3b3a-4aa4-bb7c-b9b5a69df715"
      ) {
        dispatch(updateMainCurrency(true));
      } else {
        dispatch(updateMainCurrency(false));
      }
    } else {
      dispatch(updateCurrencyType(false));
      dispatch(updateMainCurrency(false));
      setNetworkFeeAccount(false);
    }
  };

  const handleNetworkFeeAccount = (e: any) => {
    if (e === true) {
      setNetworkFeeAccount(true);
    } else {
      setNetworkFeeAccount(false);
    }
  };

  const handleSuspenceAccount = (e: any) => {
    if (e === true) {
      setSuspenseAccount(true);
    } else {
      setSuspenseAccount(false);
    }
  };

  const setVendorChange = (e: any) => {
    setModalPageConfig({ ...modalPageConfig, isAutoGenerate: e });
    if (e === true) {
      dispatch(updateVendorChange(true));
    } else {
      dispatch(updateVendorChange(false));
    }
    form.setFieldsValue({
      linkedVendorAccount: undefined,
      vendorEntityId: undefined
    });
    setModalFormData({
      ...modalFormData,
      linkedVendorAccount: undefined,
      vendorEntityId: undefined
    });
  };

  return (
    <>
      <DSForm.Item name="accountName">
        <Input label="Account Name" className={css["modal-input-row"]} />
      </DSForm.Item>
      <div className={css["modal-input-row"]} style={{ marginTop: "-40px" }}>
        <DSForm.Item
          name="ownerEntityId"
          rules={[{ required: true, message: "Account owner is required" }]}
        >
          <Select
            label="Account Owner *"
            placeholder="Select"
            optionlist={dropdownList.accountOwner}
            optionFilterProp="children"
          />
        </DSForm.Item>
      </div>
      <div className={css["modal-input-row"]}>
        <DSForm.Item
          name="issuerEntityId"
          rules={[{ required: true, message: "Account Issuer is required" }]}
        >
          <Select
            label="Account Issuer *"
            placeholder="Select"
            optionlist={
              pageType === "client" ||
              pageType === "pl" ||
              pageType === "suspense"
                ? dropdownList.issuerCompany
                : dropdownList.issuerVendor
            }
            optionFilterProp="children"
          />
        </DSForm.Item>
      </div>
      <div className={css["modal-input-row"]}>
        <DSForm.Item
          name="currencyId"
          rules={[{ required: true, message: "Currency is required" }]}
        >
          <Select
            label="Currency *"
            placeholder="Select"
            optionlist={dropdownList.currency}
            optionFilterProp="children"
            onChange={(e) => handleSelectCurrency(e)}
          />
        </DSForm.Item>
      </div>
      {mainCurrency ? (
        <>
          <div className={css["modal-input-row"]}>
            <DSForm.Item
              name="mainCurrencyId"
              rules={[{ required: true, message: "Main Currency is required" }]}
            >
              <Select
                label="Main Currency *"
                placeholder="Select"
                optionlist={dropdownList.mainCurrency}
                optionFilterProp="children"
              />
            </DSForm.Item>
          </div>
        </>
      ) : (
        <></>
      )}
      <div className={css["modal-form-horizontal-group"]}>
        <div className={css["modal-form-horizontal-member"]}>
          <div className={css["modal-input-row"]}>
            <DSForm.Item
              name="isBlockedInbound"
              rules={[
                { required: true, message: "Blocked Inbound is required" }
              ]}
              initialValue={false}
            >
              <Select
                label="Blocked Inbound *"
                optionFilterProp="children"
                optionlist={[
                  [true, "Yes"],
                  [false, "No"]
                ]}
              />
            </DSForm.Item>
          </div>
        </div>
        <div className={css["modal-form-horizontal-member"]}>
          <div className={css["modal-input-row"]}>
            <DSForm.Item
              name="isBlockedOutbound"
              rules={[
                { required: true, message: "Blocked Outbound is required" }
              ]}
              initialValue={false}
            >
              <Select
                label="Blocked Outbound *"
                optionFilterProp="children"
                optionlist={[
                  [true, "Yes"],
                  [false, "No"]
                ]}
              />
            </DSForm.Item>
          </div>
        </div>
      </div>
      {pageType === "client" && (
        <>
          <div className={css["modal-input-row"]}>
            <DSForm.Item
              name="productId"
              rules={[
                { required: true, message: "Associated Product is required" }
              ]}
            >
              <Select
                label="Associated Product *"
                placeholder="Select"
                optionlist={dropdownList.product}
                optionFilterProp="children"
              />
            </DSForm.Item>
          </div>
        </>
      )}
      {pageType === "pl" || pageType === "suspense" ? (
        <>
          <div className={css["modal-input-row"]}>
            <DSForm.Item name="linkedVendorAccount">
              <Select
                label="Linked Vendor Account"
                placeholder="Select"
                style={{
                  width: "100%"
                }}
                optionlist={linkedVendorAccount}
                optionFilterProp="children"
              />
            </DSForm.Item>
          </div>
        </>
      ) : (
        <></>
      )}
      {pageType === "client" && !selectVendorAccount ? (
        <>
          <div className={css["modal-input-row"]}>
            <DSForm.Item name="linkedVendorAccount">
              <Select
                label="Linked Vendor Account"
                placeholder="Select"
                style={{
                  width: "100%"
                }}
                optionlist={linkedVendorAccount}
                optionFilterProp="children"
              />
            </DSForm.Item>
          </div>
        </>
      ) : (
        <></>
      )}
      {pageType === "client" && selectVendorAccount ? (
        <>
          <div className={css["modal-input-row"]}>
            <DSForm.Item name="vendorEntityId">
              <Select
                label="Select Vendor"
                placeholder="Select"
                style={{
                  width: "100%"
                }}
                optionlist={dropdownList.issuerVendor}
                optionFilterProp="children"
              />
            </DSForm.Item>
          </div>
        </>
      ) : (
        <></>
      )}
      {/* <div className={css["modal-input-row"]}>
        <DSForm.Item
          name="isTreasury"
          rules={[{ required: true, message: "Treasury is required" }]}
          initialValue={false}
        >
          <Select
            label="Is Treasury *"
            optionlist={[
              [true, "Yes"],
              [false, "No"]
            ]}
          />
        </DSForm.Item>
      </div> */}
      {(pageType === "vendor-client" || pageType === "vendor-pl") &&
      cryptoCurrency ? (
        <div className={css["modal-input-row"]}>
          <DSForm.Item
            name="isNetworkFeeAccount"
            rules={[
              { required: true, message: "Network Fee Account is Required" }
            ]}
            initialValue={false}
          >
            <Select
              label="Network Fee Account *"
              optionlist={[
                [true, "Yes"],
                [false, "No"]
              ]}
              onChange={(e) => handleNetworkFeeAccount(e)}
            />
          </DSForm.Item>
        </div>
      ) : (
        ""
      )}{" "}
      {(pageType === "vendor-client" || pageType === "vendor-pl") &&
      cryptoCurrency &&
      !networkFeeAccountRequired ? (
        <>
          <div className={css["modal-input-row"]}>
            <DSForm.Item name="networkFeeAccountId">
              <Select
                label="Linked Network Fee Account"
                placeholder="Select"
                style={{
                  width: "100%"
                }}
                optionlist={linkedNetworkFeeAccount}
                optionFilterProp="children"
              />
            </DSForm.Item>
          </div>
        </>
      ) : (
        <></>
      )}
      {(pageType === "vendor-client" || pageType === "vendor-pl") && (
        <div className={css["modal-input-row"]}>
          <DSForm.Item
            name="suspenseAccount"
            rules={[
              { required: true, message: "Suspense Account is Required" }
            ]}
            initialValue={false}
          >
            <Select
              label="Suspense Account Required *"
              optionlist={[
                [true, "Yes"],
                [false, "No"]
              ]}
              onChange={(e) => handleSuspenceAccount(e)}
            />
          </DSForm.Item>
        </div>
      )}
      {(pageType === "vendor-client" || pageType === "vendor-pl") &&
      !suspenseAccountRequired ? (
        <>
          <div className={css["modal-input-row"]}>
            <DSForm.Item name="suspenseAccountId">
              <Select
                label="Suspense Account"
                placeholder="Select"
                style={{
                  width: "100%"
                }}
                optionlist={suspenceAccount}
                optionFilterProp="children"
              />
            </DSForm.Item>
          </div>
        </>
      ) : (
        <></>
      )}
      {(pageType === "client" ||
        pageType === "vendor-client" ||
        pageType === "vendor-pl") &&
      cryptoCurrency ? (
        <>
          <div className={css["modal-input-row"]}>
            <DSForm.Item name="parentId">
              <Select
                label="Parent Account"
                placeholder="Select"
                style={{
                  width: "100%"
                }}
                optionlist={dropdownList.parentAccount}
                optionFilterProp="children"
              />
            </DSForm.Item>
          </div>
        </>
      ) : (
        <></>
      )}
      {pageType === "client" && cryptoCurrency && (
        <>
          <Text
            label="Generate Vendor Account"
            size="medium"
            color={Colors.grey.neutral700}
          />
          <Switch
            checked={modalPageConfig.isAutoGenerate}
            switchSize="large"
            onChange={setVendorChange}
          />
        </>
      )}
    </>
  );
};

export default Page1;
