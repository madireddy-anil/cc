import {
  Cards,
  Icon,
  List,
  Text,
  Notification
} from "@payconstruct/design-system";
import React from "react";
import { Spacer } from "../../../../../../components/Spacer/Spacer";
import {
  fractionFormat,
  getFormattedAddress,
  getCurrencyName
} from "../../../../../../utilities/transformers";
import { selectCurrencies } from "../../../../../../config/currencies/currenciesSlice";
import { useAppSelector } from "../../../../../../redux/hooks/store";

import "./AccountsDetails.css";

interface AccountsDetailsProps {
  accountDetails: any;
  currentAccountDetails: any;
}

const AccountsDetails: React.FC<AccountsDetailsProps> = ({
  accountDetails,
  currentAccountDetails
}) => {
  const {
    isCrossBorder,
    isLedgerAccount,
    isLocalPayments,
    currencyType,
    accountIdentification,
    currency
  } = currentAccountDetails;

  const currenciesList = useAppSelector(selectCurrencies);

  /**
   *
   * @function getAccountDetails
   *
   *    This will be standard account details
   *
   *    @param null
   *
   *
   *    @returns null
   *
   */
  const getAccountDetails = () => {
    return (
      <>
        <List
          fullWidth
          listType="horizontal"
          src={[
            {
              label: "Account Holder",
              value: accountDetails?.accountHolder ?? "---"
            },
            {
              label: "Account Holder's Address",
              value: accountDetails?.accountAddress ?? "---"
            },
            {
              label: "Account Name",
              value: accountDetails?.accountName ?? "---"
            },
            {
              label: "This Account is Issued by",
              value: accountDetails?.issuerName ?? "---"
            },
            {
              label: "Currency",
              value:
                getCurrencyName(
                  accountDetails?.mainCurrency,
                  accountDetails?.currencyCode,
                  currenciesList
                ) ?? "---"
            },
            {
              label: "Balance",
              value: `${accountDetails?.currencyCode} ${fractionFormat(
                accountDetails?.balance ?? 0
              )}`
            }
          ]}
          title="Account Details"
          background={false}
        />
      </>
    );
  };

  /**
   *
   * @function getLocalPayments
   *
   *  This will be the Local Payment details
   *
   *
   *  @param null
   *
   *
   *  @returns null
   */

  const getLocalPayments = () => {
    const { accountNumber, bankCode, IBAN } = accountIdentification;

    if (!isLocalPayments || currencyType !== "fiat") {
      return <></>;
    }
    return (
      <>
        <Spacer size={20} />
        <Cards.FooterCard
          description={
            <div id="localPayments">
              <List
                fullWidth
                listType="horizontal"
                src={[
                  {
                    label: "Account Number",
                    value: (
                      <>
                        <div className="value__withCopy">
                          <p>{accountNumber ?? "---"}</p>
                          <Icon
                            name="copy"
                            onClick={() =>
                              copyToClipboardSingleValue(accountNumber)
                            }
                          />
                        </div>
                      </>
                    )
                  },
                  {
                    label: "Sort Code",
                    value: (
                      <>
                        <div className="value__withCopy">
                          <p>{bankCode ?? "---"}</p>
                          <Icon
                            name="copy"
                            onClick={() => copyToClipboardSingleValue(bankCode)}
                          />
                        </div>
                      </>
                    )
                  },
                  {
                    label: "IBAN",
                    value: (
                      <>
                        <div className="value__withCopy">
                          <p>{IBAN ?? "---"}</p>
                          <Icon
                            name="copy"
                            onClick={() => copyToClipboardSingleValue(IBAN)}
                          />
                        </div>
                      </>
                    )
                  }
                ]}
                title={
                  <>
                    <div className="title__withCopy">
                      <p>Local Payments</p>
                      <Icon
                        name="copy"
                        onClick={() =>
                          copyToClipboard({
                            AccountNumber: accountNumber ?? "---",
                            SortCode: bankCode ?? "---",
                            IBAN: IBAN ?? "---"
                          })
                        }
                      />
                    </div>
                  </>
                }
                background={false}
              />
            </div>
          }
          footer={getFiatFooters("local")}
        />
      </>
    );
  };

  /**
   *
   * @function getCrossPayments
   *
   *    This will be the cross border payment details
   *
   *    @param null
   *
   *    @returns null
   *
   */

  const getCrossPayments = () => {
    const { BIC, IBAN, intermediaryBank, bankName, bankAddress } =
      accountIdentification;

    let formattedAddress = "---";

    if (bankAddress) {
      if (bankAddress[0]) {
        formattedAddress = getFormattedAddress(bankAddress[0]);
      }
    }

    if (!isCrossBorder || currencyType !== "fiat") {
      return <></>;
    }
    return (
      <>
        <Spacer size={20} />
        <Cards.FooterCard
          description={
            <>
              <Spacer size={20} />

              <List
                fullWidth
                listType="horizontal"
                src={[
                  {
                    label: "IBAN",
                    value: (
                      <>
                        <div className="value__withCopy">
                          <p>{IBAN ?? "---"}</p>
                          <Icon
                            name="copy"
                            onClick={() => copyToClipboardSingleValue(IBAN)}
                          />
                        </div>
                      </>
                    )
                  },
                  {
                    label: "BIC",
                    value: (
                      <>
                        <div className="value__withCopy">
                          <p>{BIC ?? "---"}</p>
                          <Icon
                            name="copy"
                            onClick={() => copyToClipboardSingleValue(BIC)}
                          />
                        </div>
                      </>
                    )
                  },
                  {
                    label: "Bank Name",
                    value: (
                      <>
                        <div className="value__withCopy">
                          <p>{bankName ?? "---"}</p>
                          <Icon
                            name="copy"
                            onClick={() => copyToClipboardSingleValue(bankName)}
                          />
                        </div>
                      </>
                    )
                  },
                  {
                    label: "Bank Address",
                    value: (
                      <>
                        <div className="value__withCopy">
                          <p>{formattedAddress}</p>
                          <Icon
                            name="copy"
                            style={{ width: "20px !important" }}
                            onClick={() =>
                              copyToClipboardSingleValue(formattedAddress)
                            }
                          />
                        </div>
                      </>
                    )
                  },
                  {
                    label: "Intermediary Bank",
                    value: (
                      <>
                        <div className="value__withCopy">
                          <p>{intermediaryBank ?? "---"}</p>
                          {intermediaryBank && (
                            <Icon
                              name="copy"
                              onClick={() =>
                                copyToClipboardSingleValue(
                                  intermediaryBank ?? ""
                                )
                              }
                            />
                          )}
                        </div>
                      </>
                    )
                  }
                ]}
                title={
                  <>
                    <div className="title__withCopy">
                      <p>Cross Border Payments</p>
                      <Icon
                        name="copy"
                        onClick={() =>
                          copyToClipboard(
                            {
                              IBAN: IBAN ?? "---",
                              BIC: BIC ?? "---",
                              BankName: bankName ?? "---",
                              IntermediaryBank: intermediaryBank ?? "---"
                            },
                            formattedAddress
                          )
                        }
                      />
                    </div>
                  </>
                }
                background={false}
              />
            </>
          }
          footer={getFiatFooters("cross")}
        />
      </>
    );
  };

  /**
   *
   * @function getCryptoInfo
   *
   *    This will be the crypto account details
   *
   *    @param null
   *
   *    @returns null
   *
   */

  const getCryptoInfo = () => {
    const { accountNumber, blockchain } = accountIdentification;

    if (currencyType === "fiat") {
      return <></>;
    }
    return (
      <>
        <Spacer size={20} />

        <Cards.FooterCard
          description={
            <>
              <List
                fullWidth
                listType="horizontal"
                src={[
                  {
                    label: "Address",
                    value: (
                      <>
                        <div className="value__withCopy">
                          <p>{accountNumber ?? "---"}</p>
                          <Icon
                            name="copy"
                            onClick={() =>
                              copyToClipboardSingleValue(accountNumber)
                            }
                          />
                        </div>
                      </>
                    )
                  },
                  {
                    label: "Blockchain",
                    value: blockchain ?? "---"
                  }
                ]}
                title={"Vault Information"}
                background={false}
              />
            </>
          }
          footer={getFooter("crypto")}
        />
      </>
    );
  };

  /**
   *
   * @function getFiatInfo
   *
   *   This will be the ledger account details
   *
   *
   *   @param null
   *
   *   @returns null
   *
   */
  const getFiatInfo = () => {
    const { accountNumber } = accountIdentification;

    if (!isLedgerAccount || currencyType !== "fiat") {
      return <></>;
    }
    return (
      <>
        <Spacer size={20} />
        <Cards.FooterCard
          description={
            <>
              <List
                fullWidth
                listType="horizontal"
                src={[
                  {
                    label: "Account Number",
                    value: (
                      <>
                        <div className="value__withCopy">
                          <p>{accountNumber ?? "---"}</p>
                          <Icon
                            name="copy"
                            onClick={() =>
                              copyToClipboardSingleValue(accountNumber)
                            }
                          />
                        </div>
                      </>
                    )
                  }
                ]}
                title={"Account Information"}
                background={false}
              />
            </>
          }
          footer={getFooter()}
        />
      </>
    );
  };

  /**
   *
   * @function getFiatFooters
   *
   *    create custom footer for local / cross border payment
   *
   *  @param type
   *
   *  @returns null
   *
   *
   */

  const getFiatFooters = (type: string) => {
    const isIntermediary = Boolean(accountIdentification?.intermediaryBank);
    switch (currency) {
      case "GBP":
        if (type === "local") {
          return (
            <ul>
              <li>
                Use these details to receive GBP from bank accounts inside the
                UK.
              </li>
              <li>
                Transfers typically take a few seconds to appear on your
                account, although some may take a few hours.
              </li>
              {/* <li>
                For international transfers, please use the cross border payment
                details on this page.
              </li> */}
            </ul>
          );
        } else {
          return (
            <ul>
              <li>
                Use these details to receive GBP from bank accounts outside the
                UK.
              </li>
              <li>
                Transfers typically take 2 working days to appear on your
                account, although some may take up to 5 working days.
              </li>
              {isIntermediary && (
                <li>
                  To ensure arrival of your funds, please provide the details of
                  the intermediary.
                </li>
              )}
              {/* <li>
                For local transfers, please use the local payment details on
                this page.
              </li> */}
            </ul>
          );
        }
      case "EUR":
        if (type === "local") {
          return (
            <ul>
              <li>
                Use these details to receive EUR from bank accounts within the
                SEPA region.
              </li>
              <li>
                Transfers typically take a few hours to appear on your account.
              </li>
              {/* <li>
                For international transfers, please use the cross border payment
                details on this page.
              </li> */}
            </ul>
          );
        } else {
          return (
            <ul>
              <li>
                Use these details to receive EUR from bank accounts outside the
                SEPA region.
              </li>
              <li>
                Transfers typically take 2 working days to appear on your
                account, although some may take up to 5 working days.
              </li>
              {isIntermediary && (
                <li>
                  To ensure arrival of your funds, please provide the details of
                  the intermediary.
                </li>
              )}
              {/* <li>
                For local transfers, please use the local payment details on
                this page.
              </li> */}
            </ul>
          );
        }
      case "USD":
        if (type === "local") {
          return (
            <ul>
              <li>
                Use these details to receive USD from bank accounts within the
                US.
              </li>
              <li>
                Transfers typically take a few hours to appear on your account.
              </li>
              {/* <li>
                For international transfers, please use the cross border payment
                details on this page.
              </li> */}
            </ul>
          );
        } else {
          return (
            <ul>
              <li>
                Use these details to receive USD from bank accounts outside of
                the US.
              </li>
              <li>
                Transfers typically take 2 working days to appear on your
                account, although some may take up to 5 working days.
              </li>
              {isIntermediary && (
                <li>
                  To ensure arrival of your funds, please provide the details of
                  the intermediary.
                </li>
              )}
              {/* <li>
                For local transfers, please use the local payment details on
                this page.
              </li> */}
            </ul>
          );
        }
    }
  };

  /**
   *
   * @function getFooter
   *
   *  Footer for crypto and ledger accounts
   *
   *  @param type
   *
   *  @returns null
   */
  const getFooter = (type?: string) => {
    return (
      <>
        <div className="footer__withCopy">
          <Icon name="info" />
          <Text
            weight="bolder"
            size="xxlarge"
            label="How to use these Details"
          />
        </div>
        <Spacer size={10} />
        <ul>
          {type === "crypto" ? (
            <>
              <li>This is your unique crypto deposit address. </li>
              <li>
                Transfer usually take a few seconds to appear on your account,
                although some may take a few hours.
              </li>
            </>
          ) : (
            <>
              <li>This account is not addressable from external banks.</li>
              <li>
                To transfer to this account, move funds from one of your other
                Orbital accounts.{" "}
              </li>
            </>
          )}
        </ul>
      </>
    );
  };

  /**
   *
   * @function copyToClipboardSingleValue
   *
   *  Copy only single value.
   *
   *  @param value
   *
   *  @returns null
   */
  const copyToClipboardSingleValue = (value: string | number): void => {
    /* cmd for updating to clipboard */
    navigator.clipboard.writeText(value + "");
    /* Nofity user */
    Notification({
      type: "success",
      message: "Copied to clipboard"
    });
  };

  /**
   *
   * @function copyToClipboard
   *
   *  Copy multiple key value pair values.
   *
   *  @param value
   *
   *  @returns null
   */
  const copyToClipboard = (
    cxt: Record<string, any>,
    bankAddress?: string
  ): void => {
    /* converting the json to string */
    let str = JSON.stringify(cxt);
    /* breaking into chunks  */
    str = str.split('"').join("");
    let sptd = str.substring(1, str.length - 1).split(",");
    str = "";
    /* Looping through array of splitted string */
    for (let i = 0; i < sptd.length; i++) {
      /* for bank address, we double quote, but we remove double quote forehand bcz stringify make everything quoted */
      if (bankAddress && i === 3) {
        str += `BankAddress:${bankAddress} \n`;
        str += sptd[i] + "\n";
        continue;
      }
      str += sptd[i] + "\n";
    }
    /* cmd for updating to clipboard */
    navigator.clipboard.writeText(str);
    /* Nofity user */
    Notification({
      type: "success",
      message: "Copied to clipboard"
    });
  };

  return (
    <>
      <Cards.FooterCard description={getAccountDetails()} />
      {getLocalPayments()}
      {getCrossPayments()}
      {getCryptoInfo()}
      {getFiatInfo()}
    </>
  );
};

export default AccountsDetails;
