import { Icon, Text, Status, Colors } from "@payconstruct/design-system";
import { Col, Row } from "antd";
import React from "react";
import SVG from "react-inlinesvg";
import classNames from "classnames";
import {
  IndicativeRate,
  IndicativeRateRates
} from "../../../../services/routesService";
import { isCurrencyPresent } from "../../Helpers/currencyTag";
import moment from "moment";
import "./IndicativeRate.css";
import IconFlagNGN from "../../../../assets/icons/icon-flag-NGN.svg";

interface PropTypesItem {
  rate: IndicativeRate;
  selectedEntityId: string;
}

const currencyIcon = (iconName: string): any => {
  const currency = isCurrencyPresent(iconName);
  if (currency) return `flag${currency}`;
  return "error";
};

const IndicativeRateItem: React.FC<PropTypesItem> = ({
  rate,
  selectedEntityId
}) => {
  const rates = rate.rates;

  return (
    <Col
      className="rate-grid-card-container"
      key={`grid`}
      style={{ padding: "0.5rem" }}
    >
      <Col className="rate-grid-card">
        <Row style={{ padding: "10px 10px 0 10px" }}>
          <div className="rate-grid-card-currency">
            {rate.currency && (
              <>
                {rate.currency === "NGN" ? (
                  <SVG
                    src={IconFlagNGN}
                    style={{
                      margin: 4,
                      maxWidth: 11,
                      maxHeight: 11
                    }}
                  />
                ) : (
                  <Icon
                    name={currencyIcon(rate.currency)}
                    size="small"
                    style={{ marginLeft: 0 }}
                  />
                )}
                <Text size="medium" weight="bold" label={rate.currency} />
              </>
            )}
            {!rate.currency && <div className="dot-grey" />}
          </div>
        </Row>
        {rates.map((item: IndicativeRateRates, index: number) => {
          const isLast = index < rates.length - 1;
          const isExpired = item.expiresAt && moment(item.expiresAt).isAfter();
          const inverseRate = isNaN(parseInt(item.inverseRate))
            ? item.inverseRate === "NaN"
              ? "N/A"
              : "0.0000"
            : item.inverseRate.toString().substring(0, 16);
          const rate = isNaN(parseInt(item.rate))
            ? item.rate === "NaN"
              ? "N/A"
              : "0.0000"
            : item.rate.toString().substring(0, 16);
          const disabledColor = !selectedEntityId
            ? Colors.grey.neutral500
            : Colors.black.primary;

          return (
            <React.Fragment key={index}>
              <Row
                align="middle"
                justify="start"
                wrap={false}
                style={{
                  padding: "0px 5px 0 15px",
                  marginBottom: "10px",
                  marginTop: "10px"
                }}
              >
                <Col
                  style={{ display: "flex", alignItems: "center", width: 50 }}
                >
                  <Text
                    size="small"
                    className="text-value"
                    label={item.quoteCurrency}
                    style={{ color: disabledColor }}
                  />
                </Col>
                <Col
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    flexDirection: "column",
                    marginRight: "auto"
                  }}
                >
                  <div>
                    <Text
                      className="text-value"
                      size="small"
                      label={inverseRate}
                      style={{ color: Colors.black.primary }}
                    />
                  </div>
                  <div>
                    <Text
                      className="text-value"
                      size="small"
                      label={rate}
                      style={{ color: Colors.black.primary }}
                    />
                  </div>
                </Col>
                <Col style={{ display: "flex", alignItems: "center" }}>
                  {item.expiresAt !== null ? (
                    isExpired === false ? (
                      <Status type="rejected" tooltipText="Expired rate" />
                    ) : (
                      <Status type="approved" tooltipText="Active rate" />
                    )
                  ) : (
                    ""
                  )}
                </Col>
              </Row>
              {isLast && (
                <div
                  style={{
                    borderBottom: `1px solid ${Colors.grey.neutral100}`
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </Col>
    </Col>
  );
};

export default IndicativeRateItem;
