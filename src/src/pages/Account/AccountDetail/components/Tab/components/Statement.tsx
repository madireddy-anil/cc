import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Button,
  DatePicker,
  Select,
  Divider,
  Icon,
  Text,
  Spin,
  Notification,
  Form
} from "@payconstruct/design-system";

import { CSVLink } from "react-csv";
import moment from "moment";

import "./Statement.css";

import PDFDownloader from "./pdfDownloader/statementPdfDownloader";
import { selectedProduct } from "../../../../../../config/general/generalSlice";
import { currencyAccountsApi } from "../../../../../../config/variables";
import { useAppSelector } from "../../../../../../redux/hooks/store";
import { useAuth } from "../../../../../../redux/hooks/useAuth";
import { fractionFormat } from "../../../../../../utilities/transformers";
import { sortData } from "../../../../../../config/transformer";

const { RangePicker } = DatePicker;

interface IStatementProps {
  accountDetails: any;
}

const Statement: React.FC<IStatementProps> = ({ accountDetails }) => {
  const [form] = Form.useForm();
  const { id }: any = useParams();
  const [download, startDownload] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [range, setRange] = useState<any>([]);
  const [fileType, setFileType] = useState("pdf");
  const [loading, setLoading] = useState(false);
  const [csvData, setCsvData] = useState([]);
  // const [payload, setPayload] = useState({});

  const [dates, setDates] = useState<any>([]);

  const [statementData, setStatementData] = useState<any>([]);
  const [isSuccess, setIsSuccess] = useState(false);

  const { auth } = useAuth();

  const product = useAppSelector(selectedProduct);

  const baseDetail = {
    product,
    accountDetails
  };

  const fetchStatementDetails = () => {
    if (range[0] !== undefined && range[1] !== undefined) {
      fetch(
        `${currencyAccountsApi}/accounts/statements?startDate=${range[0]}&endDate=${range[1]}&accountId=${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${auth.token}`
          }
        }
      )
        .then((response) => response.json())
        .then((res) => {
          Promise.resolve(setStatementData(res)).then(() => setIsSuccess(true));
        });
    }
  };

  const onHandlefileTypeChange = (value: string) => {
    setFileType(value);
    if (value === "csv" && range[0] !== undefined && range[1] !== undefined) {
      triggerDownload(value);
    }
  };

  const triggerDownload = (fileTypeValue?: string) => {
    setIsSuccess(false);
    setLoading(true);
    fetchStatementDetails();
  };

  const getCSVData = useCallback(() => {
    const txnData = statementData?.data?.transactionList.slice().sort(sortData);
    const csvDataStructure = txnData.map((txnItem: any) => {
      const {
        createdAt,
        debitCredit,
        amount,
        balance,
        payments: { transactionType, endToEndReference, remittanceInformation }
      } = txnItem;
      return {
        transactionDate: moment(createdAt).format("DD/MM/YYYY"),
        transactionType,
        creditDebitCode: debitCredit,
        currency: accountDetails?.currencyCode,
        amount: fractionFormat(amount),
        accountBalance: fractionFormat(balance),
        transactionReference: endToEndReference,
        description: remittanceInformation,
        account: baseDetail?.accountDetails?.accountNumberDetails?.value
      };
    });
    startDownload(false);
    setIsSuccess(false);
    return csvDataStructure;
  }, [
    statementData?.data?.transactionList,
    accountDetails?.currencyCode,
    baseDetail?.accountDetails?.accountNumberDetails?.value
  ]);

  useEffect(() => {
    if (isSuccess) {
      setLoading(false);
      startDownload(true);
    }
  }, [isSuccess]);

  useEffect(() => {
    if (!download) {
      setLoading(false);
    } else if (fileType === "csv" && isSuccess) {
      if (
        statementData?.data?.transactionList &&
        statementData?.data?.transactionList.length > 0
      ) {
        setCsvData(getCSVData());
      } else {
        Notification({
          type: "info",
          message: "No transactions available for the selected date range"
        });
        startDownload(false);
        setCsvData([]);
      }
    }
  }, [
    download,
    fileType,
    isSuccess,
    statementData?.data?.transactionList,
    getCSVData
  ]);

  const headers = [
    { label: "TransactionDate", key: "transactionDate" },
    { label: "TransactionType", key: "transactionType" },
    { label: "CreditDebitCode", key: "creditDebitCode" },
    { label: "Currency", key: "currency" },
    { label: "Amount", key: "amount" },
    { label: "AccountBalance", key: "accountBalance" },
    { label: "TransactionReference", key: "transactionReference" },
    { label: "Description", key: "description" },
    { label: "Account", key: "account" }
  ];

  const onOpenChange = (open: any) => {
    if (open) {
      setDates([]);
    }
  };

  return (
    <Spin loading={loading}>
      <Form
        form={form}
        layout="inline"
        onFinish={triggerDownload}
        initialValues={{
          fileType: fileType
        }}
      >
        <Form.Item name="dateRange">
          <RangePicker
            helperText=""
            label="Date Range"
            style={{ height: "40px" }}
            onChange={(evt: any, date: any) => {
              if (evt) {
                if (evt[1].diff(evt[0], "days") + 1 <= 31) {
                  setDisabled(false);
                } else {
                  setDisabled(true);
                  Notification({
                    type: "error",
                    message: "Select Date only for 31 days"
                  });
                }
              }
              form.setFieldsValue({ fileType: "pdf" });
              setFileType("pdf");
              setRange(date);
            }}
            // @ts-ignore
            picker="date"
            // format="DD-MM-YYYY"
            disabledDate={(current) => {
              if (!dates || dates.length === 0) {
                return false;
              }
              const tooLate = dates[0] && current.diff(dates[0], "month") >= 1;
              const tooEarly = current.isSameOrAfter(moment());
              return tooEarly || tooLate;
            }}
            onCalendarChange={(val) => setDates(val)}
            onOpenChange={onOpenChange}
          />
        </Form.Item>
        <Form.Item name="fileType">
          <Select
            label="Format"
            optionlist={[
              ["pdf", "PDF"],
              ["csv", "CSV"]
            ]}
            placeholder="Select format"
            style={{ width: "250px", height: "40px" }}
            onChange={onHandlefileTypeChange}
          />
        </Form.Item>
        <Form.Item shouldUpdate>
          {fileType === "pdf" ? (
            <Button
              type="secondary"
              size="small"
              label="Download Statement"
              icon={{ name: "download" }}
              loading={download}
              disabled={download || disabled}
              onClick={() => form.submit()}
            />
          ) : (
            <CSVLink
              headers={headers}
              data={csvData}
              filename={`Statement_${range[0]}_${range[1]}_${accountDetails?.accountNumberDetails?.value}.csv`}
              target="_blank"
            >
              <Button
                type="secondary"
                size="small"
                label="Download Statement"
                icon={{ name: "download" }}
                loading={loading}
                disabled={
                  loading || disabled || statementData?.data?.total === 0
                }
              />
            </CSVLink>
          )}
        </Form.Item>
      </Form>

      <Divider type="horizontal" />

      <div className="footer">
        <div className="footer-header">
          <Icon name="info" />
          <Text
            weight="bolder"
            size="xxlarge"
            label="Important Information about your statement"
          />
        </div>
        <div className="content">
          <ul>
            <li>
              The account statement shows settled transactions and balances for
              the chosen statement period.
            </li>
            <li>
              The transactions list and balances shown on the statement exclude
              any pending transactions that are pending settlement.
            </li>
            <li>Transaction dates in the statements are all reported in UTC</li>
          </ul>
        </div>
      </div>
      {fileType === "pdf" && (
        <PDFDownloader
          headerDetails={baseDetail}
          txnDetails={statementData?.data?.transactionList}
          fileName={`Statement ${range[0]} - ${range[1]} ${baseDetail?.accountDetails?.accountNumberDetails?.value}.pdf`}
          selectedDateRange={`${moment(range[0]).format(
            "DD MMM YYYY"
          )} - ${moment(range[1]).format("DD MMM YYYY")}`}
          accountDetails={accountDetails}
          startDownload={download}
          statement={statementData?.data?.statement ?? {}}
          onCompleteDownload={() => {
            startDownload(false);
            setStatementData([]);
            setIsSuccess(false);
          }}
        />
      )}
    </Spin>
  );
};

export default Statement;
