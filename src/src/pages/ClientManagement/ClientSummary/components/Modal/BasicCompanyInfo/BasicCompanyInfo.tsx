import React, { useEffect, useState } from "react";
import { Row, Col } from "antd";
import {
  Modal,
  Form,
  TextInput,
  Select,
  Notification
} from "@payconstruct/design-system";
import {
  useAppSelector,
  useAppDispatch
} from "../../../../../../redux/hooks/store";
import { updateSelectedIndustryInfo } from "../../../../../../config/ClientMangement/ClientManagementSlice";
import {
  useUpdateClientDetailMutation,
  AssigneesResponse
} from "../../../../../../services/clientManagement";
import {
  companyTypes,
  IndustryOptionList,
  subIndustries,
  tierList,
  formatCountriesListForOptionSet
} from "../../../ClientSummaryForm";
import Styles from "./basicCompanyInfo.module.css";

interface BasicCompanyInfoBodyProps {
  form: any;
  formSubmitAction: () => void;
  AssigneeData: AssigneesResponse[];
}

const BasicCompanyInfoModalBody: React.FC<BasicCompanyInfoBodyProps> = ({
  form,
  formSubmitAction,
  AssigneeData
}) => {
  const dispatch = useAppDispatch();
  const { countries } = useAppSelector((state) => state.countries);
  const countriesList = formatCountriesListForOptionSet(countries);

  const {
    initialCompanyInfoFormData,
    selectedIndustryInfo,
    clients,
    genericInformation: generic
  } = useAppSelector((state) => state.clientManagement);

  const { industryName, industrySubTypes, isIndustryOther } =
    selectedIndustryInfo;

  const industrySelected =
    initialCompanyInfoFormData?.industries !== undefined &&
    initialCompanyInfoFormData?.industries.length > 0 &&
    initialCompanyInfoFormData?.industries[0];

  useEffect(() => {
    if (industrySelected) {
      if (
        industrySelected?.industryType !== "other" &&
        ((industrySelected?.subType?.length &&
          industrySelected?.subType[0] === "other") ||
          industrySelected?.subType[1] === "other" ||
          industrySelected?.subType[2] === "other")
      ) {
        if (industrySelected?.industryType === "forex") {
          form.setFieldsValue({
            otherForex: industrySelected?.comment
          });
        }
        if (industrySelected?.industryType === "gambling") {
          form.setFieldsValue({
            otherGamling: industrySelected?.comment
          });
        }
      }
    }
  });

  const otherForex =
    industrySubTypes !== undefined &&
    industrySubTypes &&
    industryName === "forex" &&
    industrySubTypes.includes("other");

  const otherGamling =
    industrySubTypes !== undefined &&
    industrySubTypes &&
    industryName === "gambling" &&
    industrySubTypes.includes("other");

  useEffect(() => {
    if (initialCompanyInfoFormData) {
      form.setFieldsValue(initialCompanyInfoFormData);
    }
  }, [initialCompanyInfoFormData, form]);

  const [clientDetail] = useUpdateClientDetailMutation();

  const handleSelectedIndustry = (data: any): any => {
    if (data === "forex" || data === "gambling") {
      const formatValue: any = {
        industryName: data,
        industrySubTypes: [],
        isIndustryOther: false
      };
      dispatch(updateSelectedIndustryInfo(formatValue));
    }
    if (data === "other") {
      const formatValue: any = {
        industryName: data,
        industrySubTypes: selectedIndustryInfo.industrySubTypes,
        isIndustryOther: true
      };
      dispatch(updateSelectedIndustryInfo(formatValue));
    }
    form.setFieldsValue({
      subType: undefined,
      comment: undefined
    });
  };
  const handleSelectedOtherSubType = (data: any): any => {
    const formatValue: any = {
      ...selectedIndustryInfo,
      industrySubTypes: data
    };
    dispatch(updateSelectedIndustryInfo(formatValue));
  };

  const formatCountryCode = (data: any, country: string) => {
    const countryList = data.find((d: any) => d.name === country);
    return countryList?.alpha2Code;
  };

  const onFinish = async (formValues: {
    registeredCompanyName: string;
    companyType: string;
    companyNumber: string | number;
    tradingName: string;
    country: string;
    industryName: string;
    subType: any[];
    comment: string;
    tier: string;
    relationshipManager: string;
    customerAccountSpecialist: string;
  }) => {
    // let adders: any = {};
    const countryCode = formatCountryCode(countries, formValues.country);
    const addresses = generic?.addresses ? generic?.addresses : [];

    // const principalAddress = addresses.find(
    //   (address: any) => address?.type === "principal_place_of_business"
    // );
    // const postalAddress = addresses.find(
    //   (address: any) => address?.type === "postal"
    // );
    // (addresses || []).forEach((data: { type: string }) => {
    //   if (data?.type === "registered" || data?.type !== "registered") {
    //     const address = {
    //       ...generic?.addresses[0],
    //       countryCode: countryCode,
    //       country: formValues.country,
    //       type: "registered"
    //     };
    //     adders = { ...address };
    //   }
    // });

    // if (generic?.addresses?.length === 0 && formValues?.country) {
    //   const address = {
    //     ...generic?.addresses[0],
    //     countryCode: countryCode,
    //     country: formValues?.country,
    //     type: "registered"
    //   };
    //   adders = { ...address };
    // }
    const industry = {
      ...generic?.industries[0],
      industryType: formValues?.industryName,
      subType: formValues?.subType?.length ? formValues.subType : [],
      comment: formValues?.comment ? formValues.comment : ""
    };

    const genericInformation = {
      ...generic,
      registeredCompanyName: formValues.registeredCompanyName,
      countryOfIncorporation: countryCode,
      companyType: formValues.companyType,
      companyNumber: formValues.companyNumber,
      tradingName: formValues.tradingName,
      addresses: addresses,
      industries: [industry],
      tier: formValues.tier,
      entityAssignees: [
        {
          customerAccountSpecialist: formValues.customerAccountSpecialist
            ? formValues.customerAccountSpecialist
            : null,
          relationshipManager: formValues.relationshipManager
            ? formValues.relationshipManager
            : null
        }
      ]
    };
    // principalAddress && genericInformation?.addresses?.push(principalAddress);
    // postalAddress && genericInformation?.addresses?.push(postalAddress);
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

      formSubmitAction();
      if (form?.resetFields) form?.resetFields();
    } catch (err: any) {
      Notification({
        message: "",
        description: "Failed to update, Something is wrong!",
        type: "error"
      });
      console.log("Error: ", err);
    }
  };

  const rmOptionList = (AssigneeData: AssigneesResponse[] | any) => {
    return AssigneeData?.filter((list: any) => list?.type === "rm")?.map(
      (data: any) => [data?._id, `${data?.firstName} ${data?.lastName}`]
    );
  };

  const casOptionList = (AssigneeData: AssigneesResponse[] | any) => {
    return AssigneeData?.filter((list: any) => list?.type === "cas")?.map(
      (data: any) => [data?._id, `${data?.firstName} ${data?.lastName}`]
    );
  };

  return (
    <div className={Styles["account-settings-modal"]}>
      <Form
        form={form}
        initialValues={initialCompanyInfoFormData}
        onFinish={onFinish}
      >
        <Row gutter={15}>
          <Col className="gutter-row" span={24}>
            <Form.Item name={"registeredCompanyName"}>
              <TextInput
                type={"text"}
                name={"registeredCompanyName"}
                label={"Registered Company Name"}
                placeholder={"Enter Registered Company Name"}
                required={true}
                message={"Registered Company Name is required!"}
                floatingLabel={true}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={15}>
          <Col className="gutter-row" span={24}>
            <Form.Item name={"companyType"}>
              <Select
                label="Company Type"
                optionlist={companyTypes}
                placeholder={"Enter Company Type"}
                style={{
                  width: "100%"
                }}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={15}>
          <Col className="gutter-row" span={24}>
            <Form.Item name={"companyNumber"}>
              <TextInput
                type={"text"}
                name={"companyNumber"}
                label={"Company Number"}
                placeholder={"Enter Company Number"}
                required={true}
                message={"Company Number is required!"}
                floatingLabel={true}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={15}>
          <Col className="gutter-row" span={12}>
            <Form.Item name={"tradingName"}>
              <TextInput
                type={"text"}
                name={"tradingName"}
                label={"Trading Name"}
                placeholder={"Enter Trading Name"}
                required={true}
                message={"Trading Name is required!"}
                floatingLabel={true}
              />
            </Form.Item>
          </Col>
          <Col className="gutter-row" span={12}>
            <Form.Item
              name={"country"}
              requiredMark
              rules={[
                {
                  required: true,
                  message: "Country is required!"
                }
              ]}
            >
              <Select
                label={"Country of incorporation"}
                optionlist={countriesList}
                placeholder={"Select Country"}
                style={{
                  width: "100%"
                }}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={15}>
          <Col className="gutter-row" span={24}>
            <Form.Item name={"industryName"}>
              <Select
                label={"Industry"}
                optionlist={IndustryOptionList}
                placeholder={"Select Industry"}
                style={{
                  width: "100%"
                }}
                onChange={handleSelectedIndustry}
              />
            </Form.Item>
          </Col>
          {!isIndustryOther && (
            <Col className={"gutter-row"} span={24}>
              <Form.Item name={"subType"}>
                <Select
                  label={"Industry Sub-Type"}
                  mode={"multiple"}
                  optionlist={subIndustries}
                  placeholder={"Select Industry Sub-Type"}
                  style={{
                    width: "100%"
                  }}
                  onChange={handleSelectedOtherSubType}
                />
              </Form.Item>
            </Col>
          )}
          {(isIndustryOther || industrySubTypes.includes("other")) && (
            <Col className="gutter-row" span={24}>
              <Form.Item name={"comment"}>
                <TextInput
                  type={"text"}
                  name={"comment"}
                  label={"Other Industry"}
                  placeholder={"Enter Other Industry"}
                  required={true}
                  message={"Other Industry is required!"}
                  floatingLabel={true}
                />
              </Form.Item>
            </Col>
          )}
        </Row>

        <Row gutter={15}>
          <Col className="gutter-row" span={12}>
            <Form.Item name={"relationshipManager"}>
              <Select
                label={"Relationship Manager"}
                optionlist={rmOptionList(AssigneeData)}
                placeholder={"Select RM"}
                style={{
                  width: "100%"
                }}
              />
            </Form.Item>
          </Col>

          <Col className="gutter-row" span={12}>
            <Form.Item name={"customerAccountSpecialist"}>
              <Select
                label={"Customer Account Specialist"}
                optionlist={casOptionList(AssigneeData)}
                placeholder={"Select cas"}
                style={{
                  width: "100%"
                }}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={15}>
          <Col className="gutter-row" span={12}>
            <Form.Item name={"tier"}>
              <Select
                label={"Tier"}
                optionlist={tierList}
                placeholder={"Select Tier"}
                style={{
                  width: "100%"
                }}
                onChange={handleSelectedOtherSubType}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

interface BasicCompanyInfoModalProps {
  show: boolean;
  title: any;
  subTitle: any;
  onCancelText: string;
  onOkText: string;
  isLoading: boolean;
  onClickCancel: () => void;
  onClickOk: (data?: any) => void;
  AssigneeData: any;
}

const BasicCompanyInfoModal: React.FC<BasicCompanyInfoModalProps> = ({
  show,
  title,
  subTitle,
  onCancelText,
  onOkText,
  isLoading,
  onClickCancel,
  onClickOk,
  AssigneeData
}) => {
  const [form] = Form.useForm();

  return (
    <Modal
      modalView={show}
      title={title}
      subTitle={subTitle}
      onCancelText={onCancelText}
      onOkText={onOkText}
      btnLoading={isLoading}
      onClickCancel={() => {
        onClickCancel();
        form.resetFields();
      }}
      onClickOk={() => {
        form.submit();
      }}
      description={
        <BasicCompanyInfoModalBody
          form={form}
          formSubmitAction={onClickOk}
          AssigneeData={AssigneeData}
        />
      }
    />
  );
};

export { BasicCompanyInfoModal };
