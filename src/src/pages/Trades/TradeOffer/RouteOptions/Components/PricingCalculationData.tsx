import { FC } from "react";
import { Col, Row, Text } from "@payconstruct/design-system";
import { Financials } from "@payconstruct/pp-types";
import {
  rateFormat,
  fractionFormat
} from "../../../../../utilities/transformers";

interface PropTypes {
  legData: Financials;
}

const PricingCalculationData: FC<PropTypes> = (legData) => {
  return (
    <div>
      {legData?.legData?.vendor?.map((item, i: number) => {
        const {
          // @ts-ignore
          name,
          spread,
          rate,
          buyCurrency,
          sellCurrency,
          sellAmount,
          buyAmount
        } = item;
        const invertedRate = 1 / parseFloat(rate);
        return (
          <div key={`pr_${i}`}>
            <Row>
              <Col span={5}>
                <Text label={`Vendor - ${name}`} size="medium" />
              </Col>
              <Col span={4}>
                <Text
                  label={
                    sellCurrency +
                    " " +
                    fractionFormat((sellAmount || "").toString())
                  }
                  size="medium"
                />
              </Col>
              <Col span={4}>
                <Text label={(spread || "").toString()} size="medium" />
              </Col>
              <Col span={4}>
                <Text label={rateFormat(rate)} size="medium" />
              </Col>
              <Col span={4}>
                <Text
                  label={rateFormat((invertedRate || "").toString())}
                  size="medium"
                />
              </Col>
              <Col span={3}>
                <Text
                  label={
                    buyCurrency +
                    " " +
                    fractionFormat((buyAmount || "").toString())
                  }
                  size="medium"
                />
              </Col>
            </Row>
          </div>
        );
      })}
    </div>
  );
};

export { PricingCalculationData };
