import {
  Colors,
  Modal,
  Text,
  Form,
  Select,
  TextInput,
  Row,
  Col,
  CurrencyTag,
  Button,
  Notification,
  NumberInput
} from "@payconstruct/design-system";
import { Spacer } from "../../../../../components/Spacer/Spacer";
import styles from "./DepositDetail.module.css";
import React, { useState, useEffect } from "react";
import {
  useAssignFundsMutation,
  useGetDepositDetailQuery
} from "../../../../../services/ExoticFX/Finance/endpoints/depositEndpoints";
import { AssignFundsRequest } from "../../../../../services/ExoticFX/Finance/financeService";
import { useAppDispatch } from "../../../../../redux/hooks/store";
import {
  editAccountAction,
  selectedAccountAction
} from "../../../../../config/trades/tradeSlice";

import { isCurrencyPresent } from "../../../Helpers/currencyTag";
import {
  currencyParser,
  fieldCurrencyFormatter
} from "../../../../../utilities/transformers";

interface DepositDetailBodyProps {
  deposit: {
    orderId: string;
    leg: "exchange" | "local";
    currency: string;
    vendorName: string;
    vendorId: string;
  };
  form?: any;
  disableButton: (value: boolean) => void;
  newAccountAction?: () => void;
  newDepositAction: () => void;
  vendor: any;
  setVendor: (e: any) => void;
  refetchCounter: number;
}

interface FormValuesI extends AssignFundsRequest {
  instructions: string;
  notes: string;
  minAmount: number;
  maxAmount: number;
}

const ModalBody: React.FC<DepositDetailBodyProps> = ({
  form,
  newAccountAction,
  newDepositAction,
  disableButton,
  deposit,
  vendor,
  setVendor,
  refetchCounter
}) => {
  const dispatch = useAppDispatch();
  const { currency, vendorName, vendorId, orderId, leg } = deposit;
  const [assignFunds] = useAssignFundsMutation();

  const [initialValues] = useState(deposit);

  const { refetch, vendorData, isLoading } = useGetDepositDetailQuery(
    { id: vendorId, currency },
    {
      // skip: vendorId.length < 1,
      selectFromResult: ({ data, isLoading, isFetching }) => ({
        vendorData: data?.deposits,
        isLoading,
        isFetching
      })
      // refetchOnMountOrArgChange: 5,
      // refetchOnFocus: true
    }
  );

  useEffect(() => {
    if (refetchCounter > 0) {
      refetch();
    }
  }, [refetchCounter]);

  const onFinish = async (formValues: FormValuesI) => {
    const formattedForm = {
      ...formValues,
      orderId,
      leg,
      currency,
      vendorName,
      vendorId
    };

    try {
      await assignFunds(formattedForm).unwrap();
      Notification({
        message: "Success",
        description: "Sent",
        type: "success"
      });

      form.resetFields();
      disableButton(true);
      newDepositAction();
    } catch (err: any) {
      Notification({
        message: "Error",
        description: "Failed!",
        type: "error"
      });
    }
  };

  const onFormChange = () => {
    const values = form.getFieldsValue() as { amount?: number; id?: string };
    if (values.amount && values.id) return disableButton(false);
    disableButton(true);
  };

  const handleSelectVendor = (e: string) => {
    const svendor = vendorData?.find((v) => v.accountNumber == e);
    dispatch(selectedAccountAction(svendor));
    setVendor(svendor);
    form.setFieldsValue({
      instructions: svendor?.instructions,
      notes: svendor?.notes,
      minAmount: svendor?.minAmount,
      maxAmount: svendor?.maxAmount
    });
  };

  const handleEditVendor = () => {
    dispatch(editAccountAction(true));
    if (newAccountAction) {
      newAccountAction();
    }
  };

  return (
    <div className={styles["deposit-detail-modal"]}>
      <Form
        form={form}
        onFinish={onFinish}
        initialValues={initialValues}
        onFieldsChange={onFormChange}
      >
        <Form.Item name={"orderId"} hidden>
          <TextInput label={"orderId"} />
        </Form.Item>
        <Form.Item name={"leg"} hidden>
          <TextInput label={"legType"} />
        </Form.Item>
        <Form.Item name={"vendorId"} hidden>
          <TextInput label={"VendorId"} />
        </Form.Item>
        <Row gutter={15}>
          <Col span={24}>
            <div
              className={styles["deposit-vendor__wrapper"]}
              style={{ backgroundColor: Colors.grey.neutral50 }}
            >
              <div className={styles["deposit-vendor"]}>
                <span className={styles["deposit-vendor__name"]}>
                  {vendorName}
                </span>
                <CurrencyTag
                  currency={currency}
                  prefix={isCurrencyPresent(currency)}
                />
              </div>
              <span></span>
            </div>
          </Col>
        </Row>
        <Row gutter={15}>
          <Col span={24} flex={"space-between"}>
            <Spacer size={10} />
            <div className={styles["deposit-vendor__flex-between"]}>
              <Text
                label="Account"
                weight="bold"
                size="xsmall"
                color={Colors.grey.neutral900}
              />
              {newAccountAction && (
                <Button
                  className={styles["deposit-detail__add-new-account"]}
                  type="link"
                  label="Add New"
                  onClick={newAccountAction}
                  icon={{
                    name: "add",
                    position: "left"
                  }}
                />
              )}
            </div>
          </Col>
        </Row>
        <Row gutter={15}>
          <Col span={24}>
            <Form.Item
              name={"id"}
              rules={[{ required: true, message: "Account must be selected" }]}
            >
              <Select
                loading={isLoading}
                optionlist={vendorData?.map(({ currency, accountNumber }) => {
                  return [accountNumber, `${vendorName} / ${accountNumber}`];
                })}
                placeholder="Select Options"
                onChange={handleSelectVendor}
              ></Select>
            </Form.Item>
            {Boolean(vendor) && (
              <Button
                className={styles["deposit-detail__edit-vendor"]}
                type="link"
                label="Edit"
                onClick={handleEditVendor}
                icon={{
                  name: "chevronsUp",
                  position: "left"
                }}
              />
            )}
          </Col>
        </Row>
        <Row gutter={15}>
          <Col span={24}>
            <Text
              label="Payment"
              weight="bold"
              size="xsmall"
              color={Colors.grey.neutral900}
            />
            <Spacer size={10} />
          </Col>
          <Col span={6}>
            <Form.Item name={"currency"} required>
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
              name={"amount"}
              rules={[{ required: true, message: "Amount cannot be empty" }]}
            >
              <NumberInput
                label={"Amount"}
                type="text"
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
    </div>
  );
};

interface DepositDetailProps {
  deposit: {
    orderId: string;
    leg: "exchange" | "local";
    currency: string;
    vendorName: string;
    vendorId: string;
  };
  show: boolean;
  onClickCancel: () => void;
  onClickOk: (data?: any) => void;
  newAccountAction?: () => void;
  refetchCounter: number;
}

const DepositDetailModal: React.FC<DepositDetailProps> = ({
  show,
  deposit,
  newAccountAction,
  onClickCancel,
  onClickOk,
  refetchCounter
}) => {
  const [form] = Form.useForm();
  const [disabled, setDisabled] = useState(true);
  const [vendor, setVendor] = useState(null);

  return (
    <Modal
      modalView={show}
      title="Add Deposit Details"
      onCancelText={"Cancel"}
      onOkText="Confirm"
      onClickCancel={() => {
        onClickCancel();
        form.resetFields();
        setVendor(null);
      }}
      onClickOk={() => {
        form.submit();
      }}
      buttonOkDisabled={disabled}
      description={
        <ModalBody
          newAccountAction={newAccountAction}
          newDepositAction={onClickOk}
          deposit={deposit}
          form={form}
          disableButton={setDisabled}
          vendor={vendor}
          setVendor={setVendor}
          refetchCounter={refetchCounter}
        />
      }
    />
  );
};

export { DepositDetailModal };
