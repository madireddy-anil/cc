import React from "react";
// import { Auth, Input, Notification } from "@payconstruct/design-system";
// import { Redirect } from "react-router-dom";
// import { useIntl } from "react-intl";
// import { useAuth, useRemember } from "../../redux/hooks/useAuth";
// import { useAppDispatch, useAppSelector } from "../../redux/hooks/store";

// import {
//   updateEmailAction,
//   showMFAModalAction,
//   setRememberMeAction
// } from "../../config/auth/authSlice";

// import {
//   LoginRequest,
//   useLoginMutation,
//   useGetProfileQuery,
//   useSetupTwoFAMutation
// } from "../../services/ControlCenter/ccService";
// import { useGetCountriesQuery } from "../../services/bmsService";
// import { useGetCurrenciesQuery } from "../../services/currencies";
// import { ResetPassword } from "../../components/Modals/ResetPassword/ResetPassword";
// import { SetupTwoFactorAuth } from "../../components/Modals/SetupTwoFactorAuth/SetupTwoFactorAuth";
// import { TwoFactorAuth } from "../../components/Modals/TwoFactorAuth/TwoFactorAuth";
// import { useGetAllClientsQuery } from "../../services/clientManagement";
// import {
//   emailUpdateAction,
//   rememberMeUpdateAction
// } from "../../config/auth/rememberMeSlice";
// import { useGetAllCompaniesQuery } from "../../services/ControlCenter/endpoints/companiesEndpoint";

// const Login: React.FC = (props) => {
//   const intl = useIntl();
//   const { Login } = Auth;
//   const { auth } = useAuth();
//   const { remember } = useRemember();

//   // Get from State
//   const { token, portal } = useAppSelector((state) => state.auth);
//   const { email, rememberMe } = useAppSelector((state) => state.remember);
//   // use our own Dispatch hook to get correct Typescript typings
//   const dispatch = useAppDispatch();
//   // let history = useHistory();

//   const { mfa_required, mfa_token, showMFAModal, showSetupMFAModal } =
//     useAppSelector((state) => state.auth);

//   const [showPasswordModal, setShowPasswordModal] = useState(false);

//   const initialValues = {
//     email: email,
//     rememberMe: rememberMe
//   } as { [key: string]: any };
//   const [formState, setFormState] = useState<LoginRequest>({
//     portal,
//     email: remember.email,
//     password: "",
//     remember: remember.rememberMe
//   });

//   const onFieldsChange = (item: any) => {
//     setFormState((prev) => ({ ...prev, [item[0].name[0]]: item[0].value }));
//   };

//   // Access Mutations - Redux Tool Kit API requester to mutate state on API request
//   const [login, { isLoading }] = useLoginMutation();

//   const generateRandomName = Math.random()
//     .toString(36)
//     .replace(/[^a-z]+/g, "")
//     .substr(0, 5);

//   const [randomName] = useState(generateRandomName);

//   // Same for Countries
//   useGetCountriesQuery(randomName, {
//     refetchOnMountOrArgChange: true,
//     skip: token === null
//   });

//   // Get All Currencies
//   useGetCurrenciesQuery(randomName, {
//     refetchOnMountOrArgChange: true,
//     skip: token === null
//   });

//   // Get All Clients
//   useGetAllClientsQuery(randomName, {
//     refetchOnMountOrArgChange: true,
//     skip: token === null
//   });

//   // Get All Companies
//   useGetAllCompaniesQuery(randomName, {
//     refetchOnMountOrArgChange: true,
//     skip: token === null
//   });

//   const [setup2FA] = useSetupTwoFAMutation();

//   useEffect(() => {
//     if (mfa_required && mfa_token) {
//       setup2FA({
//         authenticator_types: ["otp"],
//         mfa_token: mfa_token
//       }).unwrap();
//     }
//     // if (profileLoader) {
//     //   dispatch(updateProfileLoader(profileLoader));
//     // }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [mfa_required, mfa_token, setup2FA]);

//   useGetProfileQuery(token, {
//     skip: token === null,
//     refetchOnMountOrArgChange: 15
//   });
//   const formFields = [
//     <Input
//       key="email"
//       label={intl.formatMessage({ id: "email" })}
//       message={intl.formatMessage({ id: "emailErrorMsg" })}
//       name="email"
//       placeholder="Enter email"
//       required
//       size="large"
//       type="email"
//     />,
//     <Input
//       key="password"
//       label={intl.formatMessage({ id: "password" })}
//       message={intl.formatMessage({ id: "passwordErrorMsg" })}
//       name="password"
//       placeholder="Enter password"
//       required
//       size="large"
//       type="password"
//     />
//   ];

//   const onClickSignup = () => {
//     Notification({
//       message: "Disabled",
//       description: "Ask an administrator to create an account for you",
//       type: "error"
//     });
//   };

//   const onClickForgotPassword = () => {
//     setShowPasswordModal(true);
//     console.log("onClickForgotPassword", showPasswordModal);
//   };

//   const onClickLogin = async () => {
//     try {
//       dispatch(updateEmailAction(formState.email));
//       if (rememberMe && formState.email) {
//         dispatch(emailUpdateAction(formState.email));
//       } else {
//         dispatch(emailUpdateAction(""));
//       }
//       if (formState.email && formState.password) {
//         await login(formState).unwrap();
//       }
//     } catch (err) {
//       dispatch(showMFAModalAction(false));
//       Notification({
//         message: intl.formatMessage({ id: "loginError" }),
//         description: intl.formatMessage({ id: "LoginErrorDescription" }),
//         type: "error"
//       });
//     }
//   };

//   const onChangeCheckbox = ({
//     target
//   }: React.ChangeEvent<HTMLInputElement>) => {
//     dispatch(setRememberMeAction(target.checked));
//     dispatch(rememberMeUpdateAction(target.checked));
//   };

//   if (auth.token) return <Redirect to={"/"} />;
//   return (
//     <>
//       <Login
//         title={intl.formatMessage({ id: "loginTitle" })}
//         subTitle={intl.formatMessage({ id: "loginSubtitle" })}
//         initialValues={initialValues}
//         accountText={intl.formatMessage({ id: "signupText" })}
//         btnLabel={intl.formatMessage({ id: "loginButton" })}
//         formFields={formFields}
//         checkboxChecked={rememberMe}
//         onChangeCheckbox={onChangeCheckbox}
//         onClickLoginLink={onClickLogin}
//         onClickSignupLink={onClickSignup}
//         onClickForgotPasswordLink={onClickForgotPassword}
//         onFieldsChange={onFieldsChange}
//         btnLoading={isLoading}
//       />
//       <ResetPassword
//         show={showPasswordModal}
//         toggleShow={setShowPasswordModal}
//       />
//       <TwoFactorAuth show={showMFAModal} />
//       <SetupTwoFactorAuth verificationStage="login" show={showSetupMFAModal} />
//     </>
//   );
// };

// export default Login;
