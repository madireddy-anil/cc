import React, { useEffect, useState } from "react";
import {
  Form,
  Modal,
  Text,
  Select,
  Notification
} from "@payconstruct/design-system";
import { Spacer } from "../../../../../../components";
import { useAppSelector } from "../../../../../../redux/hooks/store";
import {
  useGetRolesQuery,
  Roles,
  useUpdateUserRoleMutation
} from "../../../../../../services/clientManagement";
import { selectEntityId } from "../../../../../../config/ClientMangement/ClientManagementSlice";
import { sortData } from "../../../../../../config/transformer";
import Styles from "../../../clientSummary.module.css";
import { capitalizeString } from "../../../../../../utilities/transformers";
import { UserData } from "../../Card/Drawer/Drawer";

interface BasicCompanyInfoModalProps {
  show: boolean;
  user?: UserData;
  toggleShow: (value: boolean) => void;
  refetchLinkedUsers: () => void;
}

const UpdateUserRole: React.FC<BasicCompanyInfoModalProps> = ({
  show,
  user,
  toggleShow,
  refetchLinkedUsers
}) => {
  const [form] = Form.useForm();
  const entityId = useAppSelector(selectEntityId);
  const [isBtnEnabled, setBtnEnabled] = useState<boolean>(true);

  const email = user?.data[1]?.value;
  const role = user?.data[2]?.value;

  const [updateUserRole, { isLoading: updatingUseRoleLoading }] =
    useUpdateUserRoleMutation();

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

  const UpdateUserModel = () => {
    const onFinish = async (formValues: { roleId: string }) => {
      const updateUser = updateUserRole({
        entityId: entityId,
        userId: user?.id,
        data: formValues
      });

      try {
        await updateUser.unwrap().then(() => {
          Notification({
            message: "",
            description: `Role has been updated successfully!`,
            type: "success"
          });
          refetchLinkedUsers();
          toggleShow(false);
          form?.resetFields();
        });
      } catch (err: any) {
        Notification({
          message: "",
          description:
            "We apologies for the inconvenience. Please get in touch with technology team.",
          type: "error"
        });
        console.log("Error: ", err);
      }
    };

    const roleTypeOptions: any = roles
      ?.filter((option) => option.name !== role)
      .map((option: Roles) => {
        return [option.id, capitalizeString(option.name)];
      });

    const PLATFORM_USER_FORM_ITEMS = (
      <>
        <Form.Item
          name={"roleId"}
          rules={[
            {
              required: true,
              message: <Text size="xxsmall">Role is required!</Text>
            }
          ]}
        >
          <Select
            label={"Role Name"}
            placeholder={"Select role"}
            style={{ marginBottom: "-30px" }}
            onChange={(v) => (v ? setBtnEnabled(false) : setBtnEnabled(true))}
            optionlist={roleTypeOptions}
          />
        </Form.Item>
      </>
    );

    return (
      <div className={Styles["client-form-modal"]}>
        <Spacer size={30} />
        <div className={Styles["client-form-modal"]}>
          <Form form={form} onFinish={onFinish}>
            {PLATFORM_USER_FORM_ITEMS}
          </Form>
        </div>
      </div>
    );
  };

  return (
    <Modal
      modalView={show}
      title={`Edit user role of ${email}`}
      onCancelText="Cancel"
      onOkText={"Update Role"}
      btnLoading={updatingUseRoleLoading}
      buttonOkDisabled={isBtnEnabled}
      onClickCancel={() => {
        toggleShow(false);
        form.resetFields();
        setBtnEnabled(true);
      }}
      onClickOk={() => {
        form.submit();
      }}
      description={UpdateUserModel()}
    />
  );
};

export { UpdateUserRole };
