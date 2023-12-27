import {
  Colors,
  Text,
  Form,
  Select,
  TextInput,
  Checkbox,
  Row,
  Col,
  NumberInput
} from "@payconstruct/design-system";
import { Spacer } from "../../../../../components/Spacer/Spacer";
import styles from "./RemittanceModal.module.css";
import React from "react";
import {
  currencyParser,
  fieldCurrencyFormatter
} from "../../../../../utilities/transformers";
import { OrderDepositDetails } from "../../../../../services/ExoticFX/Finance/financeService";
import { ImageUploader } from "../../ImageUploader/ImageUploader";
import { stringify } from "query-string";

interface RemittanceModalMainBodyProps {
  deposit: OrderDepositDetails;
  selectedDeposits: any;
  loading: boolean;
  showOtherTxs: boolean;
  documents: string[];
  onCheck: (checked: boolean) => void;
  onChangeAmount: (amount: string) => void;
  setDocuments: (data: string[]) => void;
  vendorAmount: number;
}

const RemittanceModalMainBody: React.FC<RemittanceModalMainBodyProps> = ({
  deposit,
  selectedDeposits,
  showOtherTxs,
  documents,
  onCheck,
  onChangeAmount,
  setDocuments,
  vendorAmount
}) => {
  const {
    type,
    exchangedCurrency,
    deposited,
    expected,
    expectedRate,
    currency,
    exchangedAmount,
    orderId,
    vendorId,
    accountId,
    remittanceDocument,
    depositedExchangeAmount
  } = deposit;

  const url = {
    orderId,
    vendorId,
    accountId,
    type: "deposit"
  };

  const remittedAmount = selectedDeposits.length
    ? selectedDeposits.reduce(
        (sumDeposited: number, depositObject: any) =>
          Number(depositObject.deposited) + sumDeposited,
        0
      )
    : deposited;

  const remittedCurrency = selectedDeposits.length
    ? selectedDeposits.reduce(
        (currency: string, depositObject: any) =>
          depositObject.currency !== currency ? "N/A" : currency,
        selectedDeposits[0].currency
      )
    : currency;

  const expectedValue = type === "exchange" ? exchangedAmount : expected;

  const exchangeAmountForSingleDeposit = depositedExchangeAmount
    ? Number(depositedExchangeAmount)
    : expectedValue;
  const exchangeAmountForBatchDeposit = selectedDeposits.reduce(
    (sumDeposited: number, depositObject: any) =>
      Number(depositObject.exchangedAmount) + sumDeposited,
    0
  );
  const exchangeCurrencyForBatchDeposit = selectedDeposits.reduce(
    (currency: string, depositObject: any) =>
      depositObject.exchangedCurrency !== exchangedCurrency ? "N/A" : currency,
    selectedDeposits.length ? selectedDeposits[0].exchangedCurrency : ""
  );
  const calculatedExchangeCurrency = exchangeAmountForBatchDeposit
    ? exchangeCurrencyForBatchDeposit
    : exchangedCurrency;
  // const calculatedExchangeAmount = fieldCurrencyFormatter(
  //   exchangeAmountForBatchDeposit
  //     ? exchangeAmountForBatchDeposit
  //     : exchangeAmountForSingleDeposit,
  //   calculatedExchangeCurrency === "NA" ? "" : exchangedCurrency
  // );
  const calculatedExchangeAmount = fieldCurrencyFormatter(
    selectedDeposits.length
      ? selectedDeposits.reduce(
          (sumDeposited: number, depositObject: any) =>
            Number(depositObject.depositedExchangeAmount) + sumDeposited,
          0
        )
      : depositedExchangeAmount,
    // calculatedExchangeCurrency === "NA" ? "" : exchangedCurrency
    // exchangedCurrency
    ""
  );

  return (
    <div className={styles["receipt-modal"]}>
      <Form
        initialValues={{
          currency: remittedCurrency === "NA" ? "" : remittedCurrency,
          exchangedCurrency,
          remittedAmount: fieldCurrencyFormatter(
            remittedCurrency === "NA" ? "N/A" : remittedAmount.toString(),
            // remittedCurrency === "NA" ? "" : remittedCurrency
            ""
          ),
          calculatedExchangeAmount,
          vendorAmount,
          rate:
            exchangeAmountForBatchDeposit &&
            calculatedExchangeCurrency !== "N/A"
              ? exchangeAmountForBatchDeposit / remittedAmount
              : Number(expectedRate)
        }}
      >
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
              documents={[...remittanceDocument, ...documents]}
              url={stringify(url)}
              onUploadFinish={(documents) => {
                setDocuments(documents);
              }}
            />
            <Spacer size={5} />
          </Col>
        </Row>

        <RemittedAmountRow currency={currency} />

        <ExchangeAmountRow
          exchangedCurrency={exchangedCurrency}
          onChangeAmount={onChangeAmount}
        />

        {/* <Row gutter={15}>
          <Col span={24}>
            <Text
              label="Conversion Rate"
              weight="bold"
              size="xsmall"
              color={Colors.grey.neutral900}
            />
            <Spacer size={10} />
            <Form.Item name="rate">
              <TextInput label={"Rate"} disabled />
            </Form.Item>
          </Col>
        </Row> */}
        {selectedDeposits.length === 0 && (
          <Row gutter={15}>
            <Col span={24}>
              <Checkbox
                label="Other transactions have been remitted in batch"
                checked={showOtherTxs}
                onChange={(e) => onCheck(e.target.checked)}
              />
            </Col>
          </Row>
        )}
      </Form>
    </div>
  );
};

interface ExchangeAmountRowProps {
  exchangedCurrency: string;
  onChangeAmount: (amount: string) => void;
}
const ExchangeAmountRow: React.FC<ExchangeAmountRowProps> = ({
  exchangedCurrency,
  onChangeAmount
}) => {
  return (
    <>
      <Row gutter={15}>
        <Col span={24}>
          <Text
            label={"Exchanged Amount"}
            weight="bold"
            size="xsmall"
            color={Colors.grey.neutral900}
          />
          <Spacer size={10} />
        </Col>
      </Row>
      <Row gutter={15}>
        <Col span={6}>
          <Form.Item name={"exchangedCurrency"}>
            <Select
              disabled={true}
              label="Currency"
              defaultValue={exchangedCurrency}
              optionlist={[[exchangedCurrency, exchangedCurrency]]}
              placeholder="Select Options"
            />
          </Form.Item>
        </Col>
        <Col span={9}>
          <Form.Item name={"calculatedExchangeAmount"}>
            <TextInput label={"Exchange Amount"} disabled />
          </Form.Item>
        </Col>
        <Col span={9}>
          <Form.Item name={"vendorAmount"}>
            <NumberInput
              label={"Vendor Amount"}
              type="text"
              min={0}
              formatter={(value) => {
                return fieldCurrencyFormatter(value, exchangedCurrency);
              }}
              parser={currencyParser}
              onChange={(value) => onChangeAmount(String(value))}
            />
          </Form.Item>
        </Col>
      </Row>
    </>
  );
};

interface RemittedAmountRowProps {
  currency: string;
}

const RemittedAmountRow: React.FC<RemittedAmountRowProps> = ({ currency }) => {
  return (
    <>
      <Row gutter={15}>
        <Col span={24}>
          <Text
            label={"Remitted Amount"}
            weight="bold"
            size="xsmall"
            color={Colors.grey.neutral900}
          />
          <Spacer size={10} />
        </Col>
      </Row>
      <Row gutter={15}>
        <Col span={6}>
          <Form.Item name={"currency"}>
            <Select
              disabled={true}
              label="Currency"
              defaultValue={currency}
              optionlist={[[currency, currency]]}
              placeholder="Select Options"
            />
          </Form.Item>
        </Col>
        <Col span={9}>
          <Form.Item name={"remittedAmount"}>
            <TextInput label={"Remitted Amount"} disabled />
          </Form.Item>
        </Col>
      </Row>
    </>
  );
};

export { RemittanceModalMainBody };
