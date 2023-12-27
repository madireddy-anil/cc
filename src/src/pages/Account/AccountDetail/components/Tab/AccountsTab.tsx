import { Tab } from "@payconstruct/design-system";
import * as React from "react";
import AccountsDetails from "./components/AccountsDetails";
import Transactions from "./components/Transactions";
import Statement from "./components/Statement";
import Adjustments from "./components/Adjustments";

interface AccountsTabProps {
  accountDetails: any;
  currentAccountDetails: any;
  onTabChange: (value: string) => void;
}

const AccountsTab: React.FC<AccountsTabProps> = ({
  accountDetails,
  currentAccountDetails,
  onTabChange
}) => {
  const onChangeHandler = (newActiveKey: string) => {
    onTabChange(newActiveKey);
  };

  return (
    <Tab
      // extra={
      //   <Button label="Download" type="link" icon={{ name: "download" }} />
      // }
      onChange={onChangeHandler}
      initialpanes={[
        {
          content: <Transactions accountDetails={accountDetails} />,
          key: "1",
          title: "Transactions",
          disabled: false,
          hidden: false
        },
        {
          content: <Statement accountDetails={accountDetails} />,
          key: "2",
          title: "Statement",
          disabled: false,
          hidden:
            accountDetails?.account?.productId ===
            "4a6933e6-ee05-4a37-9bb5-776f72d681e8"
        },
        {
          content: (
            <AccountsDetails
              accountDetails={accountDetails}
              currentAccountDetails={currentAccountDetails}
            />
          ),
          key: "3",
          title: "Account Details",
          disabled: false,
          hidden: false
        },
        {
          content: <Adjustments accountDetails={accountDetails} />,
          key: "4",
          title: "Adjustments",
          disabled: false,
          hidden: false
        }
      ]}
      size="small"
      tabposition="top"
      type="line"
    />
  );
};

export default AccountsTab;
