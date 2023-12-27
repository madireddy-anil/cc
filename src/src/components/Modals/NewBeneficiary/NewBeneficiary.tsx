import React, { FC, useState, useEffect } from "react";
import { useIntl } from "react-intl";
import {
  Modal,
  Form as DSForm,
  Input,
  Select,
  SwitchName,
  Checkbox,
  Spin,
  Icon,
  Tooltip,
  Text
} from "@payconstruct/design-system";
import "./NewBeneficiary.css";
import { Spacer } from "../../Spacer/Spacer";
import { useAppSelector } from "../../../redux/hooks/store";
import { selectCountries } from "../../../config/countries/countriesSlice";
import { selectCurrencies } from "../../../config/currencies/currenciesSlice";
import { useGetBeneficiaryValidationFieldsQuery } from "../../../services/beneficiaryService";
import { Currency } from "../../../services/currencies";
import {
  formatCountriesListForOptionSet,
  formatCurrenciesListForOptionSet,
  getCurrencyType,
  getRandomString
} from "../../../utilities/transformers";

/**
 *
 *
 * @component NewBeneficiary.
 *      New Beneficiary Filling form.
 * @props PropType
 *
 * @returns null
 *
 *
 */
interface PropTypes {
  visible: boolean;
  hideModal: () => void;
  handleSubmit: (formData: any) => void;
  submitting: boolean;
  selectedCurrency?: string;
  mainCurrency?: string;
  product?: string;
}

interface beneFieldsRequestProps {
  currency?: string;
  country?: string;
  type?: string;
  random: string;
}

export const NewBeneficiary: FC<PropTypes> = ({
  visible,
  hideModal,
  handleSubmit,
  submitting,
  selectedCurrency,
  mainCurrency,
  product
}) => {
  const intl = useIntl();
  const [formData, setFormData] = useState({});
  const [requestedAccountType, setRequestedAccountType]: any =
    useState("individual");
  const [currencyType, setCurrencyType]: any = useState("fiat");
  const [form] = DSForm.useForm();
  const [isCurrencySelected, setIsCurrencySelected] = useState<boolean>(false);
  const currenciesList = useAppSelector(selectCurrencies);

  const selectedCurrencyType = getCurrencyType(
    currenciesList,
    selectedCurrency ?? ""
  );

  const [beneFieldsRequest, setBeneFieldsRequest] = useState({
    currency: selectedCurrency ?? "",
    country: "",
    type: "individual",
    random: getRandomString()
  } as beneFieldsRequestProps);
  const [beneFields, setBeneFields] = useState([]);
  const [skipApiCall, setSkipApiCall] = useState(true);

  /* Api for Fetching Dynamic Fields based on curreny and country */
  let {
    // refetch,
    beneValidationFields,
    isFetching: isBeneValidationFieldsFetching
  } = useGetBeneficiaryValidationFieldsQuery(beneFieldsRequest, {
    selectFromResult: ({ data, isFetching }) => ({
      beneValidationFields: data?.data?.beneficiaryValidation?.fields,
      isFetching
    }),
    skip:
      beneFieldsRequest.currency === undefined ||
      beneFieldsRequest.currency === "" ||
      (selectedCurrencyType === "fiat"
        ? beneFieldsRequest.country === undefined ||
          beneFieldsRequest.country === ""
        : false) ||
      !visible ||
      skipApiCall
  });

  /**
   *
   * @function handleCancel
   *    Called whenever modal being closed.
   * @param null
   *
   * @returns null
   *
   */
  const handleCancel = () => {
    hideModal();
    form.resetFields();
    setIsCurrencySelected(false);
    setBeneFields([]);
    form.setFieldsValue({
      currency: selectedCurrency && selectedCurrency,
      mainCurrency
    });
  };

  /**
   *
   * @function submitForm
   *    Called whenever user submits the data.
   *
   * @param null
   *
   * @returns null
   *
   *
   */
  const submitForm = async () => {
    const success: any = await handleSubmit(formData);
    if (success) {
      hideModal();
      form.resetFields();
      if (!selectedCurrency) setIsCurrencySelected(false);
      form.setFieldsValue({
        currency: selectedCurrency && selectedCurrency,
        mainCurrency
      });
    }
  };

  /* On dynamic fields fetching success, setting those fields to state. */
  useEffect(() => {
    setBeneFields(beneValidationFields);
  }, [beneValidationFields]);

  /* When user reopen the modal */
  useEffect(() => {
    if (visible && selectedCurrency && selectedCurrencyType === "crypto") {
      setSkipApiCall(false);
      setBeneFields([]);
      setBeneFieldsRequest({
        ...beneFieldsRequest,
        random: getRandomString()
      });
    }
    setFormData((prev: any) => ({
      ...prev,
      currency: selectedCurrency && selectedCurrency,
      mainCurrency
    }));
    form.setFieldsValue({
      currency: selectedCurrency && selectedCurrency,
      mainCurrency
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <Modal
      title={intl.formatMessage({ id: "newBeneficiary" })}
      subTitle={intl.formatMessage({ id: "newBeneficiaryFormSubtitle" })}
      description={
        <>
          <div className="bene-info">
            <Tooltip>
              <Icon name="info" />
            </Tooltip>
            <p className="bene-info-text">
              These{" "}
              <Tooltip
                text={
                  <div>
                    Beneficiary Name
                    <br />
                    Intermediary Bank BIC
                    <br />
                    Street
                    <br />
                    Flat / Building Bumber
                    <br />
                    City
                    <br />
                    State / Province
                    <br />
                    postal code
                    <br />
                  </div>
                }
              >
                <Text label="Fields" weight="bold" />
              </Tooltip>{" "}
              allow only normal{" "}
              <Tooltip text={"A-Z a-z 0-9 / - ? : ( ) . , ` +"}>
                <Text label="Characters" weight="bold" />
              </Tooltip>
              .
            </p>
          </div>
          <DSForm form={form} onFinish={submitForm}>
            <Form
              setFormData={setFormData}
              DSForm={DSForm}
              form={form}
              requestedAccountType={requestedAccountType}
              setRequestedAccountType={(type: any) => {
                /* Resetting Form Fields on switch change */
                if (!selectedCurrency) {
                  form.resetFields();
                  setIsCurrencySelected(false);
                  setBeneFields([]);
                } else {
                  form.setFieldsValue({ country: undefined });
                  setBeneFields([]);
                  // if (
                  //   getCurrencyType(currenciesList, selectedCurrency) ===
                  //   "crypto"
                  // ) {
                  setBeneFieldsRequest({
                    type,
                    currency: selectedCurrency,
                    random: getRandomString()
                  });
                  // }
                }
                setRequestedAccountType(type);
              }}
              selectedCurrency={selectedCurrency && selectedCurrency}
              mainCurrency={mainCurrency}
              currencyType={currencyType}
              setCurrencyType={setCurrencyType}
              isCurrencySelected={isCurrencySelected}
              setIsCurrencySelected={setIsCurrencySelected}
              setSkipApiCall={setSkipApiCall}
              beneValidationFields={beneFields}
              setBeneFieldsRequest={(values: any) => {
                /* Resetting Fields on curreny field change */
                if (values.currencyType && !selectedCurrency) {
                  setBeneFields([]);
                }

                if (selectedCurrency) {
                  if (
                    (getCurrencyType(currenciesList, selectedCurrency) !==
                      "fiat" ||
                      values.country !== "") &&
                    !values.type
                  ) {
                    setBeneFieldsRequest({
                      ...beneFieldsRequest,
                      ...values,
                      currency: selectedCurrency,
                      random: getRandomString()
                    });
                  }
                } else {
                  if (
                    (values.currencyType !== "fiat" || values.country !== "") &&
                    !values.type
                  ) {
                    setBeneFieldsRequest({
                      ...beneFieldsRequest,
                      ...values,
                      random: getRandomString()
                    });
                  }
                }
              }}
              isBeneValidationFieldsFetching={isBeneValidationFieldsFetching}
              product={product}
            />
          </DSForm>
        </>
      }
      onCancelBtn={Boolean(!submitting)}
      onOkText={
        submitting
          ? `${intl.formatMessage({ id: "loading" })}...`
          : intl.formatMessage({ id: "addBeneficiary" })
      }
      onCancelText={intl.formatMessage({ id: "cancel" })}
      buttonOkDisabled={submitting || isBeneValidationFieldsFetching}
      onClickCancel={handleCancel}
      onClickOk={() => form.submit()}
      modalView={visible}
      modalWidth={600}
    />
  );
};

/**
 *
 * @component Form
 *
 *  for New Beneficiary Screen
 *
 * @returns null
 */

/* Form Interface */
interface FormPropTypes {
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  DSForm: any;
  form: any;
  requestedAccountType: string;
  setRequestedAccountType: React.Dispatch<React.SetStateAction<string>>;
  selectedCurrency?: string;
  mainCurrency?: string;
  currencyType: string;
  setCurrencyType: React.Dispatch<React.SetStateAction<any>>;
  isCurrencySelected: boolean;
  setIsCurrencySelected: React.Dispatch<React.SetStateAction<boolean>>;
  setSkipApiCall: React.Dispatch<React.SetStateAction<boolean>>;
  beneValidationFields: any;
  setBeneFieldsRequest: React.Dispatch<React.SetStateAction<any>>;
  isBeneValidationFieldsFetching: boolean;
  product?: string;
}

const Form: FC<FormPropTypes> = ({
  setFormData,
  DSForm,
  form,
  requestedAccountType,
  setRequestedAccountType,
  selectedCurrency,
  mainCurrency,
  currencyType,
  setCurrencyType,
  isCurrencySelected,
  setIsCurrencySelected,
  setSkipApiCall,
  beneValidationFields,
  setBeneFieldsRequest,
  isBeneValidationFieldsFetching,
  product
}) => {
  const intl = useIntl();
  const countriesList = useAppSelector(selectCountries);
  const currenciesList = useAppSelector(selectCurrencies);
  const mainCurrenciesList = currenciesList?.filter(
    (currencyItem: Currency) => {
      if (currencyItem?.mainCurrency && currencyItem?.mainCurrency !== "") {
        if (mainCurrency) {
          return currencyItem.code === mainCurrency;
        }
        return currencyItem;
      }
    }
  );
  // const countriesListAsOptions = formatCountriesListForOptionSet(countriesList);
  const curenciesListOptions = formatCurrenciesListForOptionSet(currenciesList);
  const mainCurenciesListOptions =
    formatCurrenciesListForOptionSet(mainCurrenciesList);
  const [countriesListAsOptions, setCountriesListAsOption] = useState(
    formatCountriesListForOptionSet(countriesList)
  );

  const [selectedCurrentCurrency, setSelectedCurrency] = useState("");

  /* On Field Change, Setting Field Value on parent component. */
  const handleChange = (item: any) => {
    const { id, value } = item.target;
    setFormData((prev: any) => ({ ...prev, [id]: value }));
  };

  /* Account Types */
  const accountTypeOptions: any = [
    { label: "INDIVIDUAL", value: "individual" },
    { label: "COMPANY", value: "business" }
  ];

  /**
   *
   * @function setFilteredCountries
   *
   * @param currencyType string
   *
   *    Restructuring Countries from api for Select Dropdown options based on Currency type.
   *
   * @returns null
   */
  const setFilteredCountries = (currencyType: string) => {
    const selectedCountries = countriesList.filter((country: any) => {
      const countryType = country.fiatCurrency === "Y" ? "fiat" : "crypto";
      return countryType === currencyType;
    });
    setCountriesListAsOption(
      formatCountriesListForOptionSet(selectedCountries)
    );
  };

  /* Setting state on Parent Form Data on selection of Currency.  */
  useEffect(() => {
    form.setFieldsValue({
      currency: selectedCurrency && selectedCurrency,
      mainCurrency
    });
    setFormData((prev: any) => ({
      ...prev,
      currency: selectedCurrency && selectedCurrency,
      mainCurrency
    }));
    const currency = selectedCurrency ? selectedCurrency : "";
    setCurrencyType(getCurrencyType(currenciesList, currency));
    setFilteredCountries(getCurrencyType(currenciesList, currency));

    if (selectedCurrency) setIsCurrencySelected(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, selectedCurrency]);

  /* Setting state on Parent Form Data when account or curreny type been selected.  */
  useEffect(() => {
    setFormData((prev: any) => ({
      ...prev,
      requestedAccountType,
      currencyType
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestedAccountType, currencyType]);

  return (
    <>
      <Spacer size={20} />
      <div className="new-beneficiary-switch-name-wrapper">
        {/* Toggle Between Account Type */}
        <SwitchName
          selectedOption={requestedAccountType === "individual" ? 0 : 1}
          name="requestedAccountType"
          onChange={(value) => {
            if (!selectedCurrency) {
              /* Setting Selected Country */
              setSelectedCurrency("");
            } else {
              form.resetFields();
              form.setFieldsValue({
                currency: selectedCurrency && selectedCurrency,
                mainCurrency
              });
            }

            /* Type casting the value */
            const accountValue = Object.values(
              value
            )[0] as typeof requestedAccountType;
            /* Setting Type of account Selected */
            setRequestedAccountType(accountValue);
            /* Setting Field Values For Api call */
            setBeneFieldsRequest({
              type: accountValue
            });
          }}
          options={accountTypeOptions}
        />
      </div>
      {/* Curreny Field */}
      <DSForm.Item
        name="currency"
        initialValue={selectedCurrency}
        rules={[{ required: true }]}
        autoComplete="off"
      >
        <Select
          onChange={(value) => {
            /* flag for whether currency selected. */
            setIsCurrencySelected(true);
            /* Setting Currency Type either Fiat or Crypto to show country field/ */
            setCurrencyType(getCurrencyType(currenciesList, value));
            /* Setting Form Values to state. */
            setFormData((prev: any) => ({
              ...prev,
              currency: value,
              bankCountry: ""
            }));
            /* Setting Field Values For Api call. */
            setBeneFieldsRequest({
              currency: value,
              country: "",
              currencyType: getCurrencyType(currenciesList, value)
            });
            /* Setting Selected Country */
            setSelectedCurrency(value);
            /* Filtering Countries. */
            setFilteredCountries(getCurrencyType(currenciesList, value));
            /* Local Form State Setting. */
            form.setFieldsValue({ currency: value, bankCountry: undefined });
          }}
          label="Currency"
          optionlist={curenciesListOptions}
          placeholder={intl.formatMessage({ id: "selectOption" })}
          disabled={Boolean(selectedCurrency)}
        />
      </DSForm.Item>
      {/* Country Field. */}
      {(isCurrencySelected || selectedCurrency) && currencyType === "fiat" && (
        <DSForm.Item name="bankCountry" rules={[{ required: true }]}>
          <Select
            onChange={(value) => {
              /* Setting Form Values to state. */
              setFormData((prev: any) => ({ ...prev, bankCountry: value }));
              /* Setting Field Values For Api call. */
              setSkipApiCall(false);
              setBeneFieldsRequest({
                currency: selectedCurrentCurrency,
                country: value
              });
            }}
            filterOption={(input: any, option: any) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            label={intl.formatMessage({ id: "bankCountry" })}
            optionlist={countriesListAsOptions}
            placeholder={intl.formatMessage({ id: "selectOptions" })}
          />
        </DSForm.Item>
      )}
      {/* Loader Until Further Information Being Fetched. */}
      {isBeneValidationFieldsFetching && (
        <div className="new-beneficiary-loader">
          <DSForm.Item>
            <Spin loading={isBeneValidationFieldsFetching} />
          </DSForm.Item>
        </div>
      )}
      {/*
            Dynamic Fields Which is rendered based on api response respective to curreny & country.
       */}
      {beneValidationFields && beneValidationFields.length > 0 && (
        <>
          {beneValidationFields.map((fieldItem: any) => {
            return (
              <>
                {(selectedCurrency === "USDT" || selectedCurrency === "USDC") &&
                  fieldItem.type === "select" &&
                  fieldItem.schemaName === "mainCurrency" && (
                    <DSForm.Item
                      key={fieldItem.schemaName}
                      name={fieldItem.schemaName}
                      rules={[
                        {
                          required: fieldItem.isRequired,
                          message: `Please enter ${fieldItem.labelName}`
                        },
                        {
                          pattern: new RegExp(fieldItem.regex),
                          message: fieldItem.message ? fieldItem.message : ""
                        }
                      ]}
                    >
                      <Select
                        onChange={(value) => {
                          /* Setting Form Values to state. */
                          setFormData((prev: any) => ({
                            ...prev,
                            mainCurrency: value
                          }));
                        }}
                        filterOption={(input: any, option: any) =>
                          option.children
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                        }
                        label={fieldItem.labelName}
                        optionlist={mainCurenciesListOptions}
                        defaultValue={mainCurrency}
                        placeholder={intl.formatMessage({
                          id: "selectOptions"
                        })}
                      />
                    </DSForm.Item>
                  )}
                {fieldItem.type === "input" && (
                  <DSForm.Item
                    key={fieldItem.schemaName}
                    name={fieldItem.schemaName}
                    rules={[
                      {
                        required: fieldItem.isRequired,
                        message: `Please enter ${fieldItem.labelName}`
                      },
                      {
                        pattern: new RegExp(fieldItem.regex),
                        message: fieldItem.message ? fieldItem.message : ""
                      }
                    ]}
                  >
                    <Input
                      key={fieldItem.schemaName}
                      label={fieldItem.labelName}
                      // message={fieldItem.message}
                      name={fieldItem.schemaName}
                      placeholder={`Enter ${fieldItem.labelName}`}
                      size="medium"
                      type="text"
                      onChange={handleChange}
                      // pattern={fieldItem.regex}
                    />
                  </DSForm.Item>
                )}
                {fieldItem.type === "select" &&
                  fieldItem.schemaName === "country" && (
                    <DSForm.Item
                      key={fieldItem.schemaName}
                      name={fieldItem.schemaName}
                      rules={[
                        {
                          required: fieldItem.isRequired,
                          message: `Please enter ${fieldItem.labelName}`
                        },
                        {
                          pattern: new RegExp(fieldItem.regex),
                          message: fieldItem.message ? fieldItem.message : ""
                        }
                      ]}
                    >
                      <Select
                        onChange={(value) => {
                          /* Setting Form Values to state. */
                          setFormData((prev: any) => ({
                            ...prev,
                            country: value
                          }));
                        }}
                        filterOption={(input: any, option: any) =>
                          option.children
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                        }
                        label={fieldItem.labelName}
                        optionlist={countriesListAsOptions}
                        placeholder={intl.formatMessage({
                          id: "selectOptions"
                        })}
                      />
                    </DSForm.Item>
                  )}
              </>
            );
          })}
          {/* <Spacer size={20} /> */}
          {/* Whether to Save the information for Future Use. */}
          {/*<DSForm.Item name="isSaved">
            <Checkbox
              id="isSaved"
              label={intl.formatMessage({ id: "saveThisBeneficiary" })}
              onChange={(e: any) => {
                e.target.value = e.target.checked;
                handleChange(e);
              }}
            />
            </DSForm.Item>*/}
        </>
      )}
    </>
  );
};
