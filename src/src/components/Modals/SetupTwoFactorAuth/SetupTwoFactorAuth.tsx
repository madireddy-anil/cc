import React from "react";
import { TwoFaSetup, Notification } from "@payconstruct/design-system";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks/store";
import { useIntl } from "react-intl";
import {
  useTwoFactorAuthenticationMutation,
  useVerifyMFACodeMutation
} from "../../../services/ControlCenter/ccService";
import { showSetupMFAModalAction } from "../../../config/auth/authSlice";
import { useAuth } from "../../../redux/hooks/useAuth";

interface TwoFactorAuthProps {
  show: boolean;
  verificationStage: string;
}

export const SetupTwoFactorAuth: React.FC<TwoFactorAuthProps> = ({
  show,
  verificationStage
}) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { auth } = useAuth();

  const { email, barcodeUri } = useAppSelector((state) => state.auth);

  const [settingsTwoFactorAuth, { isLoading: settingsOTPLoading }] =
    useVerifyMFACodeMutation();
  const [loginTwoFactorAuth, { isLoading: loginOTPLoading }] =
    useTwoFactorAuthenticationMutation();

  const onSubmit = async (code: string) => {
    try {
      (await verificationStage) === "login"
        ? loginTwoFactorAuth({
            mfa_token: auth.mfa_token,
            email,
            code
          }).unwrap()
        : settingsTwoFactorAuth({
            refreshToken: auth.refresh_token,
            otp: code
          }).unwrap();
    } catch (err) {
      Notification({
        message: intl.formatMessage({ id: "mfaError" }),
        description: intl.formatMessage({ id: "mfaErrorDescription" }),
        type: "error"
      });
    }
  };

  const modalShowCancel = (e: any) => {
    dispatch(showSetupMFAModalAction(false));
  };

  return (
    <TwoFaSetup
      key="2FA"
      title={intl.formatMessage({ id: "mfaModalTitle" })}
      token={barcodeUri}
      setupDescription={intl.formatMessage({ id: "setupMfaSubDescription" })}
      description={intl.formatMessage({ id: "setupMfaDescription" })}
      onTryAgainLater={() => {
        console.log("Try Again click");
      }}
      btnLoading={loginOTPLoading || settingsOTPLoading}
      show={show}
      modalShowCancel={modalShowCancel}
      onSubmit={onSubmit}
    />
  );
};
