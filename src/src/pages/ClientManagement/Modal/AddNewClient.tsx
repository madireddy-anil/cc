import React, { useEffect, useState } from "react";
import { Row, Col } from "antd";
import {
  Form,
  Modal,
  Text,
  TextInput,
  Select,
  Notification
} from "@payconstruct/design-system";
import { Spacer } from "../../../components";
import { useAppSelector } from "../../../redux/hooks/store";
import { updateUsersPaginationProps } from "../../../config/ClientMangement/ClientManagementSlice";
import { useAddNewClientMutation } from "../../../services/clientManagement";
import {
  companyTypes,
  IndustryOptionList,
  subIndustries,
  formatCountriesListForOptionSet
} from "../ClientSummary/ClientSummaryForm";
import Styles from "../Clients.module.css";

interface BasicCompanyInfoModalProps {
  show: boolean;
  title: string;
  onCancelText: string;
  onOkText: string;
  toggleShow: (value: boolean) => void;
  onClickCancel: () => void;
  onClickOk: (data?: any) => void;
  refetchGetClients: () => void;
}

const AddNewClient: React.FC<BasicCompanyInfoModalProps> = ({
  show,
  title,
  onCancelText,
  onOkText,
  toggleShow,
  onClickCancel,
  refetchGetClients
}) => {
  const [form] = Form.useForm();
  const { countries } = useAppSelector((state) => state.countries);
  const countriesList = formatCountriesListForOptionSet(countries);
  const [isBtnEnabled, setBtnEnabled] = useState<boolean>(true);
  const [selectedIndustryType, setIndustryType] = useState<string>("");
  const [selectedSubIndustryType, setSubIndustryType] = useState<string[]>([]);

  const [addNewClient, { isLoading }] = useAddNewClientMutation();

  useEffect(() => {
    setBtnEnabled(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const AddNewClientModal = () => {
    const formatCountryCode = (data: any[], country: string) => {
      const countryList = data.find(
        (d: { name: string }) => d.name === country
      );
      return countryList?.alpha2Code;
    };

    const onFinish = async (formValues: {
      registeredCompanyName: string;
      companyType: string;
      companyNumber: string | number;
      tradingName: string;
      countryOfIncorporation: string;
      registerCountry: string;
      industryName: string;
      subType: string[];
      comment: string;
      websiteAddress: string;

      buildingNumber: string;
      buildingName: string;
      postCode: string;
      floor: string;
      street: string;
      room: string;
      city: string;
    }) => {
      const registerCountryCode = formatCountryCode(
        countries,
        formValues.registerCountry
      );
      const countryOfIncorporationCountryCode = formatCountryCode(
        countries,
        formValues.countryOfIncorporation
      );
      const address = [
        {
          buildingNumber: formValues.buildingNumber,
          buildingName: formValues.buildingName,
          postCode: formValues.postCode,
          floor: formValues.floor,
          room: formValues.room,
          city: formValues.city,
          street: formValues.street,
          countryCode: registerCountryCode,
          country: formValues.registerCountry,
          type: "registered",
          status: "active"
        }
      ];

      const industry = [
        {
          industryType: formValues.industryName ? formValues.industryName : "",
          subType: formValues.subType ? formValues.subType : [],
          comment: formValues?.comment ? formValues.comment : ""
        }
      ];

      const data = {
        genericInformation: {
          registeredCompanyName: formValues.registeredCompanyName,
          countryOfIncorporation: countryOfIncorporationCountryCode,
          companyType: formValues.companyType,
          companyNumber: formValues.companyNumber,
          tradingName: formValues.tradingName,
          websiteAddress: formValues?.websiteAddress
            ? [formValues?.websiteAddress]
            : [],
          addresses: address,
          industries: industry
        }
      };
      updateUsersPaginationProps({
        current: 0,
        pageSize: 10
      });
      try {
        await addNewClient(data)
          .unwrap()
          .then(() => {
            Notification({
              message: "",
              description: "New client has been created successfully!",
              type: "success"
            });
            updateUsersPaginationProps({
              current: 1,
              pageSize: 10,
              companyName: formValues.registeredCompanyName
            });
            refetchGetClients();
            toggleShow(false);
            form?.resetFields();
          });
      } catch (err: any) {
        Notification({
          message: "",
          description:
            "We apologise for the inconvenience. Please get in touch with technology team.",
          type: "error"
        });
        console.log("Error: ", err);
      }
    };

    const onFieldsChange = (aa: any, formFields: any) => {
      const isInputTouched: boolean[] = [];
      const nonMandatoryFields: string[] = [
        "websiteAddress",
        "buildingName",
        "floor",
        "room"
      ];
      const filterMandatoryFields = formFields.filter(
        (item: { name: string[] }) =>
          !nonMandatoryFields.includes(item?.name?.[0])
      );
      filterMandatoryFields.map((item: { value: string }) => {
        item?.value ? isInputTouched.push(true) : isInputTouched.push(false);
      });
      return isInputTouched.includes(false)
        ? setBtnEnabled(true)
        : setBtnEnabled(false);
    };

    const handleSelectedIndustry = (industryType: string) => {
      setIndustryType(industryType);
      form.setFieldsValue({
        subType: undefined,
        comment: undefined
      });
    };
    const handleSelectedOtherSubType = (industrySubType: any) => {
      setSubIndustryType(industrySubType);
    };

    return (
      <div className={Styles["client-form-modal"]}>
        <Form form={form} onFieldsChange={onFieldsChange} onFinish={onFinish}>
          <Form.Item name={"registeredCompanyName"}>
            <TextInput
              type={"text"}
              label={"Registered company name"}
              required={true}
              message={"Registered Company Name is required!"}
              floatingLabel={true}
            />
          </Form.Item>
          <Form.Item name={"tradingName"}>
            <TextInput
              type={"text"}
              label={"Trading name"}
              required={true}
              message={"Trading Name is required!"}
              floatingLabel={true}
            />
          </Form.Item>
          <Form.Item name={"companyType"}>
            <Select
              label="Company type"
              // required={true}
              optionlist={companyTypes}
              style={{
                width: "100%"
              }}
            />
          </Form.Item>
          <Form.Item name={"companyNumber"}>
            <TextInput
              type={"text"}
              label={"Company number"}
              required={true}
              message={"Company Number is required!"}
              floatingLabel={true}
            />
          </Form.Item>
          <Form.Item name={"countryOfIncorporation"}>
            <Select
              label={"Country of incorporation"}
              optionlist={countriesList}
              // required={true}
              style={{
                width: "100%"
              }}
            />
          </Form.Item>

          <Form.Item name={"industryName"}>
            <Select
              label={"Industry"}
              // required={true}
              optionlist={IndustryOptionList}
              style={{
                width: "100%"
              }}
              onChange={handleSelectedIndustry}
            />
          </Form.Item>

          {selectedIndustryType !== "other" && (
            <Form.Item name={"subType"}>
              <Select
                label={"Industry sub-type"}
                mode={"multiple"}
                // required={true}
                optionlist={subIndustries}
                style={{
                  width: "100%"
                }}
                onChange={handleSelectedOtherSubType}
              />
            </Form.Item>
          )}
          {(selectedSubIndustryType.includes("other") ||
            selectedIndustryType === "other") && (
            <Form.Item name={"comment"}>
              <TextInput
                type={"text"}
                label={"If other please specify"}
                // required={true}
                placeholder="Ad network"
                message={"Other Industry is required!"}
                floatingLabel={true}
              />
            </Form.Item>
          )}
          <Form.Item
            name={"websiteAddress"}
            rules={[
              {
                pattern: new RegExp(
                  /^((https?|ftp|smtp):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/
                ),
                message: "Website address is invalid!"
              }
            ]}
          >
            <TextInput
              type={"text"}
              label={"Client website"}
              floatingLabel={true}
              placeholder={"www.client123.com"}
            />
          </Form.Item>
          <Text size="medium" weight="bold" label="Registered address " />
          <Spacer size={30} />
          <Row gutter={15}>
            <Col className="gutter-row" span={12}>
              <Form.Item name="floor">
                <TextInput type="text" label="Floor" floatingLabel={true} />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={12}>
              <Form.Item name="room">
                <TextInput
                  type="text"
                  label="Apartment"
                  placeholder={" "}
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
                  label="Building name"
                  placeholder={" "}
                  floatingLabel={true}
                  required={false}
                />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={12}>
              <Form.Item name="buildingNumber">
                <TextInput
                  type="text"
                  label="Building number"
                  placeholder={" "}
                  floatingLabel={true}
                  required={true}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={15}>
            <Col className="gutter-row" span={24}>
              <Form.Item name="street">
                <TextInput
                  type="text"
                  label="Street"
                  placeholder={" "}
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
                  label="City"
                  placeholder={" "}
                  floatingLabel={true}
                  required={true}
                />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={12}>
              <Form.Item name="postCode">
                <TextInput
                  type="text"
                  label="Postal Code"
                  placeholder={" "}
                  floatingLabel={true}
                  required={true}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={15}>
            <Col className="gutter-row" span={24}>
              <Form.Item name={"registerCountry"}>
                <Select
                  label={"Country"}
                  // required={true}
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
    );
  };

  return (
    <Modal
      modalView={show}
      title={title}
      onCancelText={onCancelText}
      onOkText={onOkText}
      btnLoading={isLoading}
      modalWidth={600}
      buttonOkDisabled={isLoading || isBtnEnabled}
      onClickCancel={() => {
        onClickCancel();
        form.resetFields();
        setBtnEnabled(true);
      }}
      onClickOk={() => {
        form.submit();
      }}
      // className={Styles["new-client-modal"]}
      description={
        <>
          <Spacer size={15} />
          {AddNewClientModal()}
        </>
      }
    />
  );
};

export { AddNewClient };
