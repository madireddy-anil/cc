import { FC, useEffect, useState } from "react";
import {
  Accordions,
  Button,
  Status,
  Notification
} from "@payconstruct/design-system";
import { Spinner } from "../../../../components/Spinner/Spinner";
import { EFXOrder, EFXOrderFinancials } from "@payconstruct/pp-types";
import { ModalSpreadForm, PriceCalculation } from "../RouteOptions/Components";
import { Empty } from "antd";

import style from "./RouteOptions.module.css";
import {
  useAdjustPriceMutation,
  useSetPriceApproveMutation
} from "../../../../services/routesService";
import { useOvernight } from "../../../../customHooks/useOvernight";
import { useAppSelector, useAppDispatch } from "../../../../redux/hooks/store";
import {
  setAccordion,
  selectAccordion
} from "../../../../config/general/generalSlice";
import { rateFormat, fractionFormat } from "../../../../utilities/transformers";
import moment from "moment";

interface PriceCalculationAccordionProps {
  order: EFXOrder;
  orderId: string;
  financials?: EFXOrderFinancials;
  isLoadingFinancials: boolean;
  hasSelectedRoute: boolean;
  isPriceConfirmed: boolean;
  fetchFinancials: () => void;
  refetchDeposits: () => void;
  refetchOrder: () => void;
  setPriceConfirmed: (value: boolean) => void;
}
const PriceCalculationAccordion: FC<PriceCalculationAccordionProps> = ({
  order,
  orderId,
  financials,
  isLoadingFinancials,
  hasSelectedRoute = false,
  isPriceConfirmed,
  fetchFinancials,
  refetchDeposits,
  refetchOrder,
  setPriceConfirmed
}) => {
  const [priceApproved] = useSetPriceApproveMutation();
  const [adjustPrice] = useAdjustPriceMutation();

  const [showInputs, setShowInputs] = useState(false);
  const [showSpreadForm, setShowSpreadForm] = useState(false);
  const [isAdjustedPrice, setIsAdjustedPrice] = useState(true);
  const [confirmProcessing, setConfirmProcessing] = useState(false);
  const [pricingTitle, setPricingTitle] = useState("No Pricing");

  useEffect(() => {
    if (!financials) return setPricingTitle("No Pricing yet");

    if (financials?.status === "approved" || financials?.status === "pending")
      return setPricingTitle("Price Calculation");

    if (
      financials?.status === "overnight_approved" ||
      financials?.status === "overnight_pending"
    )
      return setPricingTitle("Pricing auto accepted");
  }, [financials]);

  //@ts-ignore
  const { isDay1 } = useOvernight(orderId);

  const dispatch = useAppDispatch();
  const accordion = useAppSelector(selectAccordion);

  const setSpreadData = (data: string) => {
    if (!data) return;
    priceAdjust(data);
  };

  const priceAdjust = async (data: string) => {
    const payload = {
      exchange: parseInt(data)
    };
    try {
      setIsAdjustedPrice(false);
      await adjustPrice({ id: orderId, payload }).unwrap();
      setShowInputs(false);
      setIsAdjustedPrice(true);
      fetchFinancials();
      Notification({
        message: "Price Adjust",
        description: "Adjust Price has been submitted successfully",
        type: "success"
      });
    } catch (err) {
      setIsAdjustedPrice(true);
      setShowInputs(false);
      Notification({
        message: "Error",
        description: "An Error Occurred",
        type: "error"
      });
    }
  };

  const confirmPrice = async (id: string) => {
    try {
      setConfirmProcessing(true);
      await priceApproved({ id }).unwrap();
      setConfirmProcessing(false);
      setShowInputs(false);
      fetchFinancials();
      setPriceConfirmed(true);
      refetchDeposits();
      setTimeout(refetchOrder, 2000);
      Notification({
        message: "Price Approve",
        description: "Approve Price has been submitted successfully",
        type: "success"
      });
    } catch (err: any) {
      setConfirmProcessing(false);
      Notification({
        message: "Error",
        description: "An Error Occurred",
        type: "error"
      });
    }
  };

  const handleAccordionChange = (key: string, uncollapse: boolean) => {
    const obj = { ...accordion, [key]: uncollapse };
    dispatch(setAccordion(obj));
  };

  const copyShareableContent = () => {
    if (!navigator.clipboard) {
      // cannot copy
      return;
    }

    const date = moment();
    const exchangeCurrency = order.financials.exchange?.client.sellCurrency;
    const exchangeAmount = order.financials.exchange?.client.sellAmount;
    const invertedRate =
      1 / parseFloat(order.financials.exchange?.client.rate || "");
    const depositAmount =
      financials?.exchange?.vendor?.at(0)?.deposits?.at(0)?.depositAmount || "";
    const text = `
    Indicative Rate Quote

    Date: ${date.format("DD/MM/YYYY")}
    Client: ${order.clientName}
    Deposit Currency & Amount: ${
      financials?.exchange?.vendor[0].sellCurrency
    } ${fractionFormat(depositAmount)}
    Client All-In-Rate:
      ${financials?.exchange?.client.pair}: ${rateFormat(
      financials?.exchange?.client.rate || ""
    ).toString()}
      ${financials?.exchange?.vendor.at(0)?.buyCurrency}.${
      financials?.exchange?.vendor.at(0)?.sellCurrency
    }: ${rateFormat(invertedRate.toString()).toString()}
    Exchanged Currency & Amount: ${exchangeCurrency} ${fractionFormat(
      exchangeAmount
    )}`;
    navigator.clipboard.writeText(text).then(
      () => {
        Notification({
          message: "Success",
          description: "Copying to clipboard was successful!",
          type: "success"
        });
      },
      () => {
        Notification({
          message: "Error",
          description: "Could not copy text.",
          type: "error"
        });
      }
    );
  };

  return (
    <>
      {showSpreadForm && (
        <ModalSpreadForm
          setShowSpreadForm={setShowSpreadForm}
          routeData={financials}
          orderId={orderId}
          setRouteData={(data) => {
            fetchFinancials();
          }}
        />
      )}
      <Accordions
        onChange={(e) =>
          handleAccordionChange("unCollapsePriceCalculation", Boolean(e.length))
        }
        unCollapse={accordion?.unCollapsePriceCalculation}
        accordionType="simple"
        header={pricingTitle}
        headerRight={
          !financials || (
            <Status
              tooltipText={
                financials?.status === "pending" ||
                financials?.status === "overnight_pending"
                  ? "Pricing Pending"
                  : financials?.status === "overnight_approved"
                  ? "No pricing yet"
                  : "Pricing Approved"
              }
              type={
                financials?.status === "pending" ||
                financials?.status === "overnight_pending"
                  ? "pending"
                  : "approved"
              }
            />
          )
        }
        text={
          isLoadingFinancials || !isAdjustedPrice ? (
            <Spinner />
          ) : (
            <>
              {financials &&
              hasSelectedRoute &&
              (isDay1 || (!isDay1 && order?.depositType === "day")) ? (
                <div className={style["price-calculation-content"]}>
                  <PriceCalculation
                    financial={financials}
                    orderId={orderId}
                    showInputs={showInputs}
                    setSpreadData={setSpreadData}
                  />
                  <div className={style["button-wrapper"]}>
                    <Button
                      type="primary"
                      label="Confirm Pricing"
                      style={{ marginRight: 15 }}
                      onClick={() => confirmPrice(orderId)}
                      loading={confirmProcessing}
                      disabled={
                        isPriceConfirmed || order?.status === "cancelled"
                      }
                    />
                    <Button
                      type="secondary"
                      label="Adjust Client Spread"
                      style={{ marginRight: 15 }}
                      disabled={
                        isPriceConfirmed || order?.status === "cancelled"
                      }
                      onClick={() => setShowInputs(true)}
                    />
                    <Button
                      type="secondary"
                      label="Share"
                      onClick={() => copyShareableContent()}
                    />
                  </div>
                </div>
              ) : (
                <Empty description={<span>{pricingTitle}</span>} />
              )}
            </>
          )
        }
      />
    </>
  );
};

export { PriceCalculationAccordion };
