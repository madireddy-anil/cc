import React, { useEffect, useMemo, useState } from "react";
import {
  Accordions,
  Col,
  Icon,
  Row,
  Select,
  Table
} from "@payconstruct/design-system";
import { useAppDispatch, useAppSelector } from "../.././redux/hooks/store";
import {
  selectClients,
  selectTimezone
} from "../.././config/general/generalSlice";
import "./Trades.css";
import { useGetTradesQuery } from "../../services/tradesService";
import { Tag } from "@payconstruct/design-system/dist/components/atoms/Tag/tag";
import { TableWrapper } from "../../components/Wrapper/TableWrapper";
import PageWrapper from "../../components/Wrapper/PageWrapper";
import { TradeHeader } from "./Components/TradeHeader";
import { FilterDrawerDom } from "./Components/TradeDrawer/TradesDrawer";
import { Pagination } from "../../components/Pagination/Pagination";
import { Spacer } from "../../components/Spacer/Spacer";
import { useNavigate } from "react-router-dom";

import {
  changePageAction,
  EFXOrder,
  filterListAction,
  selectTrades,
  setListAction
} from "../../config/trades/tradeSlice";
import { FormattedNumber, useIntl } from "react-intl";
import { Spinner } from "../../components/Spinner/Spinner";
import { useGetCurrenciesQuery } from "../../services/currencies";
import { setCurrencies } from "../../config/currencies/currenciesSlice";
import { resetAction } from "./Deposit/DepositActions";
import {
  formatEntitiesForOptionSet,
  getOrderStatusWithCamelCase
} from "../../utilities/transformers";
import { formatZoneDate } from "../../utilities/transformers";
import { camelize } from "../../config/transformer";
import {
  EntityClient,
  useGetAllClientsQuery
} from "../../services/ControlCenter/endpoints/entitiesEndpoint";
import { useGetIndicativeRateQuery } from "../../services/routesService";
import IndicativeRateComponent from "./Components/IndicativeRate/IndicativeRate";
import { TradeFilter } from "./Components/TradeFilter";
import { Select as SelectAntd } from "antd";

const { Option } = SelectAntd;

const Trades: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const timezone = useAppSelector(selectTimezone);
  const {
    tradesHistory: { currentPageList, filteredList, pageNumber }
  } = useAppSelector(selectTrades);

  const {
    tradeList = [],
    isLoading,
    isFetching
  } = useGetTradesQuery("", {
    selectFromResult: ({ data, isLoading, isFetching }) => ({
      tradeList: data?.orders,
      isLoading,
      isFetching
    }),
    refetchOnMountOrArgChange: 15,
    refetchOnFocus: true
  });

  const { currencies } = useGetCurrenciesQuery("", {
    selectFromResult: ({ data }) => ({
      currencies: data?.data
    })
  });

  useEffect(() => {
    dispatch(filterListAction(tradeList));
    dispatch(setListAction(tradeList));
    dispatch(setCurrencies(currencies));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const [sortedTradeList, setSortedTradeList] = useState(tradeList);

  useMemo(() => {
    const newTradeListing = [...filteredList];
    const sortedTrade = newTradeListing
      .slice()
      .sort(
        (a, b) =>
          new Date(b.executionDate).valueOf() -
          new Date(a.executionDate).valueOf()
      );
    setSortedTradeList(sortedTrade);
  }, [filteredList]);

  const columns = [
    {
      key: "executionDate",
      title: "Execution Date",
      dataIndex: "executionDate",
      defaultSortOrder: "descend",
      sortDirections: ["ascend", "descend"],
      render: (text: string, record: any, index: any) => {
        return <span key={text}>{formatZoneDate(text, timezone)}</span>;
      },
      sorter: (a: EFXOrder, b: EFXOrder) =>
        new Date(a.executionDate).valueOf() -
        new Date(b.executionDate).valueOf()
    },
    { key: "clientName", title: "Client Name", dataIndex: "clientName" },
    // { key: "account", title: "Account", dataIndex: "accountType" },
    {
      key: "orderReference",
      title: "Order Reference",
      dataIndex: "orderReference",
      sortDirections: ["ascend", "descend"],
      sorter: (a: EFXOrder, b: EFXOrder) =>
        a.orderReference.length - b.orderReference.length
    },
    {
      key: "beneficiary",
      title: "Beneficiary Name",
      dataIndex: "beneficiaryName"
    },
    {
      key: "depositType",
      title: "Deposit Type",
      dataIndex: "depositType",
      render: (text: string, record: any) => {
        return <>{camelize(text)}</>;
      }
    },
    // { key: "deposit_cy", title: "Deposit Currency", dataIndex: "buyCurrency" },
    {
      key: "deposit_amount",
      title: "Deposit Amount",
      dataIndex: "buyAmount",
      render: (value: number, record: EFXOrder) => {
        return (
          <FormattedNumber
            value={value}
            // eslint-disable-next-line
            style="currency"
            currency={record.buyCurrency}
          />
        );
      },
      sortDirections: ["ascend", "descend"],
      sorter: (a: EFXOrder, b: EFXOrder) => a.buyAmount - b.buyAmount
    },
    {
      key: "sellCurrency",
      title: "Settlement Currency",
      dataIndex: "sellCurrency",
      sortDirections: ["ascend", "descend"],
      render: (text: string, record: any) => {
        return (
          <>{`${text} (${
            record.mainSellCurrency ? record.mainSellCurrency : "ETH"
          })`}</>
        );
      },
      sorter: (a: EFXOrder, b: EFXOrder) =>
        a.sellCurrency.length - b.sellCurrency.length
    },
    {
      key: "status",
      title: "Status",
      dataIndex: "status",
      render: (text: string, record: any, index: any) => {
        return (
          <span key={text}>
            {text === null ? (
              <Tag
                key={index}
                isPrefix
                label={getOrderStatusWithCamelCase(text)}
                prefix={<Icon name="closeCircle" />}
              />
            ) : (
              <Tag
                key={index}
                isPrefix
                label={getOrderStatusWithCamelCase(text)}
                prefix={<Icon name="checkCircle" />}
              />
            )}
          </span>
        );
      }
    }
  ];

  const [counter, setCounter]: any = React.useState(0);
  const pageSize = pageNumber ? pageNumber : 25;
  const intl = useIntl();
  const [selectedEntityId, setSelectedEntityId] = useState<string>("");
  const { data, isFetching: isFetchingIndicativeRate } =
    useGetIndicativeRateQuery({ clientId: selectedEntityId });
  const clients = tradeList.map((trade: any) => [
    trade.clientId,
    trade.clientName
  ]);
  const clientListOptions = [
    // @ts-ignore
    ...new Map(clients.map((item) => [item[0], item])).values()
  ];
  const indicativeRateList = selectedEntityId ? data?.indicativeRate : [];

  return (
    <PageWrapper>
      <FilterDrawerDom
        tradeList={tradeList}
        setCounter={setCounter}
        key={`drawer_${counter}`}
      />
      <TradeHeader
        newTrade={() => {
          // dispatch(updateTopBarShow(true));
          dispatch(resetAction());
          navigate("/order/deposit");
        }}
        downloadXLS={() => {
          console.log("Download XLS");
        }}
      ></TradeHeader>
      <Col className="indicative-rate" span={24}>
        <Accordions
          accordionType="simple"
          header="Indicative Rates"
          text={
            <>
              {/* {isLoadingIndicativeRate ? (
                <Spinner />
              ) : ( */}
              <>
                <Row>
                  <Col span={24}>
                    <Select
                      style={{
                        width: "30%",
                        position: "absolute",
                        right: "0",
                        top: "-64px"
                      }}
                      filterOption={(input, option) =>
                        (option!.children as unknown as string)
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      onChange={(value) => {
                        setSelectedEntityId(value);
                      }}
                      optionlist={clientListOptions}
                      placeholder={intl.formatMessage({
                        id: "selectEntity",
                        defaultMessage: "Select Entity"
                      })}
                      allowClear
                    />
                  </Col>
                </Row>
                <IndicativeRateComponent
                  selectedEntityId={selectedEntityId}
                  indicativeRates={indicativeRateList || []}
                  isLoading={isFetchingIndicativeRate}
                />
              </>
              {/* )} */}
            </>
          }
        />
      </Col>
      <Spacer size={15} />
      <TradeFilter />
      <TableWrapper>
        {isLoading || isFetching ? (
          <Spinner />
        ) : (
          <Table
            rowKey={(record) => record.id}
            scroll={{ x: true }}
            dataSource={currentPageList}
            tableColumns={columns}
            tableSize="medium"
            pagination={false}
            rowClassName="trade-row--clickable"
            onRow={({ id }, rowIndex) => {
              return {
                onClick: () => {
                  navigate(`/order/${id}`);
                }
              };
            }}
          />
        )}
      </TableWrapper>
      <Spacer size={40} />
      <Pagination
        list={sortedTradeList}
        onChange={(list) => {
          dispatch(changePageAction(list));
        }}
        pageSize={pageSize}
        pageOption={["5", "25", "50", "100"]}
      />
    </PageWrapper>
  );
};

export { Trades as default };
