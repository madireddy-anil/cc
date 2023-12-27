import React, { useEffect, useState } from "react";
import {
  ClockCircleFilled,
  CheckCircleFilled,
  CloseCircleFilled
} from "@ant-design/icons";
import {
  Table,
  Colors,
  Text,
  Pagination,
  Tooltip
} from "@payconstruct/design-system";
import { TableWrapper } from "../../../../../../components/Wrapper/TableWrapper";
import {
  selectAccount,
  selectDrawerVisibility,
  selectedTransaction,
  selectTransaction,
  selectTransactions,
  updateDrawerShow
} from "../../../../../../config/account/accountSlice";

import {
  useAppDispatch,
  useAppSelector
} from "../../../../../../redux/hooks/store";
import {
  formatDate,
  formatDateAndTime,
  fractionFormat
} from "../../../../../../utilities/transformers";
import { selectTimezone } from "../../../../../../config/general/generalSlice";
import { Spacer } from "../../../../../../components";
import { Transaction } from "../../../../../../services/accountService";
import AccountDrawer from "../../AccountDrawer";
import _ from "lodash";

interface TransactionsProps {
  accountDetails: any;
}

const Transactions: React.FC<TransactionsProps> = ({ accountDetails }) => {
  const dispatch = useAppDispatch();

  const [dataSource, setDataSource]: any = useState([]);
  const [pageSize, setPageSize]: any = useState(5);
  const [currentPage, setPage]: any = useState(1);
  const [pageData, setPageData]: any = useState([]);

  const txn: any = useAppSelector(selectTransactions);
  const timeZone: string = useAppSelector(selectTimezone);
  const transaction = useAppSelector(selectedTransaction);
  const drawerVisibility = useAppSelector(selectDrawerVisibility);
  const account = useAppSelector(selectAccount);

  const showDrawer = (data: any) => {
    dispatch(selectTransaction(data));
    dispatch(updateDrawerShow(true));
  };

  const handleClose = () => {
    dispatch(updateDrawerShow(false));
  };

  const getCounterParty = (txn: any) => {
    if (
      txn?.payments?.processFlow === "manual_credit_adjustment" ||
      txn?.payments?.processFlow === "manual_debit_adjustment" ||
      txn?.payments?.processFlow === "manual_adjustment_credit" ||
      txn?.payments?.processFlow === "manual_adjustment_debit"
    ) {
      if (
        txn?.payments?.processFlow === "manual_credit_adjustment" ||
        txn?.payments?.processFlow === "manual_debit_adjustment"
      ) {
        return _.startCase(_.toLower(txn?.payments?.processFlow));
      } else if (txn?.payments?.processFlow === "manual_adjustment_credit") {
        return "Manual Credit Adjustment";
      } else {
        return "Manual Debit Adjustment";
      }
    } else if (txn?.payments?.isOutbound) {
      return txn?.payments?.creditor?.creditorName;
    } else {
      return txn?.payments?.debtor?.debtorName;
    }
  };

  const getAmountPrefix = (txn: any) => {
    if (
      txn?.debitCredit === "credit" ||
      txn?.blockUnblock === "unblock" ||
      txn?.promiseUnpromise === "promise"
    ) {
      return "+";
    }
    return "-";
  };

  const getTransactionType = (txn: Transaction) => {
    if (
      txn?.payments?.processFlow === "manual_credit_adjustment" ||
      txn?.payments?.processFlow === "manual_debit_adjustment"
    ) {
      return "Balance Adjustment";
    }

    if (!txn?.payments?.internalPayment) {
      if (txn?.payments?.isOutbound) {
        if (
          txn?.payments?.debtorAccountType !== "external" &&
          txn?.payments?.creditorAccountType === "external"
        ) {
          return "Outbound Transfer";
        }
      } else {
        if (
          txn?.payments?.debtorAccountType === "external" &&
          txn?.payments?.creditorAccountType !== "external"
        ) {
          return "Inbound Transfer";
        }
      }
    } else {
      return "Balance Transfer";
    }
  };

  useEffect(() => {
    let ds = [];

    if (txn && txn.transactions) {
      let n = 0;
      for (let i of txn.transactions) {
        // if (Object.keys(i?.payments).length < 1) continue;
        const credit = !i?.debitCredit || i?.debitCredit === "credit";
        const date = i?.createdAt
          ? formatDateAndTime(i?.createdAt, timeZone)
          : "";
        const tmp = {
          ...i,
          key: `t_${n++}`,
          date,
          valueDate: i?.valueDate ? formatDate(i?.valueDate, timeZone) : "",
          receivedOn: "",
          description: credit ? "Fund" : "Fund debit",
          amountInstructed: i?.payments?.debitAmount
            ? fractionFormat(i?.payments?.debitAmount)
            : "",
          amountReceived: i?.payments?.creditAmount
            ? fractionFormat(i?.payments?.creditAmount)
            : "",
          formattedAmount: `${getAmountPrefix(i)} ${fractionFormat(i?.amount)}`,
          counterparty: getCounterParty(i),
          processFlow: i?.payments?.processFlow,
          currency: credit
            ? i?.payments?.creditCurrency
            : i?.payments?.debitCurrency,
          balance: i?.balance,
          formattedBalance: fractionFormat(i?.balance),
          formatedAvailableBalance: fractionFormat(i?.availableBalance),
          feesAmount:
            i?.payments?.fees?.liftingFeeAmount !== undefined
              ? fractionFormat(i?.payments?.fees?.liftingFeeAmount)
              : "",
          feesCurrency: i?.payments?.fees?.liftingFeeCurrency
            ? i?.payments?.fees?.liftingFeeCurrency
            : "",
          exchangeRate: i?.payments?.foreignExchange?.allInRate
            ? i?.payments?.foreignExchange?.allInRate
            : "",
          status: i?.status,
          accountNumber: credit
            ? i?.payments?.creditorAccount
            : i?.payments?.debtorAccount,
          bankInfo: credit
            ? i?.payments?.creditor?.creditorName
            : i?.payments?.debtor?.debtorName,
          type: getTransactionType(i),
          transactionReference: i?.reference ?? ""
        };
        ds.push(tmp);
      }
      setDataSource(ds);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txn]);

  useEffect(() => {
    const pd = dataSource.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );
    setPageData(pd);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSource, currentPage, pageSize]);

  const tableColumns = [
    {
      dataIndex: "date",
      key: "date",
      title: "Date"
    },
    {
      dataIndex: "remarks",
      key: "description",
      title: "Description",
      textWrap: "word-break",
      ellipsis: true,
      render: (text: string) => (
        <Tooltip tooltipPlacement="topLeft" text={text}>
          {text}
        </Tooltip>
      )
    },
    {
      dataIndex: "transactionReference",
      key: "transactionReference",
      title: "Transaction Reference",
      textWrap: "word-break",
      ellipsis: true,
      render: (text: string) => (
        <Tooltip tooltipPlacement="topLeft" text={text}>
          {text}
        </Tooltip>
      )
    },
    {
      dataIndex: "counterparty",
      key: "counterparty",
      title: "Counterparty"
    },
    {
      dataIndex: "formattedAmount",
      key: "formattedAmount",
      title: "Amount"
    },
    {
      dataIndex: "formattedBalance",
      key: "formattedBalance",
      title: "Balance"
    },
    {
      dataIndex: "status",
      key: "status",
      title: "Status",
      render: (status: string) => {
        let color = Colors.green.green500;
        let StatusIcon = CheckCircleFilled;
        status = status.toLowerCase();
        if (status === "pending") {
          StatusIcon = ClockCircleFilled;
          color = Colors.yellow.yellow600;
        } else if (status === "cancelled") {
          StatusIcon = CloseCircleFilled;
          color = Colors.red.red500;
        }
        return (
          <>
            <StatusIcon
              style={{
                color,
                fontSize: "1.2rem",
                marginRight: "0.5rem"
              }}
            />
            <Text
              size="small"
              color={Colors.grey.neutral700}
              label={status[0].toUpperCase() + status.substring(1)}
            />
          </>
        );
      }
    }
  ];

  return (
    <>
      {dataSource.length ? (
        <>
          <TableWrapper>
            <Table
              size="small"
              pagination={false}
              dataSource={pageData}
              tableColumns={tableColumns}
              rowClassName="account-table-row"
              onRow={(record, rowIndex) => {
                return {
                  onClick: () => {
                    // console.log(account?.productId);
                    if (
                      account?.productId !==
                      "4a6933e6-ee05-4a37-9bb5-776f72d681e8"
                    )
                      showDrawer(record);
                  }
                };
              }}
            />
          </TableWrapper>
          <Spacer size={40} />
          <Pagination
            total={dataSource.length}
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} of ${total} items`
            }
            defaultPageSize={pageSize}
            defaultCurrent={currentPage}
            size="small"
            showSizeChanger={dataSource.length > 5}
            pageSizeOptions={["5", "10", "15"]}
            onChange={(page, size): any => {
              setPage(page);
              setPageSize(size);
            }}
            onShowSizeChange={(current, size): any => {
              setPage(current);
              setPageSize(size);
            }}
          />
          <AccountDrawer
            handleClose={handleClose}
            drawerVisibility={drawerVisibility}
            selectedData={transaction}
            accountDetails={accountDetails}
          />
        </>
      ) : (
        ""
      )}
    </>
  );
};

export default Transactions;
