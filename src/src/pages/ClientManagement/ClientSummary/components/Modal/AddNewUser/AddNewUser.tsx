import React, { useEffect, useState } from "react";
import {
  Form,
  Modal,
  Text,
  Radio,
  TextInput,
  Select,
  // Checkbox,
  RadioGroup,
  SwitchName,
  Notification
} from "@payconstruct/design-system";
import { Spacer } from "../../../../../../components";
import { useAppSelector } from "../../../../../../redux/hooks/store";
import {
  useAddNewUserMutation,
  useAddShareholderMutation,
  useGetRolesQuery,
  Roles
} from "../../../../../../services/clientManagement";
import {
  rolePosition,
  yesNoOptions
} from "../../../../ClientSummary/ClientSummaryForm";
import { selectEntityId } from "../../../../../../config/ClientMangement/ClientManagementSlice";
import { capitalizeString } from "../../../../../../utilities/transformers";
import { sortData } from "../../../../../../config/transformer";
import Styles from "../../../clientSummary.module.css";

interface BasicCompanyInfoModalProps {
  show: boolean;
  title: string;
  toggleShow: (value: boolean) => void;
  onClickCancel: () => void;
  onClickOk: (data?: any) => void;
  refetchGetClients: () => void;
}

enum UserTypes {
  PlatformUser = "platform_user",
  keyUser = "key_person"
}

const AddNewUser: React.FC<BasicCompanyInfoModalProps> = ({
  show,
  title,
  toggleShow,
  onClickCancel,
  refetchGetClients
}) => {
  const onlyLettersRegex = new RegExp(/^(?! )[A-Za-z\s]+$/);
  const [form] = Form.useForm();
  const { countries } = useAppSelector((state) => state.countries);
  const entityId = useAppSelector(selectEntityId);
  const [isBtnEnabled, setBtnEnabled] = useState<boolean>(true);
  const [newUserType, setNewUserType] = useState<string>(
    UserTypes.PlatformUser
  );

  const [addNewUser, { isLoading: addNewUserLoading }] =
    useAddNewUserMutation();
  const [addShareholder, { isLoading: addShareholderLoading }] =
    useAddShareholderMutation();

  useEffect(() => {
    setBtnEnabled(true);
  }, []);

  const { roles } = useGetRolesQuery("GET_ROLES", {
    refetchOnMountOrArgChange: true,
    selectFromResult: ({ data }) => ({
      roles: data?.data?.role
        ? data.data.role
            ?.slice()
            ?.sort(sortData)
            ?.filter((role: Roles) => !role.isInternal)
        : []
    })
  });

  const AddNewClientModal = () => {
    const onFinish = async (formValues: {
      firstName: string;
      lastName: string;
      email: string;
      role: string;
      roleId: string;
      entityId?: string;
      phoneNumber: string;
      phoneNumberCountryCode: string;
      isIdvScreeningRequired: string;
      isAuthorisedToAcceptTerms: string;
      percentageOfShares: string;
      isInviteRequired: boolean;
    }) => {
      formValues.entityId = entityId;
      const selectedCountry = countries?.find(
        (country: any) => country?.name === formValues?.phoneNumberCountryCode
      );
      formValues.phoneNumberCountryCode = selectedCountry?.telephonePrefix
        ? selectedCountry?.telephonePrefix
        : "+44";
      if (newUserType === UserTypes.keyUser) {
        formValues.isInviteRequired = false;
      }
      const addUser =
        newUserType === UserTypes.PlatformUser
          ? addNewUser(formValues)
          : addShareholder(formValues);
      try {
        await addUser.unwrap().then(() => {
          Notification({
            message: "",
            description: `Record has been created successfully!`,
            type: "success"
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
        // "role",
        "phoneNumber",
        "phoneNumberCountryCode",
        "isInviteRequired",
        "isIdvScreeningRequired",
        "isAuthorisedToAcceptTerms",
        "percentageOfShares",
        newUserType === UserTypes.keyUser ? "email" : ""
      ];
      const filterMandatoryFields = formFields.filter(
        (item: { name: string }) =>
          !nonMandatoryFields.includes(item?.name?.[0])
      );
      filterMandatoryFields.forEach((item: { value: string }) => {
        item?.value ? isInputTouched.push(true) : isInputTouched.push(false);
      });
      return isInputTouched.includes(false)
        ? setBtnEnabled(true)
        : setBtnEnabled(false);
    };

    const onChangeUserType = (user: any) => {
      const { userType } = user;
      setNewUserType(userType);
      form.resetFields();
    };

    const roleTypeOptions: any = roles?.map((option: Roles) => {
      return [option.id, capitalizeString(option.name)];
    });

    const radioOptions: any = yesNoOptions.map(
      (option: { label: string; value: boolean }) => {
        return <Radio value={option.value}>{option.label}</Radio>;
      }
    );

    const phoneTypeOptions = countries.map(
      (option: { name: string; telephonePrefix: string }) => {
        return {
          value: `+${option.name}`,
          label: `+${option.telephonePrefix} ${option.name}`
        };
      }
    );

    const PhoneTypeSelect = (
      <Form.Item name={"phoneNumberCountryCode"} noStyle>
        <Select
          defaultValue={<span>{"+44"}</span>}
          options={phoneTypeOptions}
          optionFilterProp="children"
          filterOption={(input: any, option: any | undefined) =>
            option?.value?.toLowerCase()?.indexOf(input?.toLowerCase()) >= 0 ||
            option?.label?.indexOf(input) >= 0
          }
          dropdownStyle={{ minWidth: "10%" }}
        />
      </Form.Item>
    );

    const PLATFORM_USER_FORM_ITEMS = (
      <>
        <Form.Item
          name={"firstName"}
          rules={[
            {
              pattern: onlyLettersRegex,
              message: "This field must conatin letters only"
            }
          ]}
        >
          <TextInput
            type={"text"}
            label={"Name"}
            message={"Name is required!"}
            required={true}
            floatingLabel={true}
          />
        </Form.Item>
        <Form.Item
          name={"lastName"}
          rules={[
            {
              pattern: onlyLettersRegex,
              message: "This field must conatin letters only"
            }
          ]}
        >
          <TextInput
            type={"text"}
            label={"Surname"}
            required={true}
            message={"Surname is required!"}
            floatingLabel={true}
          />
        </Form.Item>
        <Form.Item
          name={"email"}
          rules={[
            {
              type: "email",
              message:
                "This field must contain letters, symbols and numbers only"
            }
          ]}
        >
          <TextInput
            type={"email"}
            label={"Email"}
            required={true}
            floatingLabel={true}
          />
        </Form.Item>

        <Form.Item
          name={"roleId"}
          rules={[
            {
              required: true,
              message: <Text label="Role is required!" size="xxsmall" />
            }
          ]}
        >
          <Select
            label={"Role"}
            placeholder={"Select role"}
            style={{ marginBottom: "-30px" }}
            optionlist={roleTypeOptions}
          />
        </Form.Item>
      </>
    );

    const SHAREHOLDER_USER_FORM_ITEMS = (
      <>
        <Form.Item
          name={"firstName"}
          rules={[
            {
              pattern: onlyLettersRegex,
              message: "This field must conatin letters only"
            }
          ]}
        >
          <TextInput
            type={"text"}
            label={"Name"}
            message={"Name is required!"}
            required={true}
            floatingLabel={true}
          />
        </Form.Item>
        <Form.Item
          name={"lastName"}
          rules={[
            {
              pattern: onlyLettersRegex,
              message: "This field must conatin letters only"
            }
          ]}
        >
          <TextInput
            type={"text"}
            label={"Surname"}
            required={true}
            message={"Surname is required!"}
            floatingLabel={true}
          />
        </Form.Item>
        <Form.Item
          name={"email"}
          rules={[
            {
              type: "email",
              message:
                "This field must contain letters, symbols and numbers only"
            }
          ]}
        >
          <TextInput type={"email"} label={"Email"} floatingLabel={true} />
        </Form.Item>
        <Form.Item name={"role"}>
          <Select
            label={"Position in the organisation"}
            style={{ marginBottom: "-30px" }}
            mode="multiple"
            optionlist={rolePosition}
          />
        </Form.Item>
        <Form.Item
          name={"phoneNumber"}
          rules={[
            {
              pattern: new RegExp(/^[0-9\b]+$/),
              message: "This field must conatin numbers only"
            }
          ]}
        >
          <TextInput
            type={"text"}
            label={"Phone number"}
            message={"Phone Number is required!"}
            style={{ width: "264px" }}
            floatingLabel={true}
            addonBefore={PhoneTypeSelect}
          />
        </Form.Item>
        <Text weight="bold" size="medium" label="Is IDV screening required?" />
        <Spacer size={15} />
        <Form.Item name={"isIdvScreeningRequired"}>
          <RadioGroup direction="vertical" value={2}>
            {radioOptions}
          </RadioGroup>
        </Form.Item>
        <Text
          weight="bold"
          size="medium"
          label="Is this person authorised to accept terms?"
        />{" "}
        <Spacer size={15} />
        <Form.Item name={"isAuthorisedToAcceptTerms"}>
          <RadioGroup direction="vertical" value={2}>
            {radioOptions}
          </RadioGroup>
        </Form.Item>
        <Text
          weight="bold"
          size="medium"
          label="What is their percentage of shares?"
        />{" "}
        <Spacer size={15} />
        <Form.Item
          name={"percentageOfShares"}
          rules={[
            {
              pattern: new RegExp(/^[1-9][\.\d]*(,\d+)?$/),
              message: "This field must conatin numbers only"
            }
          ]}
        >
          <TextInput
            type={"text"}
            label={" "}
            message={"Share percenatge is required!"}
            style={{ width: "106px" }}
            floatingLabel={true}
            suffix={"%"}
          />
        </Form.Item>
        {/* <Form.Item name={"isInviteRequired"} valuePropName="checked">
          <Checkbox label="Send an email notification to the user for IDV screening." />
        </Form.Item> */}
      </>
    );

    return (
      <div className={Styles["client-form-modal"]}>
        <SwitchName
          name="userType"
          onChange={onChangeUserType}
          options={[
            {
              label: "Platform User",
              value: UserTypes.PlatformUser
            },
            {
              label: "Key Person",
              value: UserTypes.keyUser
            }
          ]}
          selectedOption={0}
        />
        <Spacer size={30} />
        <div className={Styles["client-form-modal"]}>
          <Form form={form} onFieldsChange={onFieldsChange} onFinish={onFinish}>
            {newUserType === UserTypes.PlatformUser
              ? PLATFORM_USER_FORM_ITEMS
              : SHAREHOLDER_USER_FORM_ITEMS}
          </Form>
        </div>
      </div>
    );
  };

  return (
    <Modal
      modalView={show}
      title={title}
      onCancelText="Cancel"
      onOkText={
        newUserType === UserTypes.PlatformUser ? "Add User" : "Add Key Person"
      }
      btnLoading={addNewUserLoading || addShareholderLoading}
      //   modalWidth={600}
      buttonOkDisabled={isBtnEnabled}
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

export { AddNewUser };
