import { Status } from "@payconstruct/design-system";

const columns = [
  { key: "currency", title: "Currency", dataIndex: "currency" },
  {
    key: "expected",
    title: "Expected Deposit Amount",
    dataIndex: "expected"
  },
  {
    key: "remitted",
    title: "Remitted Amount",
    dataIndex: "remitted"
  },
  {
    key: "accountNumber",
    title: "Account Number",
    dataIndex: "accountNumber"
  },
  {
    key: "status",
    title: "Status",
    dataIndex: "status",
    fixed: "right",
    render: (text: string) => {
      if (text === "complete")
        return <Status type="approved" tooltipText={text} />;

      return <Status type="pending" tooltipText={text} />;
    }
  }
];

export { columns };
