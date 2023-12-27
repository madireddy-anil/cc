import * as React from "react";
import moment from "moment";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import brandLogo from "../../../../../../../assets/logos/oribital.png";

import calenderIcon from "../../../../../../../assets/images/calender.png";

import { fractionFormat } from "../../../../../../../utilities/transformers";
import { sortData } from "../../../../../../../config/transformer";

import "./statementPdfDownloader.css";

import { openSansBoldFont } from "./fonts/OpanSans/OpenSans-Bold";
import { openSansRegularFont } from "./fonts/OpanSans/OpenSans-Regular-normal";

interface IDownloaderProps {
  txnDetails: any;
  selectedDateRange: any;
  statement: any;
  headerDetails: any;
  accountDetails: any;
  startDownload: boolean;
  onCompleteDownload: () => void;
  fileName: string;
}

const Downloader: React.FC<IDownloaderProps> = ({
  txnDetails,
  selectedDateRange,
  statement,
  headerDetails,
  accountDetails,
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

  const margins = [100, 0, 55, 0]; // [0] top, [1] right, [2] bottom, [3] left
  const pdfWidth = 560;

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

  const getTableData = () => {
    const data = txnDetails && [...txnDetails].sort(sortData);
    const transactions = data?.map((txn: any) => {
      return [
        moment(txn?.createdAt).format("DD/MM/YYYY"),
        Object.entries(txn?.payments).length !== 0
          ? txn?.payments?.transactionType
          : "Transfer",
        Object.entries(txn?.payments).length !== 0
          ? txn?.payments?.remittanceInformation
          : txn?.remarks,
        `${txn?.debitCredit === "debit" ? "-" : "+"} ${fractionFormat(
          txn?.amount
        )}`,
        fractionFormat(txn?.balance)
      ];
    });
    return transactions;
  };

  const generate = () => {
    imgToBase64(brandLogo, function (base64: any) {
      base64Img = base64;
    });

    var elem: any = document.getElementById("statement");
    elem.style.display = "block";

    const head = [["Date", "Type", "Description", "Amount", "Balance"]];
    const data = getTableData();

    pdf.html(elem, {
      callback: () => {
        autoTable(pdf, {
          head: head,
          body: data,
          startY: 485,
          pageBreak: "auto",
          rowPageBreak: "avoid",
          showHead: "everyPage",
          margin: { top: 100, right: 10, bottom: 50, left: 20 },
          styles: { overflow: "linebreak", cellPadding: 10 },
          tableWidth: pdfWidth,
          columnStyles: {
            0: { cellWidth: 80 },
            1: { cellWidth: 85 },
            2: { cellWidth: 200 },
            3: { cellWidth: 98 },
            4: { cellWidth: 97 }
          },
          didParseCell: (data) => {
            if (data.row.index === 0 && data.section === "head") {
              data.cell.styles.fillColor = [248, 249, 251];
              data.cell.styles.textColor = [120, 120, 121];
            } else if (data.row.index % 2 === 0) {
              data.cell.styles.fillColor = [255, 255, 255];
            } else {
              data.cell.styles.fillColor = [248, 249, 251];
            }
          }
        });
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
    const { product, accountDetails } = headerDetails;

    // logo
    if (base64Img) {
      doc.addImage(base64Img, "JPEG", margins[3] + 20, 10, 100, 24);
    }
    // Address below the logo
    doc.setFontSize(10);
    doc.setTextColor(138, 146, 157);
    doc.text(accountDetails?.issuerAddress ?? "---", margins[3] + 20, 50);

    //righ side content
    doc.addFileToVFS("OpenSansBold.ttf", openSansBoldFont);
    doc.addFileToVFS("OpenSansNormal.ttf", openSansRegularFont);

    doc.addFont("OpenSansBold.ttf", "OpenSansBold", "Bold");
    doc.setFont("OpenSansBold", "Bold");

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    const statement = "Statement: " + product ?? "---";
    doc.text(statement, doc.internal.pageSize.width - 20, 20, {
      align: "right"
    });

    doc.addFont("OpenSansNormal.ttf", "OpenSansNormal", "normal");
    doc.setFont("OpenSansNormal", "normal");

    const acNumber =
      accountDetails?.accountNumberDetails?.label +
        ": " +
        accountDetails?.accountNumberDetails?.value ?? "---";
    const statementDate = "Statement Date: " + moment().format("DD MMM YYYY");

    doc.setFontSize(10);
    doc.setTextColor(138, 146, 157);
    doc.text([acNumber, statementDate], doc.internal.pageSize.width - 20, 35, {
      align: "right",
      lineHeightFactor: 1.5
    });

    // horizondal line
    doc.setDrawColor(138, 146, 157); // #8a929d
    doc.line(0, margins[0] - 35, doc.internal.pageSize.width, margins[0] - 35);

    if (pageNumber !== 1) {
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.setFont("OpenSansBold", "Bold");
      doc.text("Transactions", margins[3] + 20, margins[0] - 15);
      doc.setFont("OpenSansNormal", "normal");
    }
  };

  const getFooterText = () => {
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
    var str = "Page " + pageNumber + " of " + totalPages;
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
    doc.text(footerText, margins[3] + 20, doc.internal.pageSize.height - 20, {
      baseline: "bottom",
      maxWidth: pdfWidth,
      lineHeightFactor: 1.5
    });
  };

  const getAccountDetails = () => {
    return (
      <>
        <div className="ac-details">
          <p style={{ fontSize: "14px", fontWeight: "bolder" }}>
            Account Details
          </p>
          <div
            className="ac-details-content"
            style={{ border: "0.1mm solid #E6E6E8", borderRadius: "10px" }}
          >
            <div className="item">
              <div className="item-left header-title-text">Account Holder</div>
              <div className="item-right">
                {accountDetails?.accountHolder ?? "---"}
              </div>
            </div>
            <div className="item">
              <div className="item-left header-title-text">
                Account Holder's Address
              </div>
              <div className="item-right">
                {accountDetails?.accountAddress ?? "---"}
              </div>
            </div>
            <div className="item">
              <div className="item-left header-title-text">Account Name</div>
              <div style={{ wordSpacing: "3px" }} className="item-right">
                {accountDetails?.accountName ?? "---"}
              </div>
            </div>
            <div className="item">
              <div className="item-left header-title-text">
                This Account is Issued by
              </div>
              <div className="item-right">
                {accountDetails?.issuerName ?? "---"}
              </div>
            </div>
            <div className="item">
              <div className="item-left header-title-text">Currency</div>
              <div className="item-right">
                {accountDetails?.currencyCode ?? "---"}
              </div>
            </div>
            <div className="item">
              <div className="item-left header-title-text">Balance</div>
              <div className="item-right">
                <p style={{ paddingRight: "8px" }}>
                  {accountDetails?.currencyCode}
                </p>
                {`${fractionFormat(accountDetails?.balance ?? 0)}`}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  const getStatement = () => {
    const { openingBalances, totalCredits, totalDebits, closingBalances } =
      statement;
    return (
      <div className="account-statement">
        <div className="ac-statement-header">
          <p style={{ fontSize: "14px", fontWeight: "bolder" }}>
            Account Statement
          </p>
          <div className="statement-dates">
            <div className="footer-header">
              <img
                src={calenderIcon}
                alt=""
                style={{ width: "10px", height: "10px", marginRight: "5px" }}
              />
              <p style={{ fontSize: "10px" }}>{selectedDateRange}</p>
            </div>
          </div>
        </div>
        <div className="ac-statement-content">
          <div style={{ border: "0.1mm solid #E6E6E8", borderRadius: "10px" }}>
            <div className="statement-card">
              <div className="statement-card-content">
                <p className="header-title-text ac-statement-headers">
                  Opening Balance
                </p>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    paddingTop: "2px"
                  }}
                >
                  <p
                    style={{ paddingRight: "8px" }}
                  >{`${accountDetails?.currencyCode}`}</p>{" "}
                  <p>{fractionFormat(openingBalances ?? 0)}</p>
                </div>
              </div>
              <div
                style={{
                  height: "auto",
                  width: "0.1mm",
                  backgroundColor: "#E6E6E8"
                }}
              />
              <div className="statement-card-content">
                <p className="header-title-text ac-statement-headers">
                  Total Debits
                </p>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    paddingTop: "2px"
                  }}
                >
                  <p
                    style={{ paddingRight: "8px" }}
                  >{`${accountDetails?.currencyCode}`}</p>{" "}
                  <p>{fractionFormat(totalDebits ?? 0)}</p>
                </div>
              </div>
              <div
                style={{
                  height: "auto",
                  width: "0.1mm",
                  backgroundColor: "#E6E6E8"
                }}
              />
              <div className="statement-card-content">
                <p className="header-title-text ac-statement-headers">
                  Total Credits
                </p>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    paddingTop: "2px"
                  }}
                >
                  <p
                    style={{ paddingRight: "8px" }}
                  >{`${accountDetails?.currencyCode}`}</p>{" "}
                  <p>{fractionFormat(totalCredits ?? 0)}</p>
                </div>
              </div>
              <div
                style={{
                  height: "auto",
                  width: "0.1mm",
                  backgroundColor: "#E6E6E8"
                }}
              />
              <div className="statement-card-content">
                <p className="header-title-text ac-statement-headers">
                  Closing Balance
                </p>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    paddingTop: "2px"
                  }}
                >
                  <p
                    style={{ paddingRight: "8px" }}
                  >{`${accountDetails?.currencyCode}`}</p>{" "}
                  <p>{fractionFormat(closingBalances ?? 0)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="transactions">
          <p
            style={{
              fontSize: "14px",
              paddingTop: "15px",
              fontWeight: "bolder"
            }}
          >
            Transactions
          </p>
        </div>
      </div>
    );
  };

  return (
    <div id="statement" style={{ width: "595px" }}>
      {getAccountDetails()}
      {getStatement()}
    </div>
  );
};

export default Downloader;
