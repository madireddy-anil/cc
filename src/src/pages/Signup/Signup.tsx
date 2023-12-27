import React, { useState } from "react";
import { Auth, Input, Notification } from "@payconstruct/design-system";
import { Navigate, useNavigate } from "react-router-dom";
import { useIntl } from "react-intl";
import { useAuth } from "../../redux/hooks/useAuth";
import {
  SignupRequest,
  useSignupMutation
} from "../../services/ControlCenter/ccService";
import { updateEmailAction } from "../../config/auth/authSlice";
import { useAppDispatch } from "../../redux/hooks/store";

const Signup: React.FC = () => {
  const { auth } = useAuth();
  const { Signup } = Auth;
  let navigate = useNavigate();
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const [hasAcceptedTerms, setAcceptedTerms] = useState(false);

  const [formState, setFormState] = useState<SignupRequest>({
    portal: "bms",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    emailSubscription: false,
    tAndCsAccepted: false,
    use_mfa: false
  });

  const [signup] = useSignupMutation();

  const handleChange = ({ target: { name, value } }: any) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const formFields = [
    <Input
      key="firstName"
      label="First Name"
      message={intl.formatMessage({ id: "emptyFieldErrorMsg" })}
      name="firstName"
      placeholder="Enter first name"
      required
      size="large"
      type="text"
      onChange={handleChange}
    />,
    <Input
      key="lastName"
      label="Last Name"
      message={intl.formatMessage({ id: "emptyFieldErrorMsg" })}
      name="lastName"
      placeholder="Enter last name"
      required
      size="large"
      type="text"
      onChange={handleChange}
    />,
    <Input
      key="emailAddress"
      label="Email Address"
      message={intl.formatMessage({ id: "emailErrorMsg" })}
      name="email"
      placeholder="Enter email"
      required
      size="large"
      type="text"
      onChange={handleChange}
    />,
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
    />
  ];

  const onClickLogin = () => {
    navigate("/signin");
  };

  const onChangeCheckboxHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAcceptedTerms(e.target.checked);
    setFormState({ ...formState, tAndCsAccepted: e.target.checked });
  };

  const onFinishHandler = async (e: any) => {
    if (!hasAcceptedTerms) {
      Notification({
        message: intl.formatMessage({
          id: "signupTermsAndConditionErrorTitle"
        }),
        description: intl.formatMessage({
          id: "signupTermsAndConditionErrorDescription"
        }),
        type: "error"
      });
      return;
    }
    try {
      dispatch(updateEmailAction(formState.email));
      await signup(formState).unwrap();
      navigate("/");
    } catch (err: any) {
      // TODO Add INTL For error message.
      const { data = { message: "One of the fields are invalid" } } = err;

      console.log(err);
      Notification({
        message: "Sign up Failed",
        description: data.message,
        type: "error"
      });
    }
  };

  if (auth.token) return <Navigate to={"/"} />;

  return (
    <Signup
      accountText={intl.formatMessage({ id: "signupAccountText" })}
      checkboxChecked={false}
      brand="pay_perform"
      btnLabel={intl.formatMessage({ id: "signupBtn" })}
      formFields={formFields}
      onClickLoginLink={onClickLogin}
      // onClickTermsAndConditionsLink={() => {
      //   alert("Work in Progress");
      // }}
      // termsAndConditionLink={intl.formatMessage({
      //   id: "signupTermsAndConditionLink"
      // })}
      // termsAndConditionText={intl.formatMessage({
      //   id: "signupTermsAndConditionText"
      // })}
      onChangeCheckbox={onChangeCheckboxHandler}
      onFinish={onFinishHandler}
      subTitle={intl.formatMessage({ id: "signupSubTitle" })}
      title={intl.formatMessage({ id: "signupTitle" })}
    />
  );
};

export default Signup;
