import { FC } from "react";
import { Space } from "antd";
import { Text, Colors } from "@payconstruct/design-system";
import { TableWrapper, Spacer, CurrencyBadge } from "../../../../components";

export type TAccount = {
  name: string;
  reference: string;
  accountNumber?: string;
  amount: string;
  currency: "EUR" | "GBP" | "CNY";
  type: string;
};

interface PropTypes {
  account: TAccount;
  beneficiary?: boolean;
}

export const AccountCard: FC<PropTypes> = ({ account, beneficiary }) => {
  const { name, reference, amount, currency, type, accountNumber } = account;
  return (
    <TableWrapper>
      <Space size={10} align="baseline">
        <Text
          label={beneficiary ? "Beneficiary Details" : "Sender Details"}
          weight="bold"
        />
        <Text
          label={type.charAt(0).toUpperCase() + type.slice(1)}
          size="xsmall"
          color={Colors.grey.neutral500}
        />
      </Space>
      <Spacer size={25} />
      <Space size={4} direction="vertical">
        <Text label={name} size="medium" />
        <Text label={reference} size="xsmall" color={Colors.grey.neutral500} />
        <Text
          label={accountNumber}
          size="xsmall"
          color={Colors.grey.neutral500}
        />
      </Space>
      <Spacer size={25} />
      <Space size={4} direction="vertical">
        <Text
          label="Amount Sent"
          size="xsmall"
          color={Colors.grey.neutral500}
        />
        <Space>
          <Text label={amount} size="medium" />
          <CurrencyBadge currency={currency} />
        </Space>
      </Space>
    </TableWrapper>
  );
};
