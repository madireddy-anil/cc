import {
  Colors,
  CurrencyTag,
  List,
  Modal,
  Text,
  Notification
} from "@payconstruct/design-system";
import { Spacer } from "../../../../components/Spacer/Spacer";
import { Card } from "../Card/Card";
import {
  selectBeneficiary,
  showModalAction
} from "../../../Components/Beneficiary/BeneficiarySlice";
import { useAppDispatch, useAppSelector } from "../../../../redux/hooks/store";
import { isCurrencyPresent } from "../../Helpers/currencyTag";
import {
  CreateTradeResponse,
  useCreateTradeMutation
} from "../../../../services/tradesService";
import { useNavigate } from "react-router-dom";
import {
  selectTimezone,
  setLoading
} from "../../../../config/general/generalSlice";
import { selectDepositForm } from "../../Deposit/DepositSlice";
import styles from "./confirmTrade.module.css";
import { useEffect } from "react";
import { selectAccountSelection } from "../../../Components/AccountSelection/AccountSelectionSlice";
import {
  formatDate,
  formatZoneDate,
  numberFormat
} from "../../../../utilities/transformers";

const ConfirmTradeBody: React.FC = () => {
  const {
    executionDate,
    buyAmount,
    sellCurrency = "",
    mainSellCurrency,
    buyCurrency,
    remarks
  } = useAppSelector(selectDepositForm);

  const selectedAccount = useAppSelector(selectAccountSelection);
  const { beneficiaryName } = useAppSelector(selectBeneficiary);
  const timezone = useAppSelector(selectTimezone);

  return (
    <div>
      <p>Please review and confirm the financial details of your order.</p>
      <Card
        style={{
          borderColor: "transparent",
          backgroundColor: Colors.grey.neutral50
        }}
      >
        <Text label="You Sell" weight="bold" />
        <Spacer size={15}></Spacer>
        <Card style={{ borderColor: Colors.grey.neutral100, padding: "20px" }}>
          <div className={styles["currency-card"]}>
            <p className={styles["currency-card__value"]}>
              {numberFormat(buyAmount ?? 0)}
            </p>
            <CurrencyTag
              prefix={isCurrencyPresent(buyCurrency)}
              currency={buyCurrency ? buyCurrency : ""}
            />
          </div>
          <Text
            className={styles["currency-card__account"]}
            label={`${selectedAccount?.accountName}`}
            weight="regular"
            size="small"
            color={Colors.grey.neutral500}
          />
        </Card>
        <Spacer size={20}></Spacer>
        <Text label="You Buy" weight="bold" />
        <Spacer size={15}></Spacer>
        <Card style={{ borderColor: Colors.grey.neutral100, padding: "20px" }}>
          <div className={styles["currency-card"]}>
            <CurrencyTag
              prefix={isCurrencyPresent(sellCurrency)}
              currency={`${sellCurrency}(${
                mainSellCurrency ? mainSellCurrency : "ETH"
              })`}
            />
          </div>
          <Text
            className={styles["currency-card__account"]}
            label={`${beneficiaryName ?? ""}`}
            weight="regular"
            size="small"
            color={Colors.grey.neutral500}
          />
        </Card>
        <List
          background={false}
          listType="horizontal"
          src={[
            {
              label: "Execution Date",
              value: formatZoneDate(executionDate, timezone)
            },
            {
              label: "Remarks",
              value: `${remarks}`
            }
          ]}
        />
      </Card>
    </div>
  );
};

interface ConfirmTradeProps {
  show: boolean;
}

const ConfirmTrade: React.FC<ConfirmTradeProps> = ({ show }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [newTrade, { isLoading }] = useCreateTradeMutation();

  useEffect(() => {
    if (isLoading) {
      dispatch(setLoading(true));
    } else {
      dispatch(setLoading(false));
    }
  }, [dispatch, isLoading]);

  const depositForm = useAppSelector(selectDepositForm);
  const onTradeConfirmation = async () => {
    try {
      await newTrade(depositForm)
        .unwrap()
        .then((tradeStatus: CreateTradeResponse) => {
          navigate(
            `/order/deposit/status?id=${tradeStatus.id}&orderReference=${tradeStatus.orderReference}`
          );
        });
      dispatch(setLoading(false));
      dispatch({ type: "reset/deposit" });
    } catch (err) {
      console.log(err);
      dispatch(setLoading(false));
      Notification({
        message: "Trade Rejected",
        description: `MOCKED ERROR, `,
        type: "error"
      });
    }
  };

  return (
    <Modal
      modalView={show}
      title={"Exotic FX Order Confirmation"}
      onCancelText={"Cancel"}
      onOkText={"Confirm"}
      onClickCancel={() => {
        dispatch(showModalAction(false));
      }}
      onClickOk={() => {
        onTradeConfirmation();
      }}
      description={<ConfirmTradeBody />}
    />
  );
};

export { ConfirmTrade };
