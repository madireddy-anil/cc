import React, { useState } from "react";
import { Auth, Input, Notification } from "@payconstruct/design-system";
import { useNavigate } from "react-router-dom";
import { useIntl } from "react-intl";
import {
  ChangePasswordRequest,
  useChangePasswordMutation
} from "../../services/ControlCenter/ccService";

const ResetPassword: React.FC = () => {
  const { ResetPassword } = Auth;
  let navigate = useNavigate();
  const intl = useIntl();

  const [formState, setFormState] = useState<ChangePasswordRequest>({
    password: "",
    newPassword: ""
  });

  const [changePassword] = useChangePasswordMutation();

  const handleChange = ({ target: { name, value } }: any) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (code: string) => {
    try {
      await changePassword(formState).unwrap();
      navigate("/");
    } catch (err) {
      Notification({
        message: intl.formatMessage({ id: "mfaError" }),
        description: intl.formatMessage({ id: "mfaErrorDescription" }),
        type: "error"
      });

      console.log("Failed to change password:", err);
    }
  };

  const formFields = [
    <Input
      key="password"
      label={intl.formatMessage({ id: "password" })}
      message={intl.formatMessage({ id: "passwordErrorMsg" })}
      name="password"
      placeholder="Enter password"
      required
      size="large"
      type="password"
      onChange={handleChange}
    />,
    <Input
      key="newPassword"
      label={intl.formatMessage({ id: "newPassword" })}
      message={intl.formatMessage({ id: "passwordErrorMsg" })}
      name="newPassword"
      placeholder="Enter Password"
      required
      size="large"
      type="password"
      onChange={handleChange}
    />
  ];

  return (
    <ResetPassword
      accountText={intl.formatMessage({ id: "resetPasswordAccountText" })}
      brand="pay_perform"
      btnLabel={intl.formatMessage({ id: "createPassword" })}
      formFields={formFields}
      onClickLoginLink={() => {
        navigate("/login");
      }}
      onFinish={onSubmit}
      subTitle={intl.formatMessage({ id: "resetPasswordSubtitle" })}
      title={intl.formatMessage({ id: "resetPasswordTitle" })}
    />
  );
};

export default ResetPassword;
