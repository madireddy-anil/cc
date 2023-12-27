import {
  Colors,
  Modal,
  Text,
  Form,
  Select,
  TextInput,
  DatePicker,
  Row,
  Col,
  NumberInput
} from "@payconstruct/design-system";

import moment from "moment";
import { Spacer } from "../../../../../components/Spacer/Spacer";
import styles from "./ReceiptModal.module.css";
import React, { useEffect, useState } from "react";
import {
  currencyParser,
  fieldCurrencyFormatter
} from "../../../../../utilities/transformers";
import { OrderDepositDetails } from "../../../../../services/ExoticFX/Finance/financeService";
import { ImageUploader } from "../../ImageUploader/ImageUploader";
import { stringify } from "query-string";

interface ReceiptModalBodyProps {
  deposit: OrderDepositDetails;
  onChangeAmount: (value: string) => void;
  setDocuments: (data: string[]) => void;
}

const ModalBody: React.FC<ReceiptModalBodyProps> = ({
  deposit,
  onChangeAmount,
  setDocuments
}) => {
  const { orderId, vendorId, accountId, depositDocument } = deposit;
  const fileCount = depositDocument.length;

  const url = {
    orderId,
    vendorId,
    accountId,
    type: "deposit"
  };

  // Can not select future dates
  function disabledDate(current: any) {
    return current && current > moment().endOf("day");
  }

  return (
    <div className={styles["receipt-modal"]}>
      <Form>
        <Row gutter={15}>
          <Col span={24}>
            <Text
              label="Optional Document"
              weight="bold"
              size="xsmall"
              color={Colors.grey.neutral900}
            />
            <Spacer size={5} />
            <ImageUploader
              documents={depositDocument}
              url={stringify(url)}
              onUploadFinish={(documents) => {
                setDocuments(documents);
              }}
            />
            <Spacer size={5} />
          </Col>
        </Row>
        <Row gutter={15}>
          <Col span={24}>
            <Text
              label={"Amount received"}
              weight="bold"
              size="xsmall"
              color={Colors.grey.neutral900}
            />
            <Spacer size={10} />
          </Col>
        </Row>
        <Row gutter={15}>
          <Col span={6}>
            <Form.Item name={"sell"}>
              <Select
                label="Currency"
                disabled={true}
                defaultValue={deposit.currency}
                optionlist={[[deposit.currency, deposit.currency]]}
                placeholder="Select Options"
              />
            </Form.Item>
          </Col>
          <Col span={9}>
            <Form.Item
              name={"expected"}
              initialValue={fieldCurrencyFormatter(
                deposit.expected,
                deposit.currency
              )}
            >
              <TextInput label={"Expected Amount"} disabled />
            </Form.Item>
          </Col>
          <Col span={9}>
            <Form.Item name={"amount"}>
              <NumberInput
                label={"Amount"}
                type="text"
                min={0}
                formatter={(value) => {
                  return fieldCurrencyFormatter(value, deposit.currency);
                }}
                parser={currencyParser}
                onChange={(value) => onChangeAmount(String(value))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={15}>
          <Col span={24}>
            <Form.Item name={"amount"}>
              <Text
                label={"Date Received"}
                weight="bold"
                size="xsmall"
                color={Colors.grey.neutral900}
              />
              <Spacer size={10} />
              <DatePicker
                style={{ width: "100%" }}
                disabledDate={disabledDate}
                placeholder="Select Date"
                defaultValue={moment()}
                format={"DD/MM/YYYY"}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

interface ReceiptModalProps {
  documents: string[];
  loading: boolean;
  onClickCancel: () => void;
  onClickOk: (data?: any) => void;
  setDocuments: (data?: any) => void;
  deposit: any;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({
  onClickCancel,
  onClickOk,
  setDocuments,
  loading,
  deposit
}) => {
  const [amount, setAmount] = useState("");
  const [disabled, setDisabled] = useState(true);

  useEffect(() => {
    if (Number(amount) === 0 || loading === true) {
      setDisabled(true);
      return;
    }
    setDisabled(false);
  }, [amount, loading]);

  return (
    <Modal
      modalView={true}
      title={"Receipt Confirmation"}
      subTitle={"File types that can be accepted: png, jpg, jpeg, pdf"}
      onCancelText={"Cancel"}
      onOkText={"Confirm Receipt"}
      buttonOkDisabled={disabled}
      onClickCancel={() => {
        onClickCancel();
      }}
      onClickOk={() => {
        onClickOk({ amount });
      }}
      description={
        <ModalBody
          onChangeAmount={(value) => setAmount(value)}
          deposit={deposit}
          setDocuments={setDocuments}
        />
      }
    />
  );
};

export { ReceiptModal };
