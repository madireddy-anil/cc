import { FC } from "react";
import {
  Text,
  Colors,
  Col,
  Row,
  Accordions
} from "@payconstruct/design-system";
import css from "./PriceCalculation.module.css";
import { EFXOrderFinancials } from "@payconstruct/pp-types";
import { PricingCalculationData } from "./PricingCalculationData";
import { PricingCalculationClient } from "./PricingCalculationClient";
import { fractionFormat } from "../../../../../utilities/transformers";
import { Space } from "antd";
import { Spacer } from "../../../../../components/Spacer/Spacer";
import {
  useAppSelector,
  useAppDispatch
} from "../../../../../redux/hooks/store";
import {
  setAccordion,
  selectAccordion
} from "../../../../../config/general/generalSlice";

interface PropTypes {
  financial?: EFXOrderFinancials;
  orderId: string;
  showInputs: boolean;
  setSpreadData: any;
}

const customStyle = {
  padding: `20px 0 4px 0`,
  background: Colors.grey.neutral100
};

const PriceCalculation: FC<PropTypes> = ({
  financial,
  orderId,
  showInputs,
  setSpreadData
}) => {
  const swapPair = (pair: any) => {
    if (!pair) return;
    const tmp = pair.split(".");
    return tmp[1].concat(".", tmp[0]);
  };
  const localPair = swapPair(financial?.local?.client?.pair);
  const exchangePair = swapPair(financial?.exchange?.client?.pair);
  const dispatch = useAppDispatch();
  const accordion = useAppSelector(selectAccordion);

  const handleAccordionChange = (key: string, uncollapse: boolean) => {
    const obj = { ...accordion, [key]: uncollapse };
    dispatch(setAccordion(obj));
  };

  return (
    <div className={css["pc_main"]}>
      {financial?.local && (
        <Accordions
          // status="completed"
          onChange={(e) =>
            handleAccordionChange("unCollapsePriceLocal", Boolean(e.length))
          }
          unCollapse={accordion?.unCollapsePriceLocal}
          accordionType="simple"
          headerRight={
            <>
              <div className={css["pc_main__accordion-header__right"]}>
                <Text
                  label="Our Profit"
                  size="xsmall"
                  color={Colors.grey.neutral600}
                />
                <Text
                  label={
                    financial?.local?.client?.sellCurrency +
                    " " +
                    fractionFormat(
                      financial?.local?.client?.profit || ""
                    ).toString()
                  }
                  size="medium"
                  color={Colors.grey.neutral800}
                />
              </div>
            </>
          }
          header="Local Leg"
          text={
            <div>
              {
                <>
                  {pricingCalculationHeading(
                    financial?.local?.client?.pair,
                    localPair
                  )}
                  <PricingCalculationData legData={financial?.local} />
                  <PricingCalculationClient
                    clientItem={financial?.local?.client}
                    orderId={orderId}
                    type={"local"}
                    showInputs={showInputs}
                    setSpreadData={setSpreadData}
                  />
                </>
              }
            </div>
          }
        />
      )}
      <Spacer size={15} />
      {financial?.exchange && (
        <Accordions
          // status="completed"
          onChange={(e) =>
            handleAccordionChange("unCollapsePriceExchange", Boolean(e.length))
          }
          unCollapse={accordion?.unCollapsePriceExchange}
          accordionType="simple"
          headerRight={
            <>
              <div className={css["pc_main__accordion-header__right"]}>
                <Text
                  label="Our Profit"
                  size="xsmall"
                  color={Colors.grey.neutral600}
                />
                <Text
                  label={
                    financial?.exchange?.client?.sellCurrency +
                    " " +
                    fractionFormat(
                      financial?.exchange?.client?.profit
                    ).toString()
                  }
                  size="medium"
                  color={Colors.grey.neutral800}
                />
              </div>
            </>
          }
          header="Exchange Leg"
          text={
            <div>
              {
                <>
                  {pricingCalculationHeading(
                    financial?.exchange?.client?.pair,
                    exchangePair
                  )}
                  <PricingCalculationData legData={financial?.exchange} />
                  <PricingCalculationClient
                    clientItem={financial?.exchange?.client}
                    orderId={orderId}
                    type={"exchange"}
                    showInputs={showInputs}
                    setSpreadData={setSpreadData}
                  />
                </>
              }
            </div>
          }
        />
      )}
    </div>
  );
};

const pricingCalculationHeading = (pair: string, invertPair: string) => {
  return (
    <div>
      <Row>
        <Col span={5}>
          <div style={customStyle}>
            <Text label="Counterparty" size="small" />
          </div>
        </Col>
        <Col span={4}>
          <div style={customStyle}>
            <Text label="Deposit Amount" size="small" />
          </div>
        </Col>
        <Col span={4}>
          <div style={customStyle}>
            <Space>
              <Text label="Spread" size="small" />
              <Text label="(bps)" size="xsmall" />
            </Space>
          </div>
        </Col>
        <Col span={4}>
          <div style={customStyle}>
            <Text label="All-In-Rate" size="small" />
          </div>
        </Col>
        <Col span={4}>
          <div style={customStyle}>
            <Text label="Inverted All-In-Rate" size="small" />
          </div>
        </Col>
        <Col span={3}>
          <div style={customStyle}>
            <Text label="Remittance Amount" size="small" />
          </div>
        </Col>
      </Row>
      <Row justify="end">
        <Col span={4}>
          <Text label={pair} size="xsmall" color={Colors.grey.neutral600} />
        </Col>
        <Col span={7}>
          <Text
            label={invertPair}
            size="xsmall"
            color={Colors.grey.neutral600}
          />
        </Col>
      </Row>
    </div>
  );
};

export { PriceCalculation };
