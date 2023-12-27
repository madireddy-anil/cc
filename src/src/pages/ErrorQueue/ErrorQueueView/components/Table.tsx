import React, { FC } from "react";
import clsx from "clsx";
import { Text } from "@payconstruct/design-system";
import { TableWrapper } from "../../../../components";
import { AccountCard, TAccount as TAccount2 } from "./AccountCard";
import css from "./Table.module.css";

type TAccount = {
  sender: TAccount2;
  beneficiary: TAccount2;
};

export type TTableRow = {
  createdAt: string;
  transactionReference: string;
  processFlow: string;
  isOutbound: boolean;
  debitCurrency: "EUR" | "GBP" | "CNY";
  creditCurrency: "EUR" | "GBP" | "CNY";
  debitAmount: number;
  creditAmount: number;
  remittanceInformation: string;
  creditor: any;
  creditorAgent: any;
  debtor: any;
  debtorAgent: any;
  debtorAccountType: string;
  creditorAccountType: string;
  exitStatusCode: string;
};

interface PropTypes {
  tableRows: TTableRow[];
  openRows: Array<number>;
  setOpen: (p: number) => void;
}

export const Table: FC<PropTypes> = ({ tableRows, openRows, setOpen }) => {
  console.log("type", tableRows);

  return (
    <TableWrapper>
      <table className={css["dynamic-table"]}>
        <thead>
          <tr>
            <th>&nbsp;</th>
            <th>Created On</th>
            <th>Transaction Reference</th>
            <th>Process Flow</th>
            <th>Payment Type</th>
            <th>Currency</th>
            <th>Amount</th>
            <th>Remittance Information</th>
            <th>Exception Status</th>
          </tr>
        </thead>
        <tbody>
          {tableRows.map((row: TTableRow, i: number) => {
            const type = row?.isOutbound ? "Debit" : "Credit";
            const currency = row?.isOutbound
              ? row?.debitCurrency
              : row?.creditCurrency;
            const amount = row?.isOutbound
              ? row?.debitAmount
              : row?.debitAmount;
            const account: TAccount = {
              sender: {
                name: row?.debtor?.debtorName ?? "---",
                reference: `${row?.debtorAgent?.debtorAgentCountry ?? "---"} ${
                  row?.debtorAgent?.debtorAgentId ?? "---"
                }`,
                amount: (row?.debitAmount || "").toString(),
                currency: row?.debitCurrency ?? "---",
                type: row?.debtorAccountType ?? "---"
              },
              beneficiary: {
                name: row?.creditor?.creditorName ?? "---",
                reference: `${
                  row?.creditorAgent?.creditorAgentCountry ?? "---"
                } ${row?.creditorAgent?.creditorAgentId ?? "---"}`,
                amount: (row?.creditAmount || "---").toString(),
                currency: row?.creditCurrency ?? "---",
                type: row?.creditorAccountType ?? "---"
              }
            };
            return (
              <React.Fragment key={i}>
                <tr
                  className={Boolean(i % 2) ? css["odd"] : ""}
                  onClick={() => setOpen(i)}
                >
                  <td className={css["arrow"]}>
                    <span
                      className={openRows.indexOf(i) > -1 ? css["open"] : ""}
                    />
                  </td>
                  <td>
                    <Text
                      label={
                        row?.createdAt
                          ? new Date(row?.createdAt).toLocaleString("en-GB")
                          : "---"
                      }
                    />
                  </td>
                  <td style={{ wordBreak: "break-word" }}>
                    <Text label={row?.transactionReference ?? "---"} />
                  </td>
                  <td style={{ wordBreak: "break-word" }}>
                    <Text label={row?.processFlow ?? "---"} />
                  </td>
                  <td>
                    <Text label={type ?? "---"} />
                  </td>
                  <td>
                    <Text label={currency ?? "---"} />
                  </td>
                  <td>
                    <Text label={(amount || "---").toString()} />
                  </td>
                  <td style={{ wordBreak: "break-word" }}>
                    <Text label={row?.remittanceInformation ?? "---"} />
                  </td>
                  <td>
                    <Text label={row?.exitStatusCode ?? "---"} />
                  </td>
                </tr>
                {openRows.indexOf(i) > -1 && (
                  <tr
                    className={clsx(
                      css["tdetails"],
                      `${Boolean(i % 2) ? css["odd"] : ""}`
                    )}
                  >
                    <td colSpan={9}>
                      <div>
                        <AccountCard account={account?.sender} />
                        <AccountCard
                          account={account?.beneficiary}
                          beneficiary
                        />
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </TableWrapper>
  );
};
