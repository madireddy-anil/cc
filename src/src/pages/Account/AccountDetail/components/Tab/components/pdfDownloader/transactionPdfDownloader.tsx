import * as React from "react";
import moment from "moment";
import jsPDF from "jspdf";
import { Card } from "antd";
import { Colors, Text } from "@payconstruct/design-system";
import lodash from "lodash";

import brandLogo from "../../../../../../../assets/logos/oribital.png";

import { getFormattedAddress } from "../../../../../../../utilities/transformers";

import "./transactionPdfDownloader.css";

import { openSansBoldFont } from "./fonts/OpanSans/OpenSans-Bold";
import { openSansRegularFont } from "./fonts/OpanSans/OpenSans-Regular-normal";

interface IDownloaderProps {
  transactionDetails: any;
  headerDetails: any;
  startDownload: boolean;
  onCompleteDownload: () => void;
  fileName: string;
}

const Downloader: React.FC<IDownloaderProps> = ({
  transactionDetails,
  headerDetails,
  startDownload,
  onCompleteDownload,
  fileName
}) => {
  React.useEffect(() => {
    if (startDownload) {
      generate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDownload]);

  var base64Img: any = null;
  var pdf = new jsPDF("p", "pt", "a4");

  const margins = [80, 0, 55, 15]; // [0] top, [1] right, [2] bottom, [3] left
  const pdfWidth = 560;
  const emptySymbol = "---";

  const imgToBase64 = (url: any, callback: any, imgVariable?: any) => {
    if (!window.FileReader) {
      callback(null);
      return;
    }
    var xhr = new XMLHttpRequest();
    xhr.responseType = "blob";
    xhr.onload = function () {
      var reader: any = new FileReader();
      reader.onloadend = function () {
        imgVariable = reader?.result?.replace("text/xml", "image/jpeg");
        callback(imgVariable);
      };
      reader.readAsDataURL(xhr.response);
    };
    xhr.open("GET", url);
    xhr.send();
  };

  const generate = () => {
    imgToBase64(brandLogo, function (base64: any) {
      base64Img = base64;
    });

    var elem: any = document.getElementById("transaction-details");
    elem.style.display = "block";

    pdf.html(elem, {
      callback: () => {
        headerFooterFormatting(pdf, pdf.getNumberOfPages());
        onCompleteDownload();
        pdf.save(fileName);
        elem.style.display = "none";
      },
      autoPaging: "text",
      width: pdfWidth,
      margin: margins
    });
  };

  function headerFooterFormatting(doc: any, totalPages: any) {
    for (var i = totalPages; i >= 1; i--) {
      // create necessary pdf page
      doc.setPage(i);

      //header
      header(doc, i);

      //footer
      footer(doc, i, totalPages);
      doc.page++;
    }
  }

  const header = (doc: any, pageNumber: number) => {
    const { accountDetails } = headerDetails;

    // logo
    if (base64Img) {
      doc.addImage(base64Img, "JPEG", margins[3], 10, 100, 24);
    }
    // Address below the logo
    doc.setFontSize(10);
    doc.setTextColor(138, 146, 157);
    doc.text(accountDetails?.issuerAddress ?? "---", margins[3], 50);

    //righ side content
    doc.addFileToVFS("OpenSansBold.ttf", openSansBoldFont);
    doc.addFileToVFS("OpenSansNormal.ttf", openSansRegularFont);

    doc.addFont("OpenSansBold.ttf", "OpenSansBold", "Bold");
    doc.setFont("OpenSansBold", "Bold");

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    const statement = "Transfer Confirmation";
    doc.text(statement, doc.internal.pageSize.width - 15, 20, {
      align: "right"
    });

    doc.addFont("OpenSansNormal.ttf", "OpenSansNormal", "normal");
    doc.setFont("OpenSansNormal", "normal");

    // const acNumber =
    //   accountDetails?.accountNumberDetails?.label +
    //     ": " +
    //     accountDetails?.accountNumberDetails?.value ?? "---";
    const statementDate = "Download Date: " + moment().format("DD MMM YYYY");

    doc.setFontSize(10);
    doc.setTextColor(138, 146, 157);
    doc.text(statementDate, doc.internal.pageSize.width - 15, 40, {
      align: "right",
      lineHeightFactor: 1.5
    });

    // horizondal line
    doc.setDrawColor(138, 146, 157); // #8a929d
    doc.line(0, margins[0] - 15, doc.internal.pageSize.width, margins[0] - 15);

    // if (pageNumber !== 1) {
    //   doc.setFontSize(14);
    //   doc.setTextColor(0, 0, 0);
    //   doc.setFont("OpenSansBold", "Bold");
    //   doc.text("Transactions", margins[3] + 20, margins[0] - 15);
    //   doc.setFont("OpenSansNormal", "normal");
    // }
  };

  const getFooterText = () => {
    const { accountDetails } = headerDetails;
    /* Pay Perform Ltd Address */
    if (
      accountDetails?.account?.issuerEntityId ===
      "b3dd7584-2656-47f9-ad3f-a54050ef46fa"
    ) {
      return `Orbital is a trading name of Pay Perform Limited, Financial Conduct Authority authorised payment institution, company number: 10789721, registered address: 230 Blackfriars Rd, London SE1 8NW, United Kingdom.`;
    }

    /* Pay Perform OU Address */
    if (
      accountDetails?.account?.issuerEntityId ===
      "adf5d835-ffe8-46dd-bc5e-16e9320426d0"
    ) {
      return `Orbital is a trading name of Pay Perform OÜ, licensed virtual currency service provider authorised by Republic of Estonia Financial Intelligence Unit, company number: 14760418, registered address: Harju maakond, Tallinn, Kristiine linnaosa, Keemia tn 4, 10616.`;
    }
    return `Orbital is a trading name of Pay Perform Limited, Financial Conduct Authority authorised payment institution, company number: 10789721, registered address: 230 Blackfriars Rd, London SE1 8NW, United Kingdom.`;
  };

  const footer = (doc: any, pageNumber: any, totalPages: any) => {
    var str = totalPages > 1 ? "Page " + pageNumber + " of " + totalPages : "";
    var footerText = getFooterText();
    doc.setFontSize(8);
    doc.setTextColor(138, 146, 157);

    //page numbers
    doc.text(
      str,
      doc.internal.pageSize.width - 80,
      doc.internal.pageSize.height - 40
    );

    // horizondal line
    doc.setDrawColor(138, 146, 157); // #8a929d
    doc.line(
      0,
      doc.internal.pageSize.height - 35,
      doc.internal.pageSize.width,
      doc.internal.pageSize.height - 35
    );

    // footer text
    doc.text(footerText, margins[3], doc.internal.pageSize.height - 20, {
      baseline: "bottom",
      maxWidth: pdfWidth,
      lineHeightFactor: 1.5
    });
  };

  const getTransactionDetails = () => {
    const { accountDetails } = headerDetails;
    return (
      <>
        <Card
          className={"card-wrapper"}
          style={{ borderRadius: "5px", padding: "0px", marginBottom: "10px" }}
          bodyStyle={{ padding: "15px" }}
        >
          <Text
            color={Colors.grey.neutral700}
            weight="bold"
            label="Transfer Details"
          />
          <ListItem name="Type" value={transactionDetails.type} />
          <ListItem
            name="Status"
            value={lodash.capitalize(transactionDetails.status)}
          />
          {transactionDetails.isOutbound ? (
            <ListItem
              name="Sent On"
              value={transactionDetails.date ?? emptySymbol}
            />
          ) : (
            <ListItem
              name="Received On"
              value={transactionDetails.date ?? emptySymbol}
            />
          )}
          <ListItem
            name="Value Date"
            value={transactionDetails?.valueDate ?? emptySymbol}
          />
          <ListItem
            name="Transaction Reference"
            value={transactionDetails.reference ?? emptySymbol}
          />
          <ListItem
            name="Remittance Information"
            value={transactionDetails.remarks ?? emptySymbol}
          />
          {transactionDetails?.txHash &&
            !transactionDetails?.payments?.internalPayment && (
              <ListItem
                name="Transaction Hash"
                value={transactionDetails.txHash ?? emptySymbol}
              />
            )}
        </Card>
        {transactionDetails?.processFlow?.split("_")[0] !== "manual" &&
          transactionDetails?.payments && (
            <Card
              className={"card-wrapper"}
              style={{
                borderRadius: "5px",
                padding: "0px",
                marginBottom: "10px"
              }}
              bodyStyle={{ padding: "15px" }}
            >
              <React.Fragment>
                <>
                  <Text
                    color={Colors.grey.neutral700}
                    weight="bold"
                    label="Payer Details"
                  />
                  <ListItem
                    name="Account"
                    value={
                      transactionDetails?.payments?.debtorAccount ?? emptySymbol
                    }
                  />
                  <ListItem
                    name="Name"
                    value={
                      transactionDetails?.payments?.debtor?.debtorName ??
                      emptySymbol
                    }
                  />
                </>
              </React.Fragment>
            </Card>
          )}
        {transactionDetails?.processFlow?.split("_")[0] !== "manual" &&
          transactionDetails?.payments?.creditor && (
            <Card
              className={"card-wrapper"}
              style={{
                borderRadius: "5px",
                padding: "0px",
                marginBottom: "10px"
              }}
              bodyStyle={{ padding: "15px" }}
            >
              <React.Fragment>
                <>
                  <Text
                    color={Colors.grey.neutral700}
                    weight="bold"
                    label="Beneficiary Details"
                  />
                  <ListItem
                    name="Account"
                    value={
                      transactionDetails?.payments?.creditorAccount ??
                      emptySymbol
                    }
                  />
                  <ListItem
                    name="Name"
                    value={
                      transactionDetails?.payments?.creditor?.creditorName ??
                      emptySymbol
                    }
                  />
                  {transactionDetails?.payments?.creditor?.creditorAddress && (
                    <>
                      <ListItem
                        name="Address"
                        value={getFormattedAddress(
                          transactionDetails?.payments?.creditor
                            ?.creditorAddress
                        )}
                      />
                    </>
                  )}
                </>
              </React.Fragment>
            </Card>
          )}
        <Card
          className={"card-wrapper"}
          style={{ borderRadius: "5px", padding: "0px" }}
          bodyStyle={{ padding: "15px" }}
        >
          <Text
            color={Colors.grey.neutral700}
            weight="bold"
            label="Payment Details"
          />
          {transactionDetails?.amountInstructed && (
            <ListItem
              name="Amount instructed"
              value={`${
                (transactionDetails?.payments?.debitCurrency ||
                  accountDetails?.account?.currency) ??
                emptySymbol
              } ${transactionDetails?.amountInstructed ?? emptySymbol}`}
            />
          )}
          {transactionDetails?.amountReceived && (
            <ListItem
              name="Amount Received"
              value={`${
                transactionDetails?.payments?.creditCurrency ?? emptySymbol
              } ${transactionDetails?.amountReceived ?? emptySymbol}`}
            />
          )}
          {transactionDetails?.feesAmount && (
            <ListItem
              name="Fees"
              value={`${transactionDetails?.feesCurrency ?? emptySymbol} ${
                transactionDetails?.feesAmount
              }`}
            />
          )}
          {transactionDetails?.exchangeRate && (
            <ListItem
              name="Exchange Rate"
              value={transactionDetails?.exchangeRate ?? emptySymbol}
            />
          )}
          {transactionDetails?.payments?.paymentRoutingChannel && (
            <ListItem
              name="Settlement Channel"
              value={
                transactionDetails?.payments?.paymentRoutingChannel ??
                emptySymbol
              }
            />
          )}
          <ListItem
            name="Final Balance After Transaction"
            value={`${accountDetails?.account?.currency ?? emptySymbol} ${
              transactionDetails?.formatedAvailableBalance ?? emptySymbol
            }`}
          />
        </Card>
      </>
    );
  };

  return (
    <div id="transaction-details" style={{ width: "595px" }}>
      {getTransactionDetails()}
    </div>
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
        fontSize: "14px",
        lineHeight: "1.2rem",
        marginTop: 15,
        wordBreak: "break-word"
      }}
    >
      <Text
        style={{ width: "40%" }}
        size="small"
        color={Colors.grey.neutral500}
        label={name}
      />
      <Text
        style={{ width: "60%" }}
        size="small"
        color={Colors.grey.neutral700}
        label={value}
      />
    </div>
  );
};

export default Downloader;
