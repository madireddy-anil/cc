import { FC, useState, useEffect } from "react";
import { Space } from "antd";
import {
  Drawer,
  Text,
  Colors,
  Button,
  Form as DSForm,
  Select
} from "@payconstruct/design-system";

import { Spacer, Spinner } from "../../../../components";
import {
  EntitiesResponse,
  useGetClientEntitiesQuery,
  useGetCompaniesQuery
  // useGetVendorsQuery
} from "../../../../services/ControlCenter/endpoints/entitiesEndpoint";
import { useGetAccountCurrenciesQuery } from "../../../../services/bmsService";
import { useAppDispatch, useAppSelector } from "../../../../redux/hooks/store";
import {
  selectAppliedFilter,
  updateFilterProperty,
  updateFilterChange,
  selectFilterChange
} from "../../../../config/account/accountSlice";

interface PropTypes {
  showFilters: boolean;
  vendorsList: EntitiesResponse["data"]["entities"];
  isVendorEntityLoading: boolean;
  onClose: () => void;
  clearFilters: () => void;
  seeResults?: (e: any) => void;
}

const accountTypes = [
  { label: "Client Account", value: "client" },
  { label: "PL Account", value: "pl" },
  { label: "Vendor Client Account", value: "vendor_client" },
  { label: "Vendor PL Account", value: "vendor_pl" },
  { label: "Suspense Account", value: "suspense" }
];

// Sort object by selected index (f)
const sort = (obj: any, f: string) => {
  obj.sort((a: any, b: any) => (a[f] > b[f] ? 1 : b[f] > a[f] ? -1 : 0));
};

const extractOptions = (data: any, type: string) => {
  let options: any = [];
  if (type === "currency") {
    for (let i in data) {
      const strVal = `${data[i].code} (${data[i].name})`;
      options.push([data[i].id, strVal]);
    }
  } else {
    const rawData = [];
    for (let i in data) {
      if (data[i].genericInformation?.registeredCompanyName) {
        const strVal = data[i]?.genericInformation?.registeredCompanyName;
        rawData.push({
          id: data[i]?.id,
          value: strVal
        });
      }
    }
    const sortedData = [...rawData];
    sort(sortedData, "value");
    for (let i in sortedData) {
      options.push([sortedData[i]?.id, sortedData[i]?.value]);
    }
  }
  return options;
};

const FiltersDrawer: FC<PropTypes> = ({
  showFilters,
  vendorsList,
  isVendorEntityLoading,
  onClose,
  seeResults,
  clearFilters
}) => {
  const [form] = DSForm.useForm();
  const [currencies, setCurrencies] = useState([]);
  const [ownerEntityIds, setOwner] = useState([]);
  const [issuerEntityIds, setIssuer] = useState([]);
  const [accountSelected, setAccount] = useState("");
  const [filterData, setFilterData] = useState({});
  const [clients, setClients] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [, setIfVendor] = useState<boolean>(false);

  const dispatch = useAppDispatch();
  const filterChange: any = useAppSelector(selectFilterChange);

  const {
    data: clientEntity,
    isLoading: isClientEntityLoading,
    isSuccess: isClientFetchSuccess
  } = useGetClientEntitiesQuery({}, { refetchOnMountOrArgChange: true });
  const { data: companyEntity, isLoading: isCompanyEntityLoading } =
    useGetCompaniesQuery({}, { refetchOnMountOrArgChange: true });
  const { data: accountCurrency, isLoading: isAccountCurrencyLoading } =
    useGetAccountCurrenciesQuery({}, { refetchOnMountOrArgChange: true });
  // const { data: vendorEntity, isLoading: isVendorEntityLoading } =
  //   useGetVendorsQuery({}, { refetchOnMountOrArgChange: true });

  const appliedFilterProperty: any = useAppSelector(selectAppliedFilter);

  useEffect(() => {
    if (
      clients.length !== 0 &&
      (companies.length !== 0 || vendors.length !== 0)
    ) {
      setAccount(appliedFilterProperty?.accountType);

      if (appliedFilterProperty?.accountType) {
        handleChangeAccount(appliedFilterProperty?.accountType);
      }

      let issuerValue = "";
      let OwnerValue = "";

      if (appliedFilterProperty?.accountType === "client") {
        OwnerValue = clientEntity?.data?.entities?.find(
          (item: any) => item?.id === appliedFilterProperty?.ownerEntityId
        )?.genericInformation?.registeredCompanyName;
        issuerValue = companyEntity?.data?.entities?.find(
          (item: any) => item?.id === appliedFilterProperty?.issuerEntityId
        )?.genericInformation?.registeredCompanyName;
      }
      if (
        appliedFilterProperty?.accountType === "pl" ||
        appliedFilterProperty?.accountType === "suspense"
      ) {
        OwnerValue = companyEntity?.data?.entities?.find(
          (item: any) => item?.id === appliedFilterProperty?.ownerEntityId
        )?.genericInformation?.registeredCompanyName;
        issuerValue = companyEntity?.data?.entities?.find(
          (item: any) => item?.id === appliedFilterProperty?.issuerEntityId
        )?.genericInformation?.registeredCompanyName;
      }
      if (
        appliedFilterProperty?.accountType === "vendor_client" ||
        appliedFilterProperty?.accountType === "vendor_pl"
      ) {
        OwnerValue = companyEntity?.data?.entities?.find(
          (item: any) => item?.id === appliedFilterProperty?.ownerEntityId
        )?.genericInformation?.registeredCompanyName;
        issuerValue =
          vendorsList?.find(
            (item: any) => item?.id === appliedFilterProperty?.issuerEntityId
          )?.genericInformation?.registeredCompanyName ?? "";
      }

      form.setFieldsValue({
        ...appliedFilterProperty,
        issuerEntityId: issuerValue,
        ownerEntityId: OwnerValue
      });
      setFilterData(appliedFilterProperty);
      seeResults && seeResults(appliedFilterProperty);

      // console.log(
      //   {
      //     ...appliedFilterProperty,
      //     issuerEntityId: issuerValue,
      //     ownerEntityId: OwnerValue
      //   },
      //   "$$$$$"
      // );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clients, vendors, companies]);

  useEffect(() => {
    dispatch(updateFilterProperty({ ...appliedFilterProperty, ...filterData }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterData]);

  useEffect(() => {
    if (!isAccountCurrencyLoading) {
      const currency = [...accountCurrency.data.currency];
      sort(currency, "code");
      const currencyOptions = extractOptions(currency, "currency");
      setCurrencies(currencyOptions);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAccountCurrencyLoading]);

  useEffect(() => {
    if (!isClientEntityLoading && isClientFetchSuccess) {
      const clientsData = clientEntity?.data?.entities;
      const clientOptions = extractOptions(clientsData, "clients");
      setClients(clientOptions);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClientEntityLoading, isClientFetchSuccess]);

  useEffect(() => {
    if (!isCompanyEntityLoading) {
      const companiesData = companyEntity.data.entities;
      const companyOptions = extractOptions(companiesData, "companies");
      setCompanies(companyOptions);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCompanyEntityLoading]);

  useEffect(() => {
    if (!isVendorEntityLoading) {
      const vendorOptions = extractOptions(vendorsList, "vendors");
      setVendors(vendorOptions);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVendorEntityLoading]);

  const formatAccountTypeForOptionSet = (data: any) => {
    return (data || []).map((item: { label: string; value: string }) => {
      return [item.value, item.label];
    });
  };

  // const handleValuesChanged = (a: any, b: any) => {
  //   let hasValue = false;
  //   for (let i in b) {
  //     if (b[i]) {
  //       hasValue = Boolean(b[i]);
  //       break;
  //     }
  //   }
  // };

  const handleReset = () => {
    setAccount("");
    setFilterData({});
    clearFilters();
    form.resetFields();
  };

  const handleChangeAccount = (e: any) => {
    setAccount(e);
    if (e === "client") {
      setOwner(clients);
      setIssuer(companies);
    }
    if (e === "pl" || e === "suspense") {
      setOwner(companies);
      setIssuer(companies);
    }
    if (e === "vendor_client" || e === "vendor_pl") {
      setOwner(companies);
      setIssuer(vendors);
      setIfVendor(true);
    }

    setFilterData({
      ...filterData,
      accountType: e,
      issuerEntityId: undefined,
      ownerEntityId: undefined
    });
    seeResults &&
      seeResults({
        ...filterData,
        accountType: e,
        issuerEntityId: undefined,
        ownerEntityId: undefined
      });
  };

  // const extractId = (value: string, type: string) => {
  //   let data = clientEntity.data.entities;

  //   if (type === "issuer") {
  //     data = companyEntity.data.entities;
  //   } else if (type === "issuer" && isVendor) {
  //     data = vendorEntity.data.entities;
  //   }

  //   return data?.find((item: any) => item?.id === value)?.id ?? "";
  // };

  return (
    <Drawer closable onClose={onClose} visible={showFilters}>
      {isAccountCurrencyLoading ||
      isClientEntityLoading ||
      isCompanyEntityLoading ? (
        <Spinner />
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            justifyContent: "space-between"
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline"
              }}
            >
              <Text label="Filters" size="xlarge" weight="bolder" />
              <span
                style={{
                  cursor: "pointer",
                  color: Colors.grey.neutral500,
                  userSelect: "none"
                }}
                onClick={handleReset}
              >
                Clear All
              </span>
            </div>
            <Spacer size={30} />
            <DSForm
              form={form}
              // onValuesChange={handleValuesChanged}
              onFinish={seeResults}
            >
              <DSForm.Item name="accountType">
                <Select
                  allowClear
                  label="Account Type"
                  optionlist={formatAccountTypeForOptionSet(accountTypes)}
                  optionFilterProp="children"
                  placeholder="Select Account Type"
                  onChange={(e) => {
                    handleChangeAccount(e);
                    dispatch(updateFilterChange(true));
                  }}
                />
              </DSForm.Item>
              <DSForm.Item name="currency">
                <Select
                  allowClear
                  label="Account Currency"
                  optionlist={currencies}
                  placeholder="Select Account Currency"
                  optionFilterProp="children"
                  onChange={(e) => {
                    const allCurrencies = [...accountCurrency?.data?.currency];
                    const currencyObj: any = allCurrencies.find(
                      (currencyItem: any) => currencyItem?.id === e
                    );
                    dispatch(updateFilterChange(true));
                    seeResults &&
                      seeResults({
                        ...filterData,
                        currency: currencyObj?.code
                      });
                    setFilterData({
                      ...filterData,
                      currency: currencyObj?.code
                    });
                  }}
                />
              </DSForm.Item>
              {Boolean(accountSelected) && (
                <>
                  <DSForm.Item name="ownerEntityId">
                    <Select
                      allowClear
                      label="Account Owner"
                      optionlist={ownerEntityIds}
                      optionFilterProp="children"
                      placeholder="Select Account Owner"
                      onChange={(id) => {
                        // let id = extractId(e, "Owner");
                        seeResults &&
                          seeResults({ ...filterData, ownerEntityId: id });
                        setFilterData({ ...filterData, ownerEntityId: id });
                        dispatch(updateFilterChange(true));
                      }}
                    />
                  </DSForm.Item>
                  <DSForm.Item name="issuerEntityId">
                    <Select
                      allowClear
                      label="Account Issuer"
                      optionlist={issuerEntityIds}
                      optionFilterProp="children"
                      placeholder="Select Account Issuer"
                      onChange={(id) => {
                        // let id = extractId(e, "issuer");
                        seeResults &&
                          seeResults({ ...filterData, issuerEntityId: id });
                        setFilterData({ ...filterData, issuerEntityId: id });
                        // dispatch(updateFilterChange(true));
                      }}
                    />
                  </DSForm.Item>
                </>
              )}
            </DSForm>
          </div>
          <Space style={{ justifyContent: "flex-end" }}>
            <Button label="Cancel" type="secondary" onClick={onClose} />
          </Space>
        </div>
      )}
    </Drawer>
  );
};

export default FiltersDrawer;
