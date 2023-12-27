import React, { Fragment, useState } from "react";
import { Drawer, Space, Card } from "antd";
import {
  ClockCircleFilled,
  CheckCircleFilled,
  CloseCircleFilled
} from "@ant-design/icons";
import { Colors, Text, Button } from "@payconstruct/design-system";
import { Spacer } from "../../../../components/Spacer/Spacer";
import { useAppSelector } from "../../../../redux/hooks/store";
import { selectAccount } from "../../../../config/account/accountSlice";
import { selectedProduct } from "../../../../config/general/generalSlice";
import TransactionPdfDownloader from "../components/Tab/components/pdfDownloader/transactionPdfDownloader";
import style from "./AccountDrawer.module.css";

interface AccountDrawerProps {
  handleClose: any;
  drawerVisibility: boolean;
  selectedData: any;
  accountDetails: any;
}

const AccountDrawer: React.FC<AccountDrawerProps> = ({
  handleClose,
  drawerVisibility,
  selectedData,
  accountDetails
}) => {
  const emptySymbol = "---";
  const account: any = useAppSelector(selectAccount);
  const product = useAppSelector(selectedProduct);
  const [download, setDownload] = useState(false);

  const headerDetails = {
    product,
    accountDetails
  };

  return (
    <Drawer
      closable={false}
      onClose={handleClose}
      visible={Boolean(drawerVisibility && Object.keys(selectedData).length)}
      width={500}
    >
      {Object.keys(selectedData).length ? (
        <>
          <Space>
            <Text
              size="xlarge"
              weight="bolder"
              label={selectedData.formattedAmount}
            />
            <StatusBadge status={selectedData.status} />
          </Space>
          <Spacer size={15} />
          <Card
            className={style["custom-card--wrapper"]}
            style={{ borderRadius: "5px", padding: "0px" }}
            bodyStyle={{ padding: "15px" }}
          >
            <Text
              color={Colors.grey.neutral700}
              weight="bold"
              label="Transfer Details"
            />
            <ListItem name="Type" value={selectedData.type} />
            {selectedData.isOutbound ? (
              <ListItem
                name="Sent On"
                value={selectedData.date ?? emptySymbol}
              />
            ) : (
              <ListItem
                name="Received On"
                value={selectedData.date ?? emptySymbol}
              />
            )}
            <ListItem
              name="Value Date"
              value={selectedData?.valueDate ?? emptySymbol}
            />
            <ListItem
              name="Transaction Reference"
              value={selectedData.reference ?? emptySymbol}
            />
            <ListItem
              name="Remittance Information"
              value={selectedData.remarks ?? emptySymbol}
            />
            {selectedData?.txHash &&
              !selectedData?.payments?.internalPayment && (
                <ListItem
                  name="Transaction Hash"
                  value={selectedData.txHash ?? emptySymbol}
                />
              )}
          </Card>
          {selectedData?.processFlow?.split("_")[0] !== "manual" &&
            selectedData?.payments && (
              <Card
                className={style["custom-card--wrapper"]}
                style={{ borderRadius: "5px", padding: "0px" }}
                bodyStyle={{ padding: "15px" }}
              >
                <>
                  <Text
                    color={Colors.grey.neutral700}
                    weight="bold"
                    label="Payer Details"
                  />
                  <ListItem
                    name="Account"
                    value={selectedData?.payments?.debtorAccount ?? emptySymbol}
                  />
                  <ListItem
                    name="Name"
                    value={
                      selectedData?.payments?.debtor?.debtorName ?? emptySymbol
                    }
                  />
                </>
              </Card>
            )}
          {selectedData?.processFlow?.split("_")[0] !== "manual" &&
            selectedData?.payments?.creditor && (
              <Card
                className={style["custom-card--wrapper"]}
                style={{ borderRadius: "5px", padding: "0px" }}
                bodyStyle={{ padding: "15px" }}
              >
                <>
                  <Text
                    color={Colors.grey.neutral700}
                    weight="bold"
                    label="Beneficiary Details"
                  />
                  <ListItem
                    name="Account"
                    value={
                      selectedData?.payments?.creditorAccount ?? emptySymbol
                    }
                  />
                  <ListItem
                    name="Name"
                    value={
                      selectedData?.payments?.creditor?.creditorName ??
                      emptySymbol
                    }
                  />
                  {selectedData?.payments?.creditor?.creditorAddress && (
                    <>
                      <ListItem
                        name="Address"
                        value={`${selectedData?.payments?.creditor?.creditorAddress?.buildingNumber}, ${selectedData?.payments?.creditor?.creditorAddress?.street}`}
                      />
                      <ListItem
                        name="City"
                        value={
                          selectedData?.payments?.creditor?.creditorAddress
                            ?.city ?? emptySymbol
                        }
                      />
                      <ListItem
                        name="State"
                        value={
                          selectedData?.payments?.creditor?.creditorAddress
                            ?.state ?? emptySymbol
                        }
                      />
                      <ListItem
                        name="Country"
                        value={
                          selectedData?.payments?.creditor?.creditorAddress
                            ?.country ?? emptySymbol
                        }
                      />
                      <ListItem
                        name="Postal Code"
                        value={
                          selectedData?.payments?.creditor?.creditorAddress
                            ?.postalCode ?? emptySymbol
                        }
                      />
                    </>
                  )}
                </>
              </Card>
            )}
          <Card
            className={style["custom-card--wrapper"]}
            style={{ borderRadius: "5px", padding: "0px" }}
            bodyStyle={{ padding: "15px" }}
          >
            <Text
              color={Colors.grey.neutral700}
              weight="bold"
              label="Payment Details"
            />
            {selectedData?.amountInstructed && (
              <ListItem
                name="Amount instructed"
                value={`${selectedData?.amountInstructed ?? emptySymbol} ${
                  (selectedData?.payments?.debitCurrency ||
                    account?.currency) ??
                  emptySymbol
                }`}
              />
            )}
            {selectedData?.amountReceived && (
              <ListItem
                name="Amount Received"
                value={`${selectedData?.amountReceived ?? emptySymbol} ${
                  selectedData?.payments?.creditCurrency ?? emptySymbol
                }`}
              />
            )}
            {selectedData?.feesAmount && (
              <ListItem
                name="Fees"
                value={`${selectedData?.feesAmount} ${
                  selectedData?.feesCurrency ?? emptySymbol
                }`}
              />
            )}
            {selectedData?.exchangeRate && (
              <ListItem
                name="Exchange Rate"
                value={selectedData?.exchangeRate ?? emptySymbol}
              />
            )}
            {selectedData?.payments?.paymentRoutingChannel && (
              <ListItem
                name="Settlement Channel"
                value={
                  selectedData?.payments?.paymentRoutingChannel ?? emptySymbol
                }
              />
            )}
            <ListItem
              name="Final Balance After Transaction"
              value={`${
                selectedData?.formatedAvailableBalance ?? emptySymbol
              } ${account?.currency ?? emptySymbol}`}
            />
          </Card>
          <Space
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "15px",
              marginBottom: "20px"
            }}
          >
            <Button label="Cancel" type="secondary" onClick={handleClose} />
            <Button
              type="primary"
              label="Download PDF"
              icon={{ name: "download" }}
              onClick={() => {
                setDownload(true);
              }}
            />
          </Space>
        </>
      ) : (
        ""
      )}
      <TransactionPdfDownloader
        transactionDetails={selectedData}
        headerDetails={headerDetails}
        startDownload={download}
        onCompleteDownload={() => {
          setDownload(false);
        }}
        fileName={`Transfer Confirmation - ${selectedData.reference}`}
      />
    </Drawer>
  );
};

interface ListItemProps {
  name: string;
  value: string;
}

const ListItem: React.FC<ListItemProps> = ({ name, value }) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        fontSize: "1.4rem",
        lineHeight: "2rem",
        marginTop: 15,
        wordBreak: "break-word"
      }}
    >
      <Text
        style={{ width: "40%" }}
        color={Colors.grey.neutral500}
        label={name}
      />
      <Text
        style={{ width: "60%" }}
        color={Colors.grey.neutral700}
        label={value}
      />
    </div>
  );
};

const StatusBadge = (props: any) => {
  let { status } = props;
  status = status.toLowerCase();
  let color = Colors.green.green500;
  let backgroundColor = Colors.green.green50;
  let StatusIcon = CheckCircleFilled;
  if (status === "pending") {
    StatusIcon = ClockCircleFilled;
    color = Colors.yellow.yellow600;
    backgroundColor = Colors.yellow.yellow50;
  } else if (status === "cancelled") {
    StatusIcon = CloseCircleFilled;
    color = Colors.red.red500;
    backgroundColor = Colors.red.red50;
  }
  return (
    <Space
      size={4}
      style={{
        backgroundColor,
        borderRadius: 100,
        padding: "0 6px 1px"
      }}
    >
      <StatusIcon
        style={{
          fontSize: 12,
          color
        }}
      />
      <span
        style={{
          color,
          fontSize: "1.1rem",
          lineHeight: "1.2rem"
        }}
      >
        {status[0].toUpperCase() + status.substring(1)}
      </span>
    </Space>
  );
};

export default AccountDrawer;
