import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Row, Col } from "antd";

import {
  Accordions,
  Icon,
  TextInput,
  Form,
  Colors,
  Text,
  Select,
  Button,
  Image,
  Spin,
  Modal as CompanyDetailModal,
  SwitchName,
  Notification
} from "@payconstruct/design-system";
import { Tag } from "@payconstruct/design-system/dist/components/atoms/Tag/tag";

import { PageWrapper } from "../../../components";
import ClientHeader from "./components/ClientHeader/ClientHeader";
import { BasicCompanyInfoCard } from "./components/Card/BasicCompanyInfo/BasicCompanyInfo";
import { CompanyDetailCard } from "./components/Card/CompanyDetails/CompanyDetails";
import { BasicCompanyInfoModal } from "./components/Modal/BasicCompanyInfo/BasicCompanyInfo";
import { RiskAndKyc } from "./components/Card/RiskAndKyc/RiskAndKyc";
import { TermsOfServiceModal } from "./components/Modal/TermsOfService/TermsOfService";

import { useAppDispatch, useAppSelector } from "../../../redux/hooks/store";
import {
  removeWebsiteAddress,
  updateContentEditable,
  updateInitialFormWebsiteAddress,
  changeAddressType,
  selectTermsOfService
} from "../../../config/ClientMangement/ClientManagementSlice";
import { selectTimezone } from "../../../config/general/generalSlice";
import {
  useGetClientDetailQuery,
  useUpdateClientDetailMutation,
  useGetAssigneeQuery
} from "../../../services/clientManagement";
import { useGetBrandsQuery } from "../../../services/ControlCenter/endpoints/optionsEndpoint";
import {
  validationOnData,
  generateRandomName
} from "../../../config/transformer";
import { formatDate, formatTimeAndDate } from "../../../utilities/transformers";
import { AddNewUser } from "../ClientSummary/components/Modal/AddNewUser/AddNewUser";

import {
  rightSideHeaderData,
  formatCountriesListForOptionSet,
  formatProductListForOptionSet
} from "./ClientSummaryForm";

import externalLink from "../../../../src/assets/images/externalLink.png";
import Styles from "./clientSummary.module.css";

export const ClientSummary = () => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();

  const { id: clientId }: any = useParams();

  // Setting the Initial State Values
  const [showCompanyInfoModal, setShowCompanyInfoModal] =
    useState<boolean>(false);
  const [showCompanyDetailModal, setShowCompanyDetailModal] =
    useState<boolean>(false);
  const [showTermsOfServiceModal, setShowTermsOfServiceModal] =
    useState<boolean>(false);
  const [formDetails, setFormDetails] = useState<any>({});
  const [editWebsiteValue, setEditWebsiteValue] = useState<any>({});
  const [btnDisabled, setBtnDisabled] = useState<boolean>(true);
  const [randomName] = useState(generateRandomName);
  const [emptyState] = useState("--");
  const [addNewUserShow, setAddNewUserShow] = useState<boolean>(false);

  // Getting the Store Data
  const timezone = useAppSelector(selectTimezone);
  const {
    genericInformation: generic,
    isCompanyInfoUpdated,
    basicCompanyInfo,
    clients,
    initialCompanyInfoFormData,
    initialFormWebsiteAddress,
    addressType,
    riskAndKycInfo,
    selectedRequiredProducts,
    initialBrandFormData
  } = useAppSelector((state) => state.clientManagement);
  const { countries } = useAppSelector((state) => state.countries);
  const countriesList = formatCountriesListForOptionSet(countries);
  const termsOfService = useAppSelector(selectTermsOfService);
  const isCompanyInfoLoader = useAppSelector(
    (state) => state.clientManagement.isCompanyInfoLoader
  );

  const countryOfIncorporation = countries
    ?.filter(
      (country: any) =>
        country.alpha2Code ===
        initialCompanyInfoFormData?.countryOfIncorporation
    )
    .map((country: any) => {
      return country?.name;
    });

  // destructuring the data for sending to CompanyDetailModal
  const { title, subTitle, isAddIcon, isEditAndDeleteIcon } = formDetails;
  const {
    riskCategory,
    externalScreeningResult,
    kycStatus,
    kycApprovedAt,
    nextKycRefreshDate,
    kycApprovedBy,
    riskAndKycTableColumn
  } = riskAndKycInfo;

  // formatting the Website and Client Address for Viewing in the UI Screen
  const website = validationOnData(generic?.websiteAddress, "array");
  const addresses = validationOnData(generic?.addresses, "array");
  const { companyNumber, relationshipManager, customerAccountSpecialist } =
    basicCompanyInfo;

  // Update API Mutation
  const [clientDetail] = useUpdateClientDetailMutation();

  const formatCountryCode = (data: any, country: string) => {
    const countryList = data.find((d: any) => d.name === country);
    return countryList?.alpha2Code;
  };

  // Terms Of Status Static Ui Creation
  const hasTermsAccepted = termsOfService?.length > 0;
  const termsOfStatus = () =>
    hasTermsAccepted ? (
      <div className="status__accepted">
        <Button
          type="secondary"
          size="small"
          label="Status: Accepted"
          icon={{
            name: "eyeOpened",
            position: "right"
          }}
          onClick={() => setShowTermsOfServiceModal(true)}
        />
      </div>
    ) : (
      <div className="status__pending">
        <Tag
          key={"1"}
          isPrefix
          label={"Status: Pending"}
          prefix={<Icon name="clockCircle" />}
        />
      </div>
    );

  const BasicCompanyInfoData = [
    {
      key: 1,
      label: "Country Of Incorporation",
      value: !countryOfIncorporation ? emptyState : countryOfIncorporation,
      hasDivider: true
    },
    {
      key: 2,
      label: "Company Number",
      value: !companyNumber ? emptyState : companyNumber,
      hasDivider: true
    },
    // {
    //   key: 3,
    //   label: "Tier",
    //   value: !tier ? emptyState : capitalize(tier),
    //   hasDivider: true
    // },
    {
      key: 4,
      label: "Relationship Manager",
      value: !relationshipManager
        ? emptyState
        : `${relationshipManager?.firstName}  ${relationshipManager?.lastName}`,
      hasDivider: true
    },
    {
      key: 5,
      label: "CAS Manager",
      value: !customerAccountSpecialist
        ? emptyState
        : `${customerAccountSpecialist?.firstName}  ${customerAccountSpecialist?.lastName}`,
      hasDivider: true
    },
    {
      key: 4,
      label: "Terms of Service",
      value: termsOfStatus(),
      hasDivider: false
    }
  ];

  const kycInfoData = [
    {
      key: 1,
      label: "KYC Approved at",
      value: !kycApprovedAt
        ? emptyState
        : formatTimeAndDate(kycApprovedAt, timezone),
      hasDivider: true
    },
    {
      key: 2,
      label: "Next KYC refresh date",
      value: !nextKycRefreshDate
        ? emptyState
        : formatDate(nextKycRefreshDate, timezone),
      hasDivider: true
    },
    {
      key: 3,
      label: "KYC Approved by",
      value: !kycApprovedBy ? emptyState : kycApprovedBy
    }
  ];

  const formattedRiskCategoryTitle = (riskCategory: any) => {
    if (riskCategory) {
      switch (riskCategory) {
        case "low":
          return "Low";
        case "medium":
          return "Medium";
        case "high_risk_one":
          return "High Risk One";
        case "high_risk_two":
          return "High Risk Two";
        case "high_risk_three":
          return "High Risk Three";
        default:
          return "";
      }
    }
    return emptyState;
  };

  const riskCategoryLabel: string =
    riskCategory && formattedRiskCategoryTitle(riskCategory);

  const formattedScreeningResult = (externalScreeningResult: any) => {
    if (externalScreeningResult) {
      switch (externalScreeningResult) {
        case "approved":
          return "Approved";
        case "declined":
          return "Declined";
        case "pending":
          return "Pending";
        case "in_progress":
          return "In Progress";
        default:
          return "";
      }
    }
    return emptyState;
  };

  const screeningResult: any = formattedScreeningResult(
    externalScreeningResult
  );

  const formattedKycStatus = (kycStatus: any) => {
    if (kycStatus) {
      switch (kycStatus) {
        case "fail":
          return "Fail";
        case "new":
          return "New";
        case "pass":
          return "Pass";
        case "pending":
          return "Pending";
        case "review_required":
          return "Review Required";
        default:
          return "";
      }
    }
    return emptyState;
  };

  const newKycStatus: any = formattedKycStatus(kycStatus);

  const leftSideSubHeaderData = [
    {
      key: 1,
      label: `Risk: ${riskCategoryLabel ? riskCategoryLabel : "--"}`
    },
    {
      key: 2,
      label: `External screening results: ${
        screeningResult ? screeningResult : "--"
      }`
    },
    {
      key: 3,
      label: `KYC status: ${newKycStatus ? newKycStatus : "--"}`
    }
  ];

  const { AssigneeDatavalues = [] } = useGetAssigneeQuery(
    {},
    {
      refetchOnMountOrArgChange: true,
      selectFromResult: ({ data, isLoading, isFetching, isSuccess }) => {
        return {
          AssigneeDatavalues: data?.data.assignees,
          isLoading,
          isFetching,
          isSuccess
        };
      }
    }
  );

  // Api Call to Get the Individual Client Data
  const {
    refetch,
    isFetching: clientDetailFetching,
    isLoading: clientDetailLoading
  } = useGetClientDetailQuery(
    { randomName, clientId },
    {
      refetchOnMountOrArgChange: 2,
      selectFromResult: ({
        data,
        isLoading,
        isSuccess,
        isError,
        isFetching
      }) => ({
        clientData: data?.data,
        isLoading,
        isSuccess,
        isError,
        isFetching
      })
    }
  );

  //Api Call to Get the Brand Data
  const { brandsData, products } = useGetBrandsQuery(
    {},
    {
      refetchOnMountOrArgChange: 10,
      selectFromResult: ({ data, isLoading, isFetching, isSuccess }) => {
        return {
          brandsData: data?.data.brands,
          products: data?.data?.brands[0]?.products,
          isLoading,
          isFetching,
          isSuccess
        };
      }
    }
  );

  const brandAndProductData = (brands: any) => {
    const selectedData: any = [];
    const formatBrand: any = {
      key: 1,
      label: "Brand",
      value: "Orbital"
    };
    selectedData.push(formatBrand);
    if (selectedRequiredProducts?.length > 0) {
      (selectedRequiredProducts || []).map((item: any, index: number) => {
        const formatProduct = {
          key: item.id,
          label: index === 0 ? "Products" : "",
          value: item.product
        };
        return selectedData.push(formatProduct);
      });
      return selectedData;
    }
  };

  // Once the Update API Success Means, We will trigger the Get Api to fetch the Client information
  useEffect(() => {
    form.resetFields();
    if (isCompanyInfoUpdated) {
      refetch();
    }
    if (initialBrandFormData) {
      form.setFieldsValue({
        products: initialBrandFormData
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCompanyInfoUpdated, initialBrandFormData]);

  // Set the Initial form Values for Website Modal
  useEffect(() => {
    if (initialFormWebsiteAddress) {
      form.setFieldsValue(initialFormWebsiteAddress);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFormWebsiteAddress.label, form, initialFormWebsiteAddress]);

  // Set the Initial form Values for Address Modal
  useEffect(() => {
    if (initialCompanyInfoFormData && addressType) {
      let address;
      if (addressType === "registered") {
        address = initialCompanyInfoFormData?.registerAddress;
      }
      if (addressType === "principal_place_of_business") {
        address = initialCompanyInfoFormData?.principalAddress;
      }
      if (addressType === "postal") {
        address = initialCompanyInfoFormData?.postalAddress;
      }
      form.setFieldsValue(address);
    }
  }, [addressType, form, initialCompanyInfoFormData]);

  // Update Company Information Modal
  const handleCompanyInfoEdit = (): any => {
    setShowCompanyInfoModal(true);
  };

  // Add Http to The URL
  const addHttp = (url: any) => {
    if (!/^(?:f|ht)tps?\:\/\//.test(url)) {
      url = "https://" + url;
    }
    return url;
  };

  const newWebSiteAddress = (website || []).map(
    (websites: any, index: number): any => {
      if (websites) {
        const formatUrl = addHttp(websites);
        const formatWebsiteAddress = {
          key: index,
          label: websites,
          linkUrl: formatUrl,
          value: websites
        };
        return formatWebsiteAddress;
      }
      return website;
    }
  );
  const webSiteAddress: any = newWebSiteAddress;

  const handleCompanyDetailsEdit = (data: any, label: any): any => {
    setFormDetails(getFormattedData(data, label));
    setShowCompanyDetailModal(true);
    setBtnDisabled(true);
  };

  const getFormattedAddress = (itemsObject: any): any => {
    const sortingArr = [
      itemsObject?.buildingNumber && "buildingNumber",
      itemsObject?.buildingName && "buildingName",
      itemsObject?.room && "room",
      itemsObject?.floor && "floor",
      "street",
      "city",
      "postCode",
      "country"
    ];

    const removeUndefined = sortingArr.filter(
      (item: string) => item !== undefined
    );
    const removeEmpty = removeUndefined.filter((item: string) => item !== "");
    let str = "";
    if (itemsObject !== null) {
      for (let i = 0; i < removeEmpty.length; i++) {
        if (itemsObject[removeEmpty[i]]) {
          if (i === 0) {
            str += itemsObject[removeEmpty[i]];
          } else {
            itemsObject[removeEmpty[i]] &&
              (str += ", " + itemsObject[removeEmpty[i]]);
          }
        }
      }
    }
    return str;
  };

  const getFormattedLabel = (type: string | undefined): string | undefined => {
    if (type) {
      switch (type) {
        case "registered":
          return "Registered Address";
        case "principal_place_of_business":
          return "Principal Place of Business Address";
        case "postal":
          return "Postal Address";
        default:
          return "";
      }
    }
    return undefined;
  };

  const newCompanyAddress = (addresses || [])
    .filter((item: any) => item !== null)
    .map((item: any, index: number): any => {
      if (item) {
        const formatLabel = getFormattedLabel(item?.type);
        const formatValue = getFormattedAddress(item);
        const formatAddresses = {
          key: index,
          label: formatLabel,
          value: formatValue
        };
        return formatAddresses;
      }
      return addresses;
    });
  const companyAddresses: any = newCompanyAddress;

  const getFormattedData = (data: any, label: any) => {
    if (label) {
      switch (label) {
        case "brands":
          return {
            title: "Brands",
            subTitle: "Edit the brands",
            isAddIcon: true,
            isEditAndDeleteIcon: true
          };
        case "website":
          return {
            title: "Websites",
            subTitle: "Edit the company websites",
            isAddIcon: true,
            isEditAndDeleteIcon: true
          };
        case "address":
          return {
            title: "Entity Address",
            subTitle: "Edit entity addresses",
            contentData: data
          };
        default:
          return "";
      }
    }
    return undefined;
  };

  const onFieldsChange = (values: any, data: any) => {
    const isErrorExists = (data || []).filter(
      (el: any) => el?.errors && el?.errors?.length > 0
    );
    if (isErrorExists !== undefined && isErrorExists.length > 0) {
      setBtnDisabled(true);
    } else {
      setBtnDisabled(false);
    }
  };

  const onFinish = async (formValues: any, formType: any) => {
    if (formType === "editBrandForm") {
      const selectedProducts: any[] = [];
      formValues["products"].forEach((data: string) => {
        const filterObj =
          products !== undefined &&
          products.find((item: any) => item.productCode === data);
        selectedProducts.push(filterObj["_id"]);
      });
      try {
        await clientDetail({
          clientId,
          requiredProduct: selectedProducts
        })
          .unwrap()
          .then(() => {
            refetch();
            Notification({
              message: "",
              description: "Successfully updated!",
              type: "success"
            });
            setShowCompanyDetailModal(false);
          });
        if (form?.resetFields) form?.resetFields();
      } catch (err: any) {
        Notification({
          message: "",
          description: "Failed to update, Something is wrong!",
          type: "error"
        });
        console.log("Error: ", err);
      }
    }
    if (formType === "addWebsiteForm") {
      const genericInformation = {
        ...generic,
        websiteAddress: [...generic.websiteAddress, formValues.website]
      };
      try {
        await clientDetail({ clientId, genericInformation })
          .unwrap()
          .then(() => {
            refetch();
            Notification({
              message: "",
              description: "Successfully updated!",
              type: "success"
            });
            setShowCompanyDetailModal(false);
          });

        if (form?.resetFields) form?.resetFields();
      } catch (err: any) {
        Notification({
          message: "",
          description: "Failed to update, Something is wrong!",
          type: "error"
        });
        console.log("Error: ", err);
      }
    }
    if (formType === "editWebsiteForm") {
      const newArray = [...generic.websiteAddress];
      newArray[editWebsiteValue?.index] = formValues.website;
      const genericInformation = {
        ...generic,
        websiteAddress: newArray
      };
      try {
        await clientDetail({ clientId, genericInformation })
          .unwrap()
          .then(() => {
            refetch();
            Notification({
              message: "",
              description: "Successfully updated!",
              type: "success"
            });
            setShowCompanyDetailModal(false);
          });
        if (form?.resetFields) form?.resetFields();
      } catch (err: any) {
        Notification({
          message: "",
          description: "Failed to update, Something is wrong!",
          type: "error"
        });
        console.log("Error: ", err);
      }
    }
    if (formType === "editAddressForm") {
      const filterAddress = generic?.addresses.filter(
        (d: any) => d !== null && d.type !== addressType
      );

      const countryCode = formatCountryCode(countries, formValues?.country);
      formValues.countryCode = countryCode;
      const formatAddress = {
        ...formValues,
        type: addressType,
        status: "active"
      };
      const genericInformation = {
        ...generic,
        addresses: [...filterAddress, formatAddress]
      };
      try {
        await clientDetail({ clientId, genericInformation })
          .unwrap()
          .then(() => {
            refetch();
            Notification({
              message: "",
              description: "Successfully updated!",
              type: "success"
            });
            setShowCompanyDetailModal(false);
          });
        if (form?.resetFields) form?.resetFields();
      } catch (err: any) {
        Notification({
          message: "",
          description: "Failed to update, Something is wrong!",
          type: "error"
        });
        console.log("Error: ", err);
      }
    }
  };

  const brandsModalBody = (formType: any) => {
    const formatProductList: any = formatProductListForOptionSet(products);
    return (
      <div className={Styles["formWrapper"]}>
        <Form
          form={form}
          initialValues={{
            brands: "Orbital",
            products: initialBrandFormData
          }}
          onFieldsChange={onFieldsChange}
          onFinish={(value) => onFinish(value, formType)}
        >
          <Row gutter={15}>
            <Col className="gutter-row" span={24}>
              <Form.Item name="brands">
                <TextInput
                  type="text"
                  name="brands"
                  label="Brands"
                  floatingLabel={true}
                  required={true}
                  disabled={true}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={15}>
            <Col className="gutter-row" span={24}>
              <Form.Item name={"products"}>
                <Select
                  label={"Products"}
                  mode={"multiple"}
                  optionlist={formatProductList}
                  placeholder="Products"
                  style={{
                    width: "100%"
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    );
  };

  const websiteModalBody = () => {
    // Create Website Address Info
    const handleCreateWebsiteAddress = () => {
      form.setFieldsValue({ website: "", name: "" });
      setFormDetails({
        title: "Add New Website",
        subTitle: "Edit the Company websites"
      });
      dispatch(updateContentEditable(false));
    };

    // Update Website Address Info
    const handleUpdateWebsiteAddress = async (data: any, index: number) => {
      setEditWebsiteValue({ data, index });
      form.setFieldsValue({ website: data?.label, name: "" });
      dispatch(updateInitialFormWebsiteAddress(data));
      setFormDetails({
        title: "Update Website info",
        subTitle: "Edit the Company websites"
      });
    };

    // Delete Website Address Info
    const handleDeleteWebSiteAddress = async (data: any) => {
      const filteredData = website.filter((d: any) => d !== data.label);
      const genericInformation = {
        ...generic,
        websiteAddress: filteredData
      };
      dispatch(removeWebsiteAddress(filteredData));
      try {
        await clientDetail({
          clientId: clients?.id,
          genericInformation
        }).unwrap();
        Notification({
          message: "",
          description: "Successfully updated!",
          type: "success"
        });
      } catch (err: any) {
        Notification({
          message: "",
          description: "Failed to update, Something is wrong!",
          type: "error"
        });
        console.log("Error: ", err);
      }
    };

    return (
      <div className={Styles["website__info__body"]}>
        {isAddIcon && (
          <div className={Styles["add__website__icon"]}>
            <Button
              type="link"
              label="Add New Website"
              className={Styles["btn__add"]}
              icon={{
                name: "plus"
              }}
              onClick={handleCreateWebsiteAddress}
            />
          </div>
        )}
        {(webSiteAddress || []).map((d: any, i: number) => {
          return (
            <div key={i} className={Styles["website__info__content"]}>
              <div className={Styles["website__info__content__inner"]}>
                <div>
                  <Text
                    size="xsmall"
                    color={Colors.grey.neutral500}
                    label={!d.label ? "" : d.label}
                  />
                  {d.linkUrl && (
                    <span style={{ marginLeft: "10px" }}>
                      <a href={d.linkUrl} target="_blank" rel="noreferrer">
                        <Image
                          src={externalLink}
                          alt="etttyst"
                          preview={false}
                        />
                      </a>
                    </span>
                  )}
                  {d.label && <span style={{ margin: "0 7px" }}>/</span>}
                  {d.value && (
                    <Text
                      size="xsmall"
                      color={Colors.grey.neutral700}
                      label={d.value}
                    />
                  )}
                </div>
                {isEditAndDeleteIcon && (
                  <div>
                    <span style={{ marginRight: "5px", cursor: "pointer" }}>
                      <Icon
                        name="pen"
                        size="small"
                        color={Colors.grey.neutral500}
                        onClick={() => handleUpdateWebsiteAddress(d, i)}
                      />
                    </span>
                    <span style={{ marginLeft: "5px", cursor: "pointer" }}>
                      <Icon
                        name="delete"
                        size="small"
                        color={Colors.grey.neutral500}
                        onClick={() => handleDeleteWebSiteAddress(d)}
                      />
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const createAndUpdateWebsiteModalForm = (formType: any): any => {
    return (
      <Form
        form={form}
        initialValues={
          formType === "editWebsiteForm"
            ? {
                website: initialFormWebsiteAddress?.label,
                name: "raj"
              }
            : {}
        }
        onFieldsChange={onFieldsChange}
        onFinish={(value) => onFinish(value, formType)}
      >
        <Form.Item name="website">
          <TextInput
            type="text"
            name="website"
            label="Website"
            placeholder="https://"
            floatingLabel={true}
            required={true}
          />
        </Form.Item>
        <Form.Item name="name">
          <TextInput
            type="text"
            name="name"
            label="Name"
            placeholder="Enter Website Name"
            floatingLabel={true}
            // required={true}
          />
        </Form.Item>
      </Form>
    );
  };

  const addressModalBody = (formType: any) => {
    const registerAdd: any = initialCompanyInfoFormData?.registerAddress;
    const principalAdd: any = initialCompanyInfoFormData?.principalAddress;
    const postalAdd: any = initialCompanyInfoFormData?.postalAddress;

    /* Address Types */
    const addressTypeOptions: any = [
      {
        key: 0,
        label: "Registered address",
        value: "registered"
      },
      {
        key: 1,
        label: "Principal place of business",
        value: "principal_place_of_business"
      },
      {
        key: 2,
        label: "Postal address",
        value: "postal"
      }
    ];

    /* OnChange Switch menu function */
    const onChangeAddressType = (result: any) => {
      const { addressType } = result;
      dispatch(changeAddressType(addressType));
      form.setFieldsValue({
        buildingName: "",
        buildingNumber: "",
        city: "",
        country: "",
        countryCode: "",
        floor: "",
        postCode: "",
        room: "",
        status: "",
        street: ""
      });
    };

    return (
      <div className={Styles["addressForm"]}>
        <SwitchName
          selectedOption={
            addressType === "registered"
              ? 0
              : addressType === "principal_place_of_business"
              ? 1
              : 2
          }
          name="addressType"
          onChange={onChangeAddressType}
          options={addressTypeOptions}
        />
        <div className={Styles["formWrapper"]}>
          <Form
            form={form}
            initialValues={
              addressType === "registered"
                ? registerAdd
                : addressType === "principal_place_of_business"
                ? principalAdd
                : postalAdd
            }
            onFieldsChange={onFieldsChange}
            onFinish={(value) => onFinish(value, formType)}
          >
            <Row gutter={15}>
              <Col className="gutter-row" span={12}>
                <Form.Item name="floor">
                  <TextInput
                    type="text"
                    name="floor"
                    label="Floor"
                    floatingLabel={true}
                    required={false}
                  />
                </Form.Item>
              </Col>
              <Col className="gutter-row" span={12}>
                <Form.Item name="room">
                  <TextInput
                    type="text"
                    name="room"
                    label="Apartment"
                    floatingLabel={true}
                    required={false}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={15}>
              <Col className="gutter-row" span={12}>
                <Form.Item name="buildingName">
                  <TextInput
                    type="text"
                    name="buildingName"
                    label="Building Name"
                    floatingLabel={true}
                    required={false}
                  />
                </Form.Item>
              </Col>
              <Col className="gutter-row" span={12}>
                <Form.Item name="buildingNumber">
                  <TextInput
                    type="text"
                    name="buildingNumber"
                    label="Building Number"
                    floatingLabel={true}
                    required={false}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={15}>
              <Col className="gutter-row" span={24}>
                <Form.Item name="street">
                  <TextInput
                    type="text"
                    name="street"
                    label="Street"
                    floatingLabel={true}
                    required={true}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={15}>
              <Col className="gutter-row" span={12}>
                <Form.Item name="city">
                  <TextInput
                    type="text"
                    name="city"
                    label="City"
                    floatingLabel={true}
                    required={true}
                  />
                </Form.Item>
              </Col>
              <Col className="gutter-row" span={12}>
                <Form.Item name="postCode">
                  <TextInput
                    type="text"
                    name="postCode"
                    label="Zip Code"
                    floatingLabel={true}
                    required={true}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={15}>
              <Col className="gutter-row" span={24}>
                <Form.Item name={"country"}>
                  <Select
                    label={"Country"}
                    optionlist={countriesList}
                    style={{
                      width: "100%"
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      </div>
    );
  };

  const getModalDescription = () => {
    if (title) {
      switch (title) {
        case "Brands":
          return brandsModalBody("editBrandForm");
        case "Websites":
          return websiteModalBody();
        case "Add New Website":
          return createAndUpdateWebsiteModalForm("addWebsiteForm");
        case "Update Website info":
          return createAndUpdateWebsiteModalForm("editWebsiteForm");
        case "Entity Address":
          return addressModalBody("editAddressForm");
        default:
          return "";
      }
    }
    return undefined;
  };
  const isPageLoading: boolean = clientDetailLoading;
  return (
    <PageWrapper>
      {!isPageLoading && (
        <ClientHeader
          onClickEdit={handleCompanyInfoEdit}
          onClickAddNewUser={() => setAddNewUserShow(true)}
        />
      )}
      <Spin loading={clientDetailLoading || clientDetailFetching}>
        <Accordions
          header="Company Details"
          text={
            <div className={Styles["companyDetails"]}>
              <BasicCompanyInfoCard contentData={BasicCompanyInfoData} />
              <div className={Styles["user__detail_card__Wrapper"]}>
                <CompanyDetailCard
                  headingLabel={`Brands & Product Usage`}
                  contentData={brandAndProductData(brandsData)}
                  onClickEdit={handleCompanyDetailsEdit}
                />
                <CompanyDetailCard
                  headingLabel="Client Websites"
                  contentData={webSiteAddress.length > 0 && webSiteAddress}
                  onClickEdit={handleCompanyDetailsEdit}
                />
                <CompanyDetailCard
                  headingLabel="Addresses"
                  contentData={companyAddresses.length > 0 && companyAddresses}
                  onClickEdit={handleCompanyDetailsEdit}
                />
              </div>
            </div>
          }
          unCollapse={true}
        />
        {addNewUserShow && !isPageLoading && (
          <AddNewUser
            show={addNewUserShow}
            title={"New User or Person"}
            toggleShow={(value) => setAddNewUserShow(value)}
            onClickCancel={() => {
              setAddNewUserShow(false);
              form.resetFields();
            }}
            onClickOk={() => {
              // !isCompanyInfoLoader && setShowCompanyInfoModal(false);
            }}
            refetchGetClients={() => {}}
          />
        )}
        <RiskAndKyc
          title={"Risk & KYC"}
          rightSideHeaderData={rightSideHeaderData}
          leftSideSubHeaderData={leftSideSubHeaderData}
          contentData={kycInfoData}
          clientDetailFetching={clientDetailFetching}
          clientDetailLoading={clientDetailLoading}
          riskAndKycTableColumn={riskAndKycTableColumn}
          timezone={timezone}
        />
        <BasicCompanyInfoModal
          show={showCompanyInfoModal}
          isLoading={isCompanyInfoLoader}
          title={"Company Information"}
          subTitle={`Edit the basic company information`}
          onCancelText={"Cancel"}
          onOkText={"Save Details"}
          onClickCancel={() => {
            setShowCompanyInfoModal(false);
            form.resetFields();
          }}
          onClickOk={() => {
            !isCompanyInfoLoader && setShowCompanyInfoModal(false);
          }}
          AssigneeData={AssigneeDatavalues}
        />
        <CompanyDetailModal
          title={title}
          modalWidth={550}
          subTitle={subTitle}
          modalView={showCompanyDetailModal}
          btnLoading={isCompanyInfoLoader}
          buttonOkDisabled={btnDisabled}
          description={getModalDescription()}
          onCancelText={"Cancel"}
          onOkText={"Save Details"}
          onClickCancel={() => {
            setShowCompanyDetailModal(false);
            form.resetFields();
          }}
          onClickOk={() => {
            form.submit();
          }}
        />
        <TermsOfServiceModal
          show={showTermsOfServiceModal}
          title={"Terms of Service"}
          termsOfService={termsOfService}
          onCancelText={"Close"}
          onClickCancel={() => {
            setShowTermsOfServiceModal(false);
          }}
          timezone={timezone}
        />
      </Spin>
    </PageWrapper>
  );
};

export { ClientSummary as default };
