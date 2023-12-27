import React from "react";
import { Space } from "antd";
import {
  Text,
  Colors,
  Icon,
  // Tooltip,
  CurrencyTag
} from "@payconstruct/design-system";
import { TableWrapper } from "../../../../components/Wrapper/TableWrapper";
import { Spacer } from "../../../../components/Spacer/Spacer";
import { isCurrencyPresent } from "../../../Components/Helpers/currencyTag";
import { selectCurrencies } from "../../../../config/currencies/currenciesSlice";
import { useAppSelector } from "../../../../redux/hooks/store";
import { getCurrencyName } from "../../../../utilities/transformers";

interface BalanceDetailProps {
  total: string;
  available: string;
  accountName: string;
  currency?: string;
  mainCurrency?: string;
  issuerEntityCompanyName: string;
}

const BalanceDetail: React.FC<BalanceDetailProps> = ({
  total,
  available,
  currency,
  mainCurrency,
  accountName,
  issuerEntityCompanyName
}) => {
  // const [infoIconColor, setInfoIconColor] = React.useState(
  //   Colors.grey.neutral300
  // );
  // const toolTipLabel = "This account is offered by";
  const availableBalanceLabel = "Available Balance";
  const totalBalanceLabel = "Total Balance";

  const currenciesList = useAppSelector(selectCurrencies);

  const currencyStyle = {
    backgroundColor: Colors.grey.inactive
  };

  const currencyName = (iconName: string | undefined): any => {
    const currency = iconName && isCurrencyPresent(iconName);
    if (currency) return currency;
    return "error";
  };

  const currencyWithMainCurrencyName = (iconName: string | undefined): any => {
    const currency = iconName && isCurrencyPresent(iconName);
    if (currency) {
      if (mainCurrency) {
        return `${currency}(${mainCurrency})`;
      }
      return currency;
    }
    return "error";
  };

  const currencyIcon = (iconName: string | undefined): any => {
    const currency = iconName && isCurrencyPresent(iconName);
    if (currency) return `flag${currency}`;
    return "error";
  };

  return (
    <TableWrapper>
      <div
        style={{
          display: "flex",
          alignItems: "center"
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            flexBasis: 0
          }}
        >
          <Space>
            <Text size="xlarge" weight="bold" label={total} />
            {/* <CurrencyTag
              currency={currency ?? "N/A"}
              prefix={isCurrencyPresent(currency ?? "")}
            /> */}
            
            <Space
              className="account-grid-card-currency"
              size={1}
              style={currencyStyle}
            >
              <CurrencyTag
                currency={currencyWithMainCurrencyName(currency)}
                prefix={currencyName(currency)}
              />
            </Space>
          </Space>
          <Space size={2} style={{ marginTop: 5 }}>
            {/* <Text
              size="small"
              color={Colors.grey.neutral500}
              label={accountName}
            /> */}
            {/* <Text size="small" color={Colors.grey.neutral500} label="|" /> */}
            <Text
              size="small"
              color={Colors.grey.neutral500}
              label="This account is issued by"
            />
            <Text
              size="small"
              color={Colors.grey.neutral500}
              label={issuerEntityCompanyName}
            />
            {/* <Tooltip
              text={
                <span
                  style={{
                    display: "inline-block",
                    fontSize: "1.2rem",
                    lineHeight: "1.6rem",
                    color: Colors.white.primary,
                    textAlign: "center"
                  }}
                >
                  {toolTipLabel}
                  <br />
                  {issuerEntityCompanyName}
                </span>
              }
              bgColor="rgba(0,0,0,0.85)"
            >
              <div
                style={{
                  lineHeight: 0,
                  cursor: "pointer"
                }}
                onMouseEnter={() => setInfoIconColor(Colors.blue.blue500)}
                onMouseLeave={() => setInfoIconColor(Colors.grey.neutral300)}
              >
                <Icon color={infoIconColor} name="info" size="extraSmall" />
              </div>
            </Tooltip> */}
          </Space>
        </div>
        <BalanceBlock
          label={availableBalanceLabel}
          value={available}
          hasDivider
        />
        <BalanceBlock label={totalBalanceLabel} value={total} />
      </div>
    </TableWrapper>
  );
};

interface BalanceBlockProps {
  label: string;
  value: string;
  hasDivider?: boolean;
}

const BalanceBlock: React.FC<BalanceBlockProps> = ({
  label,
  value,
  hasDivider
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        ...(hasDivider && {
          marginRight: 25,
          paddingRight: 25,
          borderRight: `1px solid ${Colors.grey.outline}`
        })
      }}
    >
      <Text size="small" color={Colors.grey.neutral500} label={label} />
      <Spacer size={8} />
      <Text size="medium" color={Colors.grey.neutral700} label={value} />
    </div>
  );
};

export default BalanceDetail;
