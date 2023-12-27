import React from "react";
import { useNavigate } from "react-router-dom";
import { Table } from "@payconstruct/design-system";
import css from "./ErrorQueue.module.css";

interface ErrorRow {
  created: string;
  client: string;
  reference: string;
  processFlow: string;
  type: string;
  currency: string;
  amount: string;
  exception: string;
  status: string;
}

interface PropTypes {
  dataSource: ErrorRow[];
}

const ErrorQueueListTable: React.FC<PropTypes> = ({ dataSource }) => {
  const columns = [
    {
      dataIndex: "created",
      key: "created",
      title: "Created"
    },
    {
      dataIndex: "client",
      key: "client",
      title: "Client"
    },
    {
      dataIndex: "reference",
      key: "reference",
      title: "Reference"
    },
    {
      dataIndex: "processFlow",
      key: "processFlow",
      title: "Process Flow"
    },
    {
      dataIndex: "type",
      key: "type",
      title: "Type"
    },
    {
      dataIndex: "curency",
      key: "curency",
      title: "Ccy."
    },
    {
      dataIndex: "amount",
      key: "amount",
      title: "Amount"
    },
    {
      dataIndex: "exception",
      key: "exception",
      title: "Exception"
    },
    {
      dataIndex: "status",
      key: "status",
      title: "Status"
    }
  ];
  const navigate = useNavigate();
  return (
    <Table
      rowClassName={css["error-data-row"]}
      size="small"
      pagination={false}
      dataSource={dataSource}
      tableColumns={columns}
      onRow={(item) => {
        return {
          onClick: () => {
            navigate(`/error-queue/${item.id}`);
          }
        };
      }}
    />
  );
};

export { ErrorQueueListTable as default };
