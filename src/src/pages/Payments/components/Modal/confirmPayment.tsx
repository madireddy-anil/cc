import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Modal,
  Text,
  CurrencyTag,
  Status,
  Button,
  List,
  Colors,
  Notification
} from "@payconstruct/design-system";
import { showModalAction } from "../../../Components/DepositAmount/DepositAmountSlice";
import { setToInitialState } from "../PaymentFor/paymentForSlice";
import { setToInitialStep } from "../../PaymentSlice";
import { useAppDispatch, useAppSelector } from "../../../../redux/hooks/store";
import { Spacer } from "../../../../components/Spacer/Spacer";

import { isCurrencyPresent } from "../../../Components/Helpers/currencyTag";
import { useCreateNewPaymentMutation } from "../../../../services/paymentService";
import { Card } from "../../../Components/Card/Card";
import { fractionFormat } from "../../../../utilities/transformers";
import styles from "./confirmPayment.module.css";

interface IConfirmNewPayment {
  show: boolean;
}

const ConfirmPayment: React.FC<IConfirmNewPayment> = (props) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { show } = props;

  const [createNewPayment, { isLoading, isSuccess }] =
    useCreateNewPaymentMutation();

  const { selectedAccount }: any = useAppSelector(
    (state) => state.selectAccount
  );
  const { paymentDetails } = useAppSelector((state) => state.payment);
  const beneficiaries = useAppSelector((state) => state.beneficiary);
  const sendAmount = useAppSelector((state) => state.depositAmount.sendAmount);
  const paymentRemarks = useAppSelector(
    (state) => state.depositAmount.paymentRemarks
  );

  const {
    selectedInternalAccount,
    selectedBeneficiary,
    settlementType,
    newBeneficiary,
    beneficiaryId
  } = beneficiaries;

  const beneficiary =
    settlementType === "internal"
      ? selectedInternalAccount
      : selectedBeneficiary;

  const sendAmountString = sendAmount?.toString();

  const onCancel = () => {
    dispatch(showModalAction(false));
  };

  const getAccountNumber = (account: any) => {
    if (account?.accountNumber) {
      return account?.accountNumber;
    } else if (account?.IBAN || account?.iban) {
      return account?.IBAN || account?.iban;
    }
    return "Account Number Not Available";
  };

  const getCreditor = (beneData: any) => {
    let value = "";
    if (settlementType === "internal") {
      value = getAccountNumber(beneData?.accountIdentification);
    } else {
      value = getAccountNumber(beneData?.accountDetails);
    }

    return value;
  };

  const getName = (bene: any) => {
    if (bene?.accountName) {
      return bene?.accountName;
    } else if (bene?.beneficiaryDetails?.nameOnAccount) {
      return bene?.beneficiaryDetails?.nameOnAccount;
    } else {
      return bene?.beneficiaryDetails?.name;
    }
  };

  const onConfirm = () => {
    let values: any = {
      accountId: selectedAccount?.id,
      debitCurrency: selectedAccount.currency,
      debitAmount: sendAmount,
      creditCurrency: beneficiary.currency,
      creditAmount: paymentDetails?.creditAmount ?? 0,
      remittanceInformation: paymentRemarks ?? ""
    };

    switch (settlementType) {
      case "internal":
        values = {
          ...values,
          creditorAccountId: beneficiaryId
        };
        break;
      case "external":
        values = {
          ...values,
          beneficiaryId: beneficiaryId || newBeneficiary?.beneficiary?.id
        };
        break;
      default:
        break;
    }

    createNewPayment(values)
      .unwrap()
      .then((response) => {
        navigate(
          `/new-payment/payment-status?orderReference=${response?.data?.transactionReference}`
        );
        dispatch(showModalAction(false));
        dispatch(setToInitialState());
      })
      .catch((err) => {
        const errMsg = err?.data?.errors["invalid-params"]?.message;
        Notification({
          message: "Payment Error!",
          description: `An error has occurred, ${errMsg ?? ""}`,
          type: "error"
        });
        dispatch(showModalAction(false));
      });
  };

  return (
    <Modal
      modalView={show}
      title={"Confirm Payment"}
      onCancelText={"Cancel"}
      onOkText={"Confirm"}
      onClickCancel={onCancel}
      onClickOk={onConfirm}
      btnLoading={isLoading || isSuccess}
      buttonOkDisabled={isLoading || isSuccess}
      description={
        <Card style={{ background: Colors.grey.neutral50 }}>
          <div>
            <Text label="Account Details: " size="small" weight="regular" />
            <Spacer size={10} />
            <Card
              style={{ borderColor: Colors.grey.neutral100, padding: "20px" }}
            >
              <div className={styles["currency-list__view"]}>
                <div className="left">
                  <div className={styles["currency-card"]}>
                    <p className={styles["currency-card__value"]}>
                      {fractionFormat(sendAmountString ?? "0")}
                    </p>
                    <CurrencyTag
                      prefix={isCurrencyPresent(selectedAccount?.currency)}
                      currency={
                        selectedAccount?.currency
                          ? selectedAccount?.currency
                          : ""
                      }
                    />
                  </div>
                  <Spacer size={10} />
                  <Text
                    label={getAccountNumber(
                      selectedAccount?.accountIdentification
                    )}
                    size="small"
                    weight="regular"
                  />
                  <div>
                    <Text
                      label={`Available Balance: ${fractionFormat(
                        selectedAccount?.balance?.availableBalance ?? 0
                      )}`}
                      size="xxsmall"
                      color="#468274"
                      weight="regular"
                    />
                  </div>
                </div>
              </div>
            </Card>
            <Spacer size={20} />
            <Text label="Beneficiary Details: " size="small" weight="regular" />
            <Spacer size={10} />
            <Card
              style={{ borderColor: Colors.grey.neutral100, padding: "20px" }}
            >
              <div className={styles["currency-list__view"]}>
                <div className="left">
                  <div className={styles["currency-card"]}>
                    <p className={styles["currency-card__value"]}>
                      {fractionFormat(paymentDetails?.creditAmount)}
                    </p>
                    <CurrencyTag
                      prefix={isCurrencyPresent(beneficiary?.currency)}
                      currency={
                        beneficiary?.currency ? beneficiary?.currency : ""
                      }
                    />
                  </div>
                  <Spacer size={10} />
                  <Text
                    label={`${getName(beneficiary)} / ${getCreditor(
                      beneficiary
                    )}`}
                    size="small"
                    weight="regular"
                  />
                </div>
              </div>
            </Card>
            <Spacer size={20} />
            <div className={styles["currency-list__view"]}>
              <div>
                <Text label="Payment Details" size="small" weight="regular" />
              </div>
              <div>
                <Button
                  label="Modify Details"
                  type="link"
                  onClick={() => {
                    dispatch(setToInitialStep());
                    onCancel();
                  }}
                />
              </div>
            </div>
            <div className={styles["fees"]}>
              <List
                background={false}
                listType="horizontal"
                src={[
                  {
                    label: "Fees",
                    value: `${paymentDetails?.pricingInfo?.liftingFeeAmount} ${
                      paymentDetails?.pricingInfo?.liftingFeeCurrency ?? "---"
                    }`
                  },
                  {
                    label: "Exchange Rate",
                    value: paymentDetails?.fxInfo?.allInRate ?? "---"
                  },
                  {
                    label: "Remarks",
                    value: `${paymentRemarks ?? "---"}`
                  }
                ]}
              />
            </div>
          </div>
        </Card>
      }
    />
  );
};

export default ConfirmPayment;
