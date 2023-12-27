import { Button, Text } from "@payconstruct/design-system";
import { EFXOrder } from "@payconstruct/pp-types";
import { Card } from "../../Components/Card/Card";
import styles from "../tradeOffer.module.css";
import { Statistic } from "antd";
import {
  fieldCurrencyFormatter,
  fractionFormat
} from "../../../../utilities/transformers";
import { useGetFinancialsQuery } from "../../../../services/routesService";
import { Spinner } from "../../../../components/Spinner/Spinner";
import { AdjustDepositModal } from "../../Components/Modal/AdjustDeposit/AdjustDeposit";
import { useEffect, useState } from "react";
import { useOvernight } from "../../../../customHooks/useOvernight";
import { camelize } from "../../../../config/transformer";
const { Countdown } = Statistic;

interface PaymentDetailsProps {
  trade: EFXOrder;
  hasRoutes: boolean;
  refetchRoutes: () => void;
}
const PaymentDetails: React.FC<PaymentDetailsProps> = ({
  refetchRoutes,
  hasRoutes,
  trade: {
    buyCurrency,
    id,
    status,
    buyAmount,
    sellCurrency,
    mainSellCurrency,
    financials,
    requestedAccountType,
    depositType
  }
}) => {
  const [showAdjustDeposit, setShowAdjustDeposit] = useState(false);
  const { isDay1 } = useOvernight(id);

  const [disableAdjustDepositButton, setDisableAdjustDepositButton] = useState(
    hasRoutes || isDay1
  );

  console.log("isDay1", hasRoutes);
  useEffect(() => {
    setDisableAdjustDepositButton(hasRoutes || isDay1);
  }, [hasRoutes, isDay1]);

  const { isLoading } = useGetFinancialsQuery(
    {
      id
    },
    { skip: status !== "accepted_by_client", refetchOnMountOrArgChange: true }
  );

  const { exchange, clientAllRate } = financials || {};
  const { client } = exchange || {};
  const { sellAmount } = client || {};

  const deadline =
    (financials?.approvedAt
      ? new Date(financials?.approvedAt)
      : new Date()
    ).getTime() +
    1000 * 30 * 60;

  const _buyAmount = fractionFormat(buyAmount ?? buyAmount);

  return (
    <Card>
      <div
        className={styles["space-between"]}
        style={{ alignItems: "baseline" }}
      >
        <p className={styles["trade-offer-card__title"]}>Payment Details</p>
        <Button
          label="Adjust Deposit"
          type="secondary"
          size="small"
          disabled={disableAdjustDepositButton}
          onClick={() => {
            setShowAdjustDeposit(true);
          }}
        />
      </div>
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <div className={styles["space-between"]}>
            <Text size="default" label="You Sell" weight="lighter" />
            <Text
              size="default"
              label={`${buyCurrency} ${_buyAmount}`}
              weight="regular"
            />
          </div>
          <div className={styles["space-between"]}>
            <Text size="default" label="You Buy" weight="lighter" />
            <Text
              size="default"
              label={
                sellCurrency && sellAmount
                  ? `${sellCurrency} (${
                      mainSellCurrency ? mainSellCurrency : "ETH"
                    }) ${fieldCurrencyFormatter(sellAmount, sellCurrency)}`
                  : `${sellCurrency ?? sellCurrency} (${
                      mainSellCurrency ? mainSellCurrency : "ETH"
                    }) --`
              }
              weight="regular"
            />
          </div>
          <div className={styles["space-between"]}>
            <Text
              size="default"
              label="Deposit Account Type"
              weight="lighter"
            />
            <Text
              size="default"
              label={`${
                requestedAccountType === "personal" ? "Personal" : "Corporate"
              }`}
              weight="regular"
            />
          </div>
          <div className={styles["space-between"]}>
            <Text size="default" label="Order Type" weight="lighter" />
            <Text
              size="default"
              label={camelize(depositType)}
              weight="regular"
            />
          </div>
          <div className={styles["space-between"]}>
            <Text size="default" label="Conversion Rate" weight="lighter" />
            <div>
              <Text
                size="default"
                label={`${buyCurrency}.${sellCurrency} ${
                  clientAllRate
                    ? parseFloat(clientAllRate ?? "0").toPrecision(8)
                    : "--"
                }`}
                weight="regular"
              />
              <br />
              <Text
                size="default"
                weight="lighter"
                label={`${sellCurrency}.${buyCurrency} ${
                  clientAllRate
                    ? (1 / parseFloat(clientAllRate ?? "0")).toPrecision(8)
                    : "--"
                }`}
              />
            </div>
          </div>
          {status === "pending_approval_client" && (
            <div className={styles["space-between"]}>
              <Text size="default" label="Expires In" weight="lighter" />
              <Countdown value={deadline} format="mm:ss" />
            </div>
          )}
        </>
      )}
      <AdjustDepositModal
        show={showAdjustDeposit}
        onClickOk={() => {
          setTimeout(() => {
            refetchRoutes();
          }, 2000);
          setShowAdjustDeposit(false);
        }}
        onClickCancel={() => {
          setShowAdjustDeposit(false);
        }}
        id={id}
        amount={buyAmount}
        currency={buyCurrency}
      />
    </Card>
  );
};

export { PaymentDetails };
