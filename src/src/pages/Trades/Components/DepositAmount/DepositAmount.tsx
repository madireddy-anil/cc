import React, { useEffect, useState } from "react";
import { Row, Col } from "antd";
import {
  Button,
  DatePicker,
  Form,
  Input,
  NumberInput,
  Select,
  SwitchName,
  Text,
  Tooltip
} from "@payconstruct/design-system";
import moment, { Moment } from "moment-timezone";
import { InfoCircleOutlined } from "@ant-design/icons";
import {
  Header,
  HeaderContent
} from "../../../../components/PageHeader/Header";
import { Card } from "../../../Components/Card/Card";
import { Spacer } from "../../../../components/Spacer/Spacer";
import { useAppDispatch, useAppSelector } from "../../../../redux/hooks/store";
import {
  updateFormValue,
  selectDepositAmount,
  showModalAction,
  setToInitialFormState
} from "../../../Components/DepositAmount/DepositAmountSlice";
import {
  selectAccountCurrency,
  selectAccountSelection
} from "../../../Components/AccountSelection/AccountSelectionSlice";
import { useGetExitCurrencyQuery } from "../../../../services/routesService";
import { selectTimezone } from "../../../../config/general/generalSlice";
import {
  currencyParser,
  fieldCurrencyFormatter
} from "../../../../utilities/transformers";

interface DepositAmountProps {
  ConfirmModal?: React.FunctionComponent<any>;
  confirmBtnLabel?: string;
  nextStepHandler?: () => void;
  previousStepHandler: () => void;
}

const DepositAmount: React.FC<DepositAmountProps> = (props) => {
  const {
    ConfirmModal,
    confirmBtnLabel,
    nextStepHandler,
    previousStepHandler
  } = props;
  const { Title } = HeaderContent;
  const dispatch = useAppDispatch();
  const selectedAccount = useAppSelector(selectAccountSelection);
  const selectCurrency = useAppSelector(selectAccountCurrency);
  const { form, showModal } = useAppSelector(selectDepositAmount);
  const timezone = useAppSelector(selectTimezone);

  const {
    sellCurrency,
    mainSellCurrency,
    depositType,
    executionDate,
    requestedAccountType,
    // buyCurrency,
    buyAmount
    // remarks
  } = form;

  const [date] = useState(
    moment(executionDate).isValid()
      ? moment(executionDate).tz(timezone)
      : moment().tz(timezone)
  );

  const [enableButton, setButtonEnabled] = useState(
    !!buyAmount && !!sellCurrency
  );

  useEffect(() => {
    if (buyAmount && sellCurrency) {
      setButtonEnabled(true);
    }
  }, [buyAmount, sellCurrency]);

  useEffect(() => {
    dispatch(updateFormValue({ executionDate: date.tz(timezone).format() }));
  }, [dispatch, timezone, date]);

  // useEffect(() => {
  //   dispatch(
  //     updateFormValue({
  //       buyCurrency: buyCurrency ? buyCurrency : selectedAccount?.currency,
  //       sellCurrency,
  //       depositType,
  //       requestedAccountType,
  //       remarks,
  //       executionDate: date.format()
  //     })
  //   );
  // }, [
  //   dispatch,
  //   buyCurrency,
  //   sellCurrency,
  //   depositType,
  //   requestedAccountType,
  //   remarks,
  //   executionDate,
  //   selectedAccount?.currency,
  //   date
  // ]);

  const { data: dataCurrencies } = useGetExitCurrencyQuery(
    {
      currency: selectCurrency ?? ""
    },
    { skip: !selectCurrency, refetchOnMountOrArgChange: true }
  );

  const onDatePick = (e: any, value: string) => {
    const formattedDate = moment(value, "DD/MM/YYYY").tz(timezone).format();
    dispatch(updateFormValue({ executionDate: formattedDate }));
  };

  type requestedAccountTypeOptionsType = {
    label: string;
    value: typeof requestedAccountType;
  }[];

  const requestedAccountTypeOptions: requestedAccountTypeOptionsType = [
    { label: "Personal Account", value: "personal" },
    { label: "Corporate Account", value: "corporate" }
  ];

  type accountTypeOptionsType = {
    label: string;
    value: typeof depositType;
  }[];

  const accountTypeOptions: accountTypeOptionsType = [
    { label: "Day Account", value: "day" },
    { label: "Overnight Account", value: "overnight" }
  ];

  const disabledDate = (current: Moment) => {
    // Can not select days before today
    return current < moment().subtract(2, "day").endOf("day");
  };

  return (
    <div>
      <Header>
        <Title subtitle="Enter Order financials and account attributes">
          Deposit & Exchange Attributes
        </Title>
      </Header>
      <Form initialValues={form}>
        <Row gutter={15}>
          <Col className="gutter-row" span={12}>
            <Card>
              <Text label="You Sell" weight="bold" />
              <Spacer size={15}></Spacer>
              <Row gutter={15}>
                <Col className="gutter-row" span={6}>
                  <Select
                    disabled={true}
                    label="Currency"
                    defaultValue={selectedAccount?.currency}
                    optionlist={[
                      [selectedAccount?.currency, selectedAccount?.currency]
                    ]}
                    onChange={(value) => {
                      dispatch(updateFormValue({ buyCurrency: value }));
                    }}
                    placeholder="Select Options"
                  />
                </Col>
                <Col className="gutter-row" span={18}>
                  <NumberInput
                    label="Amount"
                    // name="buyAmount"
                    type="text"
                    min={0}
                    formatter={(value) => {
                      return fieldCurrencyFormatter(
                        value,
                        selectedAccount?.currency ?? ""
                      );
                    }}
                    parser={currencyParser}
                    onChange={(value) => {
                      dispatch(updateFormValue({ buyAmount: value as number }));
                    }}
                  />
                </Col>
              </Row>
              <Text label="You Buy" weight="bold" />
              <Spacer size={15}></Spacer>
              <Select
                defaultValue={
                  sellCurrency
                    ? `${sellCurrency} (${mainSellCurrency})`
                    : undefined
                }
                onChange={(value) => {
                  const [sellCurrency, mainSellCurrency] = value
                    .replace(/[()]/g, "")
                    .split(" ");
                  dispatch(updateFormValue({ sellCurrency, mainSellCurrency }));
                }}
                label="Currency"
                optionlist={dataCurrencies?.exitCurrencies?.map(
                  (currency: string) => {
                    return [currency, currency];
                  }
                )}
                placeholder="Select Options"
              />
            </Card>

            <div className="trade">
              <Spacer size={20}></Spacer>
              <SwitchName
                selectedOption={requestedAccountType === "personal" ? 0 : 1}
                name="requestedAccountType"
                onChange={(value) => {
                  const AccountValue = Object.values(
                    value
                  )[0] as typeof requestedAccountType;
                  dispatch(
                    updateFormValue({ requestedAccountType: AccountValue })
                  );
                }}
                options={requestedAccountTypeOptions}
              />
              <Tooltip
                tooltipPlacement="right"
                text="Choose the type of the account into which funds will be deposited."
              >
                <InfoCircleOutlined />
              </Tooltip>
              <Spacer size={20}></Spacer>
              <SwitchName
                selectedOption={depositType === "day" ? 0 : 1}
                name="depositType"
                onChange={(value) => {
                  const AccountValue = Object.values(
                    value
                  )[0] as typeof depositType;
                  dispatch(updateFormValue({ depositType: AccountValue }));
                }}
                options={accountTypeOptions}
              />
              <Tooltip
                tooltipPlacement="right"
                text="Choose the proper usage. Use a 'Day Account' to deposit and trade within the same trading day. Use an 'Overnight Account' to prioritize depositing funds in advance of trading hours (often the night before) on the day of execution. With an 'Overnight Account' the market rate at the time of trading will be automatically."
              >
                <InfoCircleOutlined />
              </Tooltip>
              <Spacer size={20}></Spacer>
              <Card>
                <Text label="Execution Date" weight="bold" />
                <Spacer size={15}></Spacer>
                <DatePicker
                  disabledDate={disabledDate}
                  style={{ width: "100%" }}
                  defaultValue={date}
                  onChange={onDatePick}
                  format={"DD/MM/YYYY"}
                />
              </Card>
            </div>
            <Spacer size={40} />
            <div style={{ display: "flex", justifyContent: "normal" }}>
              <Button
                onClick={() => {
                  dispatch(setToInitialFormState());
                  previousStepHandler();
                }}
                type="secondary"
                label="Previous"
                icon={{
                  name: "leftArrow",
                  position: "left"
                }}
              />
              {ConfirmModal ? (
                <Button
                  disabled={enableButton ? false : true}
                  type="primary"
                  label={confirmBtnLabel}
                  style={{ marginLeft: "20px" }}
                  icon={{
                    name: "rightArrow",
                    position: "right"
                  }}
                  onClick={() => dispatch(showModalAction(true))}
                />
              ) : (
                <Button
                  disabled={enableButton ? false : true}
                  onClick={nextStepHandler}
                  type="primary"
                  label="Continue"
                  style={{ marginLeft: "20px" }}
                  icon={{
                    name: "rightArrow",
                    position: "right"
                  }}
                />
              )}
            </div>
          </Col>
          <Col className="gutter-row" span={12}>
            <Card>
              <Text label="Optional Remarks" weight="bold" />
              <Spacer size={15}></Spacer>
              <Input
                label="Remarks"
                name="remarks"
                type="textarea"
                size="medium"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  dispatch(updateFormValue({ remarks: event.target.value }));
                }}
              />
            </Card>
          </Col>
        </Row>
      </Form>
      {ConfirmModal && <ConfirmModal show={showModal} />}
    </div>
  );
};

export default DepositAmount;
