import {
  Modal,
  Form,
  Select,
  TextInput,
  Row,
  Col,
  TextareaInput,
  Colors,
  Text,
  Notification,
  NumberInput
} from "@payconstruct/design-system";
import styles from "./NewVendorAccount.module.css";
import React, { useState } from "react";
import { Spacer } from "../../../../../components/Spacer/Spacer";
import {
  useAppSelector,
  useAppDispatch
} from "../../../../../redux/hooks/store";
import { selectTimezone } from "../../../../../config/general/generalSlice";
import {
  selectEditAccount,
  editAccountAction,
  selectedAccount as selAccount,
  selectedAccountAction
} from "../../../../../config/trades/tradeSlice";
import moment, { Moment } from "moment-timezone";
import { TimePicker } from "antd";
import copy from "copy-to-clipboard";
import {
  currencyParser,
  fieldCurrencyFormatter,
  fractionFormat
} from "../../../../../utilities/transformers";
import {
  useDepositDetailMutation,
  useEditDepositDetailsForVendorMutation
} from "../../../../../services/ExoticFX/Finance/endpoints/depositEndpoints";
import {
  TimeZone,
  VendorDepositRequest
} from "../../../../../services/ExoticFX/Finance/financeService";

const getZoneFromOffset = (offsetString: string) =>
  moment.tz
    .names()
    .filter((tz) => moment.tz(tz).format("Z") === offsetString)[0] ?? "";
export interface DepositDetailsForm {
  orderId: string;
  leg: "exchange" | "local";
  currency: string;
  vendorName: string;
  vendorId: string;
  expected?: string;
  remitted?: string;
  deposited?: string;
  accountNumber?: string;
  time?: string;
  maxAmount?: number;
  minAmount?: number;
  notes?: string;
  instructions?: string;
  timeZone?: TimeZone;
}

interface NewVendorAccountBodyProps {
  viewOnly?: boolean;
  vendor: DepositDetailsForm;
  onAccountCreation: () => void;
  onAccountEdit: () => void;
  form?: any;
  setSaving: (e: boolean) => void;
  setCounter?: (n: number) => void;
}

const ModalBody: React.FC<NewVendorAccountBodyProps> = ({
  viewOnly,
  form,
  vendor,
  onAccountCreation,
  onAccountEdit,
  setSaving,
  setCounter
}) => {
  const dateFormat = "HH:mm";
  const selectedTimezone = useAppSelector(selectTimezone);
  const TIMEZONE = moment().tz(selectedTimezone).format("(UTC Z) z");
  const TimeZone =
    vendor.timeZone && vendor.timeZone.offset
      ? vendor.timeZone.offset
      : moment().tz(selectedTimezone).format("Z");
  const timezonePlace = selectedTimezone.replace("_", " ");
  const formattedTimezone = TIMEZONE + ` (${timezonePlace})`;
  const editAccount = useAppSelector(selectEditAccount);
  const selectedAccount = useAppSelector(selAccount);

  const formattedTime = vendor.time
    ? moment(vendor.time, dateFormat)
    : moment();

  const [depositDetail] = useDepositDetailMutation();
  const [saveEditAccount] = useEditDepositDetailsForVendorMutation();
  const dispatch = useAppDispatch();

  const onFinish = async (formValues: {
    accountNumber?: string;
    instructions?: string;
    notes?: string;
    vendorId: string;
    currency: string;
    vendor: string;
    timeZone: string;
    time: Moment;
    minAmount?: number;
    maxAmount?: number;
  }) => {
    const formattedTimeZone: TimeZone = {
      value: getZoneFromOffset(formValues.timeZone),
      label:
        moment().utcOffset(formValues.timeZone).format("(UTC Z) ") +
        getZoneFromOffset(formValues.timeZone),
      offset: formValues.timeZone,
      abbrev: "",
      altName: getZoneFromOffset(formValues.timeZone)
    };
    const formattedForm = {
      ...formValues,
      time: formValues.time.format(dateFormat),
      timeZone: formattedTimeZone
    };

    if (editAccount) {
      const editAccountPayload: VendorDepositRequest = {
        vendorId: formValues.vendorId,
        accountNumber: formValues.accountNumber,
        instructions: formValues.instructions,
        notes: formValues.notes,
        minAmount: formValues.minAmount,
        maxAmount: formValues.maxAmount,
        time: formValues.time.format(dateFormat),
        timeZone: formattedTimezone
      };
      dispatch(selectedAccountAction(editAccountPayload));
      setSaving(true);
      try {
        await saveEditAccount(editAccountPayload).unwrap();
        setCounter && setCounter(new Date().getTime());
        Notification({
          message: "Success!",
          description: "Deposit details for vendor successfully updated.",
          type: "success"
        });
        onAccountEdit();
      } catch (err: any) {
        console.log("err", err);
        Notification({
          message: "Error!",
          description:
            "An error occured while saving deposit details for vendor.",
          type: "error"
        });
      }
    } else {
      try {
        await depositDetail(formattedForm).unwrap();
        Notification({
          message: "Success",
          description: "Sent",
          type: "success"
        });

        onAccountCreation();
        if (form?.resetFields) form?.resetFields();
      } catch (err: any) {
        Notification({
          message: "Error",
          description: "Failed!",
          type: "error"
        });
        console.log("Error: ", err);
      }
    }
  };

  let initialValues = {
    ...vendor,
    expected: vendor.expected ?? 0,
    maxAmount: vendor.maxAmount ?? 0,
    minAmount: vendor.minAmount ?? 0,
    timeZone: TimeZone,
    time: formattedTime
  };

  if (editAccount && selectedAccount.vendorId) {
    const { accountNumber, instructions, notes, minAmount, maxAmount } =
      selectedAccount;
    initialValues.accountNumber = accountNumber;
    initialValues.instructions = instructions;
    initialValues.notes = notes;
    initialValues.minAmount = Number(minAmount);
    initialValues.maxAmount = Number(maxAmount);
  }

  form.setFieldsValue(initialValues);

  return (
    <div className={styles["new-vendor-modal"]}>
      <Form form={form} onFinish={onFinish} initialValues={initialValues}>
        <Row gutter={15}>
          <Col span={12}>
            <Form.Item name={"vendorId"} hidden>
              <TextInput label="Vendor" required disabled={viewOnly} />
            </Form.Item>
            <Form.Item name={"currency"}>
              <Select
                aria-required
                disabled
                label="Currency"
                optionlist={[[vendor.currency, vendor.currency]]}
                placeholder="Select Options"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name={"vendorName"}>
              <Select
                aria-required
                disabled
                label="Vendor"
                optionlist={[["KLMC", "KLMC"]]}
                placeholder="Select Options"
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={15}>
          <Col span={24}>
            <Form.Item name={"accountNumber"}>
              <TextInput
                label={"Account number"}
                required
                disabled={viewOnly || editAccount}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={15}>
          {/* <Col span={12}>
            <Form.Item name={"deposited"} hidden={!viewOnly}>
              <TextInput
                label={"Deposited amount"}
                required
                disabled={viewOnly}
              />
            </Form.Item>
          </Col> */}
          <Col span={24}>
            <Form.Item name={"expected"} hidden={!viewOnly}>
              {/* <NumberInput
                label={"Expected deposit amount"}
                required
                min={0}
                disabled={viewOnly}
                formatter={(value) => {
                  return fieldCurrencyFormatter(value, vendor.currency);
                }}
                parser={currencyParser}
              /> */}
              <TextInput
                label={"Expected deposit amount"}
                required
                disabled={viewOnly}
              />
            </Form.Item>
          </Col>
        </Row>
        {/* <Row gutter={15}>
          <Col span={24}>
            <Form.Item name={"remitted"} hidden={!viewOnly}>
              <TextInput
                label={"Remitted amount"}
                required
                disabled={viewOnly}
              />
            </Form.Item>
          </Col>
        </Row> */}
        <Row gutter={15}>
          <Col span={24}>
            <Form.Item name={"instructions"}>
              <TextareaInput
                name={"instructions"}
                type="textarea"
                label={"Bank deposit details"}
                required
                disabled={viewOnly}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={15}>
          <Col span={24}>
            <Form.Item name={"notes"}>
              <TextareaInput
                name={"notes"}
                label={"Notes"}
                placeholder={"Enter deposit notes"}
                disabled={viewOnly}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={15}>
          <Col span={12}>
            <Form.Item name={"minAmount"}>
              <NumberInput
                label={"Min. Transaction size"}
                type="text"
                required
                disabled={viewOnly}
                min={0}
                formatter={(value) => {
                  return fieldCurrencyFormatter(value, vendor.currency);
                }}
                parser={currencyParser}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name={"maxAmount"}>
              <NumberInput
                label={"Min. Transaction size"}
                type="text"
                required
                disabled={viewOnly}
                min={0}
                formatter={(value) => {
                  return fieldCurrencyFormatter(value, vendor.currency);
                }}
                parser={currencyParser}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={15}>
          <Col span={24}>
            <Text
              label="Transfer deadline"
              weight="bold"
              size="xsmall"
              color={Colors.grey.neutral900}
            />
            <Spacer size={10} />
          </Col>
        </Row>
        <Row gutter={15}>
          <Col span={18}>
            <Form.Item name={"timeZone"}>
              <Select
                label="TimeZone"
                disabled
                optionlist={[[formattedTimezone, formattedTimezone]]}
                placeholder="Select options"
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name={"time"}>
              <TimePicker
                disabled={viewOnly}
                size="large"
                format={dateFormat}
                style={{
                  width: "100%",
                  borderColor: Colors.grey.neutral200,
                  height: "46px",
                  borderRadius: "5px"
                }}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

interface NewVendorAccountProps {
  viewOnly?: boolean;
  vendor: DepositDetailsForm;
  show: boolean;
  onClickCancel: () => void;
  onClickOk: (data?: any) => void;
  setCounter?: (n: number) => void;
}

const copyVendorDepositInfo = (info: DepositDetailsForm) => {
  const time = info?.time;
  const deposit = currencyParser(info.expected);
  const minTnx = currencyParser(info.minAmount);
  const maxTnx = currencyParser(info.maxAmount);
  const data = `
  ------------------------
  Deposit Information: 

  Currency: ${info.currency || "---"}
  Account Number: ${info.accountNumber || "---"}
  Amount to Deposit: ${deposit ? fractionFormat(deposit) : "---"}
  Min Transaction: ${minTnx ? fractionFormat(minTnx) : "---"}
  Max Transaction: ${maxTnx ? fractionFormat(maxTnx) : "---"}
  Bank Deposit Details: \n\t- ${
    info.instructions ? info.instructions.replace(/\n/g, "\n\t  ") : "---"
  }
  Notes: \n\t- ${info.notes ? info.notes.replace(/\n/g, "\n\t  ") : "---"}
  Transfer deadline time: ${time || "---"}
  -------------------------
  `;

  copy(data, {
    onCopy: Notification({
      type: "info",
      message: "Copied Successfully"
    })
  });
};

const NewVendorAccount: React.FC<NewVendorAccountProps> = ({
  viewOnly,
  vendor,
  show,
  onClickCancel,
  onClickOk,
  setCounter
}) => {
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const editAccount = useAppSelector(selectEditAccount);
  const handleClickCancel = () => {
    setSaving(false);
    dispatch(editAccountAction(false));
    onClickCancel();
  };

  return (
    <Modal
      modalView={show}
      title={
        viewOnly
          ? "Vendor Account Details"
          : editAccount
          ? "Edit Account"
          : "New Account"
      }
      onCancelText={"Cancel"}
      onOkText={
        viewOnly
          ? "Share"
          : editAccount
          ? saving
            ? "Saving Account..."
            : "Save Account"
          : "Create Account"
      }
      buttonOkDisabled={Boolean(saving)}
      onClickCancel={handleClickCancel}
      onClickOk={() => {
        if (viewOnly) {
          copyVendorDepositInfo(form.getFieldsValue());
          return;
        }
        form.submit();
      }}
      description={
        <ModalBody
          form={form}
          vendor={vendor}
          onAccountCreation={onClickOk}
          onAccountEdit={handleClickCancel}
          viewOnly={viewOnly}
          setSaving={setSaving}
          setCounter={setCounter}
        />
      }
    />
  );
};

export { NewVendorAccount };
