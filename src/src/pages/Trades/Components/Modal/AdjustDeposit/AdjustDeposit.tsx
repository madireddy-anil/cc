import {
  Col,
  Form,
  Modal,
  NumberInput,
  Row,
  Select,
  Notification
} from "@payconstruct/design-system";
import { useEffect, useState } from "react";
import { useRequoteDepositMutation } from "../../../../../services/tradesService";
import {
  currencyParser,
  fieldCurrencyFormatter
} from "../../../../../utilities/transformers";

import style from "./adjustDeposit.module.css";

interface formValuesProps {
  buyAmount: number;
}

interface AdjustDepositProps {
  show: boolean;
  onClickCancel: () => void;
  onClickOk: (data?: any) => void;
  currency: string;
  amount: number;
  id: string;
}

const AdjustDepositModal: React.FC<AdjustDepositProps> = ({
  onClickCancel,
  onClickOk,
  currency,
  amount,
  show,
  id
}) => {
  const [form] = Form.useForm();
  const [disabled, setDisabled] = useState(amount <= 0);

  useEffect(() => {
    setDisabled(amount <= 0);
  }, [amount]);

  const initialValues = { currency, buyAmount: amount };

  const [requoteDeposit] = useRequoteDepositMutation();

  const onFinish = async (formValues: formValuesProps) => {
    console.log("Received onFinish: ", formValues);
    try {
      await requoteDeposit({ id, buyAmount: formValues.buyAmount }).unwrap();
      Notification({
        message: "Success",
        description: "Deposit adjusted successfully",
        type: "success"
      });

      onClickOk();
    } catch (err: any) {
      Notification({
        message: "Error",
        description: `Failed! ${err?.message ?? "Unknown error"}`,
        type: "error"
      });
    }
  };

  const onFormChange = () => {
    const formValues = form.getFieldsValue() as { buyAmount?: number };
    form.setFieldsValue({
      buyAmount: formValues.buyAmount
    });
  };

  return (
    <Modal
      modalView={show}
      title="Adjust Deposit"
      onCancelText={"Cancel"}
      onOkText="Confirm"
      onClickCancel={() => {
        onClickCancel();
        form.resetFields();
      }}
      onClickOk={() => {
        console.log("form values", form.getFieldsValue());
        form.submit();
      }}
      buttonOkDisabled={disabled}
      description={
        <Form
          className={style["adjust-deposit"]}
          form={form}
          onFinish={onFinish}
          initialValues={initialValues}
          onFieldsChange={onFormChange}
        >
          <Row gutter={15}>
            <Col span={24}>
              <p style={{ marginBottom: "18px" }}>
                Current Transaction Amount{" "}
                <b>{fieldCurrencyFormatter(amount, currency)}</b>
              </p>
            </Col>
          </Row>
          <Row gutter={15}>
            <Col span={6}>
              <Form.Item
                name={"currency"}
                required
                style={{ marginBottom: "0px" }}
              >
                <Select
                  aria-required
                  label="Currency"
                  disabled
                  optionlist={[[currency, currency]]}
                  placeholder="Select Options"
                />
              </Form.Item>
            </Col>
            <Col span={18}>
              <Form.Item
                name={"buyAmount"}
                style={{ marginBottom: "0px" }}
                rules={[{ required: true, message: "Amount cannot be empty" }]}
              >
                <NumberInput
                  label={"New Transaction Amount"}
                  floatingLabel={true}
                  type="text"
                  size="middle"
                  required
                  min={0}
                  formatter={(value) => {
                    return fieldCurrencyFormatter(value, currency);
                  }}
                  parser={currencyParser}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      }
    />
  );
};

export { AdjustDepositModal };
