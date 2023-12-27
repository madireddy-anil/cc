import React, { useEffect } from "react";
import {
  Form as DSForm,
  SwitchName,
  Select,
  NumberInput,
  TextInput,
  DatePicker,
  Notification,
  Button,
  Popconfirm
} from "@payconstruct/design-system";
import { useCreateManualCreditOrDebitMutation } from "../../../../../../services/paymentService";
import "./Adjustments.css";

interface AdjustmentsProps {
  accountDetails: any;
}

const Adjustments: React.FC<AdjustmentsProps> = ({ accountDetails }) => {
  const [form] = DSForm.useForm();
  const [debitCredit, setDebitCredit] = React.useState("credit");
  const [valueDate, setValueDate] = React.useState("");

  const [createManualCreditOrDebit] = useCreateManualCreditOrDebitMutation();

  // Added btnLoading variable instead of inbuild isLoading since we wanted 5sec delay.
  const [btnLoading, setBtnLoading] = React.useState(false);
  const [btnDisabled, setBtnDisabled] = React.useState(true);

  type debitOrCreditSwitchOptionsType = {
    label: string;
    value: string;
  };

  const debitOrCreditSwitchOptions: debitOrCreditSwitchOptionsType[] = [
    { label: "Debit", value: "debit" },
    { label: "Credit", value: "credit" }
  ];

  const onDatePickHandler = (e: any, value: string) => {
    setValueDate(value);
  };

  const onValuesChangeHandler = () => {
    checkButtonDisability();
  };

  useEffect(() => {
    setBtnLoading(false);
    return () => {
      setBtnLoading(false);
    };
  }, []);

  const onFinishHandler = async (fieldsValue: any) => {
    try {
      const payload = {
        ...fieldsValue,
        debitCredit: debitCredit.toLowerCase(),
        valueDate: valueDate
      };

      setBtnLoading(true);
      await createManualCreditOrDebit({
        id: accountDetails?.account?.id,
        payload
      });

      setTimeout(() => {
        Notification({
          type: "success",
          message: `Balances update initiated successfully!`
        });
        setBtnLoading(false);
        onCancelHandler();
      }, 5000);
    } catch (err: any) {
      Notification({
        type: "error",
        message: "Balances update failed!"
      });
      setBtnLoading(false);
    }
  };

  const onCancelHandler = () => {
    setDebitCredit("");
    setBtnDisabled(true);
    form.resetFields();
  };

  const checkButtonDisability = () => {
    const isAmountEntered =
      form.getFieldValue("amount") !== undefined &&
      form.getFieldValue("amount") !== null;
    const isRemarksEntered =
      form.getFieldValue("remarks") !== undefined &&
      form.getFieldValue("remarks") !== "";
    const isDateSelected =
      form.getFieldValue("valueDate") !== undefined &&
      form.getFieldValue("valueDate") !== null;
    if (isAmountEntered && isRemarksEntered && isDateSelected) {
      setBtnDisabled(false);
    } else {
      setBtnDisabled(true);
    }
  };

  return (
    <DSForm
      className="manual_txn_form_wrapper"
      form={form}
      onFinish={onFinishHandler}
      onValuesChange={onValuesChangeHandler}
    >
      <DSForm.Item>
        <div className="manual_txn-switch-name-wrapper">
          <SwitchName
            selectedOption={debitCredit === "debit" ? 0 : 1}
            name="debitOrCredit"
            onChange={(value) => {
              console.log("value", value?.debitOrCredit);
              setDebitCredit(String(value?.debitOrCredit));
            }}
            options={debitOrCreditSwitchOptions}
          />
        </div>
      </DSForm.Item>
      <DSForm.Item name="amount">
        <NumberInput
          min="0"
          type={"number"}
          sizeType="medium"
          name={"amount"}
          label={"Amount"}
          required={true}
          message={"Please input Amount!"}
        />
      </DSForm.Item>
      <DSForm.Item name="remarks">
        <TextInput
          type={"text"}
          name={"remarks"}
          label={"Reference"}
          placeholder={"Enter Reference"}
          message={"Reference cannot be empty!"}
          floatingLabel={true}
          required={true}
          // onChange={checkButtonDisability}
        />
      </DSForm.Item>
      <DSForm.Item name="valueDate">
        <DatePicker
          picker="date"
          placeholder="Select Value Date"
          onChange={onDatePickHandler}
          style={{ width: "100%" }}
          format={"YYYY-MM-DD"}
        />
      </DSForm.Item>
      <DSForm.Item>
        <div style={{ display: "flex" }}>
          <Button
            label="Cancel"
            type="secondary"
            onClick={() => onCancelHandler()}
          />
          <Popconfirm
            cancelText="No"
            okText="Yes"
            onConfirm={() => form.submit()}
            title="Are you sure you want to confirm?"
          >
            <Button
              style={{ marginLeft: "10px" }}
              label="Confirm"
              type="primary"
              icon={{ name: "rightArrow" }}
              disabled={btnDisabled}
              loading={btnLoading}
            />
          </Popconfirm>
        </div>
      </DSForm.Item>
    </DSForm>
  );
};

export { Adjustments as default };
