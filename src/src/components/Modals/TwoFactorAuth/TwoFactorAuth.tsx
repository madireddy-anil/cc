import React from "react";
import { TwoFA, Notification } from "@payconstruct/design-system";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks/store";
import { useIntl } from "react-intl";
import { useTwoFactorAuthenticationMutation } from "../../../services/ControlCenter/ccService";
import { showMFAModalAction } from "../../../config/auth/authSlice";
import { useAuth } from "../../../redux/hooks/useAuth";

interface TwoFactorAuthProps {
  show: boolean;
}

export const TwoFactorAuth: React.FC<TwoFactorAuthProps> = ({ show }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { auth } = useAuth();

  const { email } = useAppSelector((state) => state.auth);

  const [twoFactorAuth, { isLoading }] = useTwoFactorAuthenticationMutation();

  const onSubmit = async (code: string) => {
    try {
      await twoFactorAuth({
        mfa_token: auth.mfa_token,
        email,
        code
      }).unwrap();
      dispatch(showMFAModalAction(false));
    } catch (err) {
      Notification({
        message: intl.formatMessage({ id: "mfaError" }),
        description: intl.formatMessage({ id: "mfaErrorDescription" }),
        type: "error"
      });
      dispatch(showMFAModalAction(false));
    }
  };

  const modalShowCancel = () => {
    dispatch(showMFAModalAction(false));
  };

  return (
    <TwoFA
      key="2FA"
      title={intl.formatMessage({ id: "mfaModalTitle" })}
      description={intl.formatMessage({ id: "mfaModalDescription" })}
      onTryAgainLater={() => {
        console.log("Try Again click");
      }}
      show={show}
      onSubmit={onSubmit}
      modalShowCancel={modalShowCancel}
      btnLoading={isLoading}
    />
  );
};
