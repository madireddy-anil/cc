import React from "react";

import { Space, Row, Col } from "antd";
import { Text, Colors, Icon, CurrencyTag } from "@payconstruct/design-system";
import { Spacer } from "../../../../components/Spacer/Spacer";
import { useNavigate } from "react-router-dom";
import { PaginationDynamic } from "../../../../components/Pagination/PaginationDynamic";

import { Account } from "../../../../services/accountService";
import {
  fractionFormat,
  getCurrencyName
} from "../../../../utilities/transformers";
import { isCurrencyPresent } from "../../../Trades/Helpers/currencyTag";
import { useGetBrandsQuery } from "../../../../services/ControlCenter/endpoints/optionsEndpoint";
import "./AccountList.css";
import { useAppSelector } from "../../../../redux/hooks/store";
import { selectCurrencies } from "../../../../config/currencies/currenciesSlice";
import { updateChildPageView } from "../../../../config/account/accountSlice";
import { useAppDispatch } from "../../../../redux/hooks/store";

interface PropTypes {
  accountsData: Account[];
  handleChangePage: (pageNumber: number, pageSize: number) => void;
  accountsTotal: number;
  // setChildPage: (value: any) => void;
}
type Brand = "payconstruct" | "paymero" | "coinflow";

const gridCardColorStyle = {
  backgroundColor: Colors.white.primary,
  borderColor: Colors.grey.neutral100
};

const currencyStyle = {
  backgroundColor: Colors.grey.inactive
};

const statusStyle = {
  backgroundColor: Colors.green.green50
};

const statusIcon = (iconName: string) => {
  const icons = [
    {
      name: "active",
      icon: "checkCircle"
    },
    {
      name: "inactive",
      icon: "closeCircle"
    },
    {
      name: "closed",
      icon: "closeCircle"
    },
    {
      name: "blocked",
      icon: "exclamationCircleOutline"
    }
  ];

  let icon: any = icons.find((icon) => icon.name === iconName);
  return icon ? icon.icon : "error";
};

const currencyIcon = (iconName: string): any => {
  const currency = isCurrencyPresent(iconName);
  if (currency) return `flag${currency}`;
  return "error";
};

const GridView: React.FC<PropTypes> = ({
  accountsData,
  handleChangePage,
  accountsTotal
  // setChildPage
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const currenciesList = useAppSelector(selectCurrencies);

  const { appliedPaginationProperty } = useAppSelector(
    (state) => state.account
  );

  //TODO Review Pull Rate and possible API Updates
  const { brandsData } = useGetBrandsQuery(
    {},
    {
      refetchOnMountOrArgChange: 60,
      selectFromResult: ({ data, isLoading, isFetching }) => {
        let brands: { [key: string]: string } = {};

        data?.data.brands.forEach((item) => {
          brands[item.id] = item.brand;
        });

        return {
          brandsData: brands,
          isLoading,
          isFetching
        };
      }
    }
  );

  const currencyName = (iconName: string | undefined): any => {
    const currency = iconName && isCurrencyPresent(iconName);
    if (currency) return currency;
    return "error";
  };

  const currencyWithMainCurrencyName = (
    iconName: string | undefined,
    mainCurrency: string
  ): any => {
    const currency = iconName && isCurrencyPresent(iconName);
    if (currency) {
      if (mainCurrency) {
        return `${currency}(${mainCurrency})`;
      }
      return currency;
    }
    return "error";
  };

  const gridList = accountsData.map((account: Account, rowNumber) => {
    const {
      currency,
      id,
      balance,
      accountIdentification,
      accountStatus,
      mainCurrency
    } = account;
    return (
      <Col xs={24} md={24} lg={12} xl={12} key={`grid-${rowNumber}`}>
        <div
          className="account-grid-card"
          style={gridCardColorStyle}
          onClick={() => {
            dispatch(updateChildPageView(true));
            navigate(`/account/${id}`);
            // setChildPage(true);
          }}
        >
          <Row>
            <Col span={22}>
              <Space>
                <Text
                  size="medium"
                  weight="bold"
                  label={fractionFormat(balance?.availableBalance)}
                />
                <Space
                  className="account-grid-card-currency"
                  size={1}
                  style={currencyStyle}
                >
                  <CurrencyTag
                    currency={currencyWithMainCurrencyName(
                      currency,
                      mainCurrency
                    )}
                    prefix={currencyName(currency)}
                  />
                </Space>
              </Space>
              <Spacer size={5} />
              <Space className="card-acc_no">
                <Text
                  color={Colors.grey.neutral500}
                  size="small"
                  label={
                    (accountIdentification?.IBAN ||
                      accountIdentification?.accountNumber) ??
                    "N/A"
                  }
                />
              </Space>
              <Spacer size={5} />
              <Space>
                <Text
                  size="small"
                  label={(brandsData[account.productBrandId] as Brand) ?? "---"}
                />
              </Space>
            </Col>
            <Col style={{ textAlign: "right" }} span={2}>
              <span style={statusStyle} className="account-grid-card-status">
                <Icon name={statusIcon(accountStatus)} size="large" />
              </span>
            </Col>
          </Row>
        </div>
      </Col>
    );
  });

  return (
    <>
      <Row gutter={20}>
        {gridList}
        <Spacer size={40} />
      </Row>
      <PaginationDynamic
        list={accountsData}
        accountsTotal={accountsTotal}
        onChange={handleChangePage}
        /* Using Reducer state */
        pageSize={appliedPaginationProperty.pageSize}
        pageNumber={appliedPaginationProperty.pageNumber}
        pageOption={["5", "10", "15", "50", "100"]}
      />
    </>
  );
};

export default GridView;
