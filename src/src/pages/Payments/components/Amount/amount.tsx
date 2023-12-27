import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  Form,
  Input,
  NumberInput,
  Select,
  Text,
  List,
  Colors,
  Spin,
  Tooltip,
  Icon
} from "@payconstruct/design-system";
import moment from "moment";
import { Row, Col, message } from "antd";
import { useGetPaymentDetailsQuery } from "../../../../services/paymentService";
// import { selectEntityId } from "../../../../config/auth/authSlice";
import {
  Header,
  HeaderContent
} from "../../../../components/PageHeader/Header";
import { Spacer } from "../../../../components/Spacer/Spacer";
import { useAppDispatch, useAppSelector } from "../../../../redux/hooks/store";
import { Card } from "../../../Components/Card/Card";
import { selectClient } from "../../../Components/ClientSelection/ClientSelectionSlice";
import {
  updatePaymentRemarks,
  updateSendAmount,
  showModalAction,
  selectPaymentRemarks
} from "../../../Components/DepositAmount/DepositAmountSlice";
import { updatePaymentDetails } from "../../PaymentSlice";
import { useDebounce } from "../../../../customHooks/useDebounce";
import { fractionFormat } from "../../../../utilities/transformers";
import style from "./amount.module.css";
interface IAmountProps {
  ConfirmModal?: React.FunctionComponent<any>;
  confirmBtnLabel?: string;
  nextStepHandler?: () => void;
  previousStepHandler: () => void;
}

const { Title } = HeaderContent;

const Amount: React.FC<IAmountProps> = (props) => {
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();

  // const entityId = useAppSelector(selectEntityId);
  const selectedClient = useAppSelector(selectClient);
  const paymentDetails = useAppSelector(
    (state) => state.payment.paymentDetails
  );
  const sendAmount = useAppSelector((state) => state.depositAmount.sendAmount);
  const paymentRemarks = useAppSelector(selectPaymentRemarks);
  const showModal = useAppSelector((state) => state.depositAmount.showModal);
  const selectedAccountId = useAppSelector(
    (state) => state.selectAccount.selectedAccount?.id
  );
  const sendCurrency = useAppSelector(
    (state) => state.selectAccount.selectedAccount?.currency
  );
  const selectedInternalAccount = useAppSelector(
    (state) => state.beneficiary.selectedInternalAccount
  );
  const selectedBeneficiary = useAppSelector(
    (state) => state.beneficiary.selectedBeneficiary
  );
  const settlementType = useAppSelector(
    (state) => state.beneficiary.settlementType
  );
  const { selectedAccount }: any = useAppSelector(
    (state) => state.selectAccount
  );

  const beneficiary =
    settlementType === "internal"
      ? selectedInternalAccount
      : selectedBeneficiary;

  const { ConfirmModal, confirmBtnLabel, previousStepHandler } = props;

  const [formValues, setFormValues] = useState({
    entityId: selectedClient?.id,
    accountId: selectedAccountId,
    currencyPair: `${sendCurrency}.${beneficiary.currency}`,
    direction: "outbound",
    type: settlementType,
    priority: "normal",
    amount: sendAmount,
    creditorAccountId:
      settlementType === "internal" ? beneficiary.id : undefined,
    beneficiaryId: settlementType !== "internal" ? beneficiary.id : undefined
  } as { entityId?: string; accountId?: string; currencyPair?: string; direction?: string; type?: string; priority?: string; amount?: number });

  const [triggerIntervalFn, setTriggerIntervalFn] = useState<any>(null);

  const [sellAmt, setSellAmt] = useState(0);

  const [payDetailsError, setPayDetailsError] = useState("");

  useDebounce(
    () => {
      setFormValues((state) => ({ ...state, amount: sendAmount }));
      setPayDetailsError("");
      refetch();
    },
    2000,
    [sendAmount]
  );

  const {
    refetch,
    payDetails,
    error,
    isLoading,
    isFetching: isFetchingFees,
    isError: isErrorFees,
    isSuccess: isPaymentDetailsFetchSuccess
  } = useGetPaymentDetailsQuery(formValues, {
    selectFromResult: ({
      data,
      error,
      isLoading,
      isFetching,
      isError,
      isSuccess
    }) => {
      return {
        isLoading,
        isFetching,
        isError,
        isSuccess,
        payDetails: { ...data?.data },
        error: JSON.stringify(error)
      };
    },
    skip:
      formValues.amount === null ||
      formValues.amount === 0 ||
      formValues.amount === undefined ||
      formValues.amount > selectedAccount?.balance?.availableBalance ||
      payDetailsError !== "" ||
      showModal
  });

  const getPaymentInfoByOnBlurAndTimeInterval = useCallback(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (isErrorFees) {
      const parsedError = error && JSON.parse(error);
      setPayDetailsError(parsedError?.data?.data?.title);
    }
  }, [isErrorFees]);

  useEffect(() => {
    if (isPaymentDetailsFetchSuccess) {
      setPayDetailsError("");
    }
  }, [isPaymentDetailsFetchSuccess]);

  useEffect(() => {
    // get payment data for every 60 sec
    const intervalTrgger = setInterval(
      getPaymentInfoByOnBlurAndTimeInterval,
      60000
    );
    setTriggerIntervalFn(intervalTrgger);
    return clearInterval(triggerIntervalFn);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //Update Form
  useEffect(() => {
    //Error on API
    if (isErrorFees) {
      form.setFieldsValue({
        sellAmount: `0`
      });
      return;
    }

    setSellAmt(paymentDetails?.creditAmount ? paymentDetails?.creditAmount : 0);

    //Default set form values
    form.setFieldsValue({
      sellAmount: `${
        paymentDetails?.creditAmount ? paymentDetails?.creditAmount : 0
      }`,
      remarks: `${paymentRemarks ? paymentRemarks : ""}`
    });
  }, [
    formValues.amount,
    isErrorFees,
    form,
    paymentDetails?.creditAmount,
    paymentRemarks
  ]);

  useEffect(() => {
    // Update error msg when credit amount zero or less.
    if (parseFloat(payDetails?.creditAmount) <= 0) {
      setPayDetailsError("Amount transferred must be greater than zero");
    }
  }, [paymentDetails?.creditAmount]);

  //Update paydetails
  useEffect(() => {
    if (
      Object.entries(payDetails).length > 0 &&
      paymentDetails?.creditAmount !== payDetails?.creditAmount
    ) {
      dispatch(updatePaymentDetails(payDetails));
    }
  }, [dispatch, paymentDetails?.creditAmount, payDetails]);

  const getQuoteAnnotation = () => {
    if (isErrorFees)
      return `Rate for the pair ${sendCurrency}.${beneficiary?.currency} is not available`;
    return `1 ${sendCurrency} equals ${paymentDetails?.fxInfo?.allInRate} ${
      beneficiary?.currency
    } @ ${moment(paymentDetails?.fxInfo?.createdAt).format(
      "DD/MM/YYYY hh:mm:ss"
    )}`;
  };

  const onConfirmNewPayment = () => {
    dispatch(showModalAction(true));
  };

  const onFinishFailed = () => {
    message.error("Special characters are not allowed in Remarks");
  };

  return (
    <div className={style["amount-page"]}>
      <Header>
        <Title>Amount</Title>
      </Header>
      <Form
        form={form}
        initialValues={{
          amount: sendAmount,
          sellAmount: `${
            paymentDetails?.creditAmount
              ? paymentDetails?.creditAmount
              : undefined
          }`,
          remarks: paymentRemarks
        }}
        onFinish={onConfirmNewPayment}
        onFinishFailed={onFinishFailed}
      >
        <Row gutter={15}>
          <Col className="gutter-row" span={12}>
            <Card>
              <Text label="You Send" weight="bold" />
              <Spacer size={15}></Spacer>
              <Row gutter={15}>
                <Col className="gutter-row" span={6}>
                  <Select
                    disabled={true}
                    label="Currency"
                    defaultValue={sendCurrency}
                    optionlist={[[sendCurrency, sendCurrency]]}
                    placeholder="Select Options"
                  />
                </Col>
                <Col
                  className={`${style["send_amount-field"]} gutter-row`}
                  span={18}
                >
                  <Form.Item
                    name="amount"
                    required={true}
                    getValueFromEvent={(value) => {
                      dispatch(updateSendAmount(value));
                    }}
                  >
                    <NumberInput
                      label="Amount *"
                      type="number"
                      min={0}
                      required
                    />
                  </Form.Item>
                  {isFetchingFees && (
                    <Spin loading={isFetchingFees} size={10} />
                  )}
                  {payDetailsError !== "" ? (
                    <small style={{ color: "red", fontWeight: "bold" }}>
                      {payDetailsError}
                    </small>
                  ) : (
                    <>
                      {formValues.amount &&
                        formValues.amount >
                          selectedAccount?.balance?.availableBalance && (
                          <>
                            <small style={{ color: "red", fontWeight: "bold" }}>
                              Available balance exceeded. Please enter a lower
                              amount.
                            </small>
                            <small style={{ color: "#9599a8" }}>
                              {" "}
                              (Available balance:{" "}
                              {fractionFormat(
                                selectedAccount?.balance?.availableBalance
                              )}
                              )
                            </small>
                          </>
                        )}
                    </>
                  )}
                </Col>
              </Row>
              <Text label="Beneficiary will receive" weight="bold" />
              <Spacer size={15}></Spacer>
              <Row gutter={15}>
                <Col className="gutter-row" span={6}>
                  <Select
                    disabled={true}
                    label="Currency"
                    defaultValue={beneficiary?.currency}
                    optionlist={[[sendCurrency, sendCurrency]]}
                    placeholder="Select Options"
                  />
                </Col>
                <Col className="gutter-row" span={18}>
                  <Form.Item name="sellAmount" required={true}>
                    <NumberInput
                      disabled
                      label={"Sell Amount"}
                      type="number"
                      min={0}
                    />
                  </Form.Item>
                </Col>
                <div className="newPayment" style={{ width: "100%" }}>
                  {sendCurrency !== beneficiary?.currency &&
                    paymentDetails?.fxInfo?.allInRate && (
                      <div
                        style={{
                          background: Colors.grey.neutral50,
                          borderRadius: "100px",
                          padding: "8px",
                          textAlign: "center",
                          fontSize: "12px"
                        }}
                      >
                        {isFetchingFees ? <Spin /> : getQuoteAnnotation()}
                      </div>
                    )}
                  <Spacer size={15} />
                  <div className={style["fees"]}>
                    <List
                      background={false}
                      listType="horizontal"
                      src={[
                        {
                          label: "Fees",
                          value: `${
                            paymentDetails?.pricingInfo?.liftingFeeAmount ??
                            "---"
                          } ${
                            paymentDetails?.pricingInfo?.liftingFeeCurrency ??
                            "---"
                          }`
                        },
                        {
                          label: "Indicative Exchange Rate",
                          value: (
                            <>
                              {paymentDetails?.fxInfo?.allInRate ? (
                                <>
                                  <span>
                                    {paymentDetails?.fxInfo?.allInRate}
                                  </span>
                                  <Tooltip text="This is an indicative exchange rate. The final rate applied will be confirmed after submission of the payment">
                                    <Icon
                                      name="moreInfo"
                                      size="extraSmall"
                                      color="#9da0af"
                                    />
                                  </Tooltip>
                                </>
                              ) : (
                                "---"
                              )}
                            </>
                          )
                        }
                      ]}
                    />
                  </div>
                </div>
              </Row>
            </Card>
            <Spacer size={40} />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Button
                onClick={previousStepHandler}
                type="secondary"
                label="Previous"
                icon={{
                  name: "leftArrow",
                  position: "left"
                }}
              />
              <Button
                disabled={
                  formValues.amount !== undefined &&
                  formValues.amount > 0 &&
                  paymentDetails?.creditAmount &&
                  parseFloat(paymentDetails?.creditAmount) > 0 &&
                  paymentRemarks &&
                  formValues.amount <=
                    selectedAccount?.balance?.availableBalance &&
                  payDetailsError === "" &&
                  !isLoading &&
                  sellAmt >= 0 &&
                  !isErrorFees
                    ? false
                    : true
                }
                type="primary"
                label={confirmBtnLabel}
                icon={{
                  name: "rightArrow",
                  position: "right"
                }}
                // onClick={onConfirmNewPayment}
                onClick={() => form.submit()}
              />
            </div>
          </Col>
          <Col className="gutter-row" span={12}>
            <Card>
              <Text label="Remarks *" weight="bold" />
              <Spacer size={15}></Spacer>
              <Form.Item
                name="remarks"
                rules={[
                  {
                    pattern: new RegExp("^[ A-Za-z0-9./\\-?:().,’+]*$"),
                    message:
                      "Invalid character entered. Please enter valid characters only."
                  },
                  {
                    required: true,
                    message: "Remarks is required."
                  }
                ]}
              >
                <Input
                  label=""
                  placeholder="Payment sent from Pay Perform"
                  name="remarks"
                  type="text"
                  size="medium"
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    dispatch(updatePaymentRemarks(event.target.value));
                  }}
                />
              </Form.Item>
            </Card>
          </Col>
        </Row>
      </Form>
      {ConfirmModal && <ConfirmModal show={showModal} />}
    </div>
  );
};

export default Amount;
