import React from "react";
import { useNavigate } from "react-router-dom";
import { Table, Icon, Tooltip } from "@payconstruct/design-system";
import lodash from "lodash";

import {
  ErrorRowType,
  SelectedFilterType,
  IconKeyType,
  StatusType
} from "./errorQueueTypes";
import { useAppSelector } from "../../../../redux/hooks/store";
import {
  selectClients,
  selectCompanies
  // selectVendors
} from "../../../../config/general/generalSlice";
import { amountFormatter } from "../../../../config/transformer";
import css from "./ErrorQueue.module.css";
import { EntitiesResponse } from "../../../../services/ControlCenter/endpoints/entitiesEndpoint";

interface PropTypes {
  dataSource: ErrorRowType[];
  filterObject: SelectedFilterType;
  vendorsList: EntitiesResponse["data"]["entities"];
  isVendorEntityLoading: boolean;
}

export const statusIcon = (iconName: IconKeyType) => {
  const icons: Array<StatusType> = [
    {
      name: "R1",
      text: "Approved",
      icon: "checkCircle",
      color: ""
    },
    {
      name: "E1",
      text: "Pending Review",
      icon: "clockCircle",
      color: "orange"
    }
  ];
  const defaultIcon: StatusType = {
    icon: "circleInfoOutline",
    text: "Unknown Status"
  };
  const icon: StatusType | undefined = icons.find(
    (icon) => icon.name === iconName
  );
  return icon ? icon : defaultIcon;
};

const filterDataSource = (
  dataSource: Array<ErrorRowType>,
  filterObject: SelectedFilterType
) => {
  const filteredSource: Array<ErrorRowType> = [];

  const {
    optionsClient,
    optionsProcessFlow,
    optionsStatus,
    optionDayOutstanding
  } = filterObject;

  for (const x in dataSource) {
    if (
      !(
        optionsClient === dataSource[x]?.debtor?.debtorName ||
        optionsClient === undefined
      )
    ) {
      continue;
    }
    if (
      !(
        optionsProcessFlow === dataSource[x]?.processFlow ||
        optionsProcessFlow === undefined
      )
    ) {
      continue;
    }
    if (
      !(
        optionsStatus === dataSource[x]?.exitStatusCode ||
        optionsStatus === undefined
      )
    ) {
      continue;
    }
    if (!(optionDayOutstanding === 0)) {
      if (!(optionDayOutstanding === dataSource[x]?.daysOutstanding)) {
        if (
          !(
            optionDayOutstanding <= dataSource[x]?.daysOutstanding &&
            optionDayOutstanding === 5
          )
        ) {
          continue;
        }
      }
    }

    // If it reach this part, it satisfies all of the above
    filteredSource.push(dataSource[x]);
  }

  return filteredSource;
};

const ErrorQueueListTable: React.FC<PropTypes> = ({
  dataSource,
  filterObject,
  vendorsList
}) => {
  dataSource = filterDataSource(dataSource, filterObject);
  const navigate = useNavigate();

  const getInitiatedSourceName = (sourceValue: string) => {
    switch (sourceValue) {
      case "bms":
        return "Control Center";
      case "cms":
        return "Client Portal";
      case "efx":
        return "EFX Engine";
      case "payments":
        return "Payments Engine";
      case "pay-revenue-processor":
        return "Revenue Processor";
      default:
        return "Control Center";
    }
  };

  const getExceptionMessage = (data: any) => {
    switch (data.exitStatusCode) {
      case "C1":
        return "Screening Rejected";
      case "P100":
        return "Manual Review";
      default:
        return lodash.startCase(data.messageValidationResult);
    }
  };

  const client: any = useAppSelector(selectClients);
  // const vendor: any = useAppSelector(selectVendors);
  const companies: any = useAppSelector(selectCompanies);

  const getOwner = (ownerEntityId: any) => {
    const ownerEntity = [...client, ...vendorsList, ...companies]?.find(
      (rec: any) => rec?.id === ownerEntityId
    );
    return ownerEntity?.genericInformation?.registeredCompanyName ?? "---";
  };

  const columns = [
    {
      dataIndex: "createdAt",
      key: "accountBalanceId",
      title: "Created On",
      render: (createdAt: string) => {
        const d = new Date(createdAt);
        return d.toLocaleString("en-US");
      }
    },
    {
      title: "Created By",
      dataIndex: "created",
      key: "created",
      align: "center",
      render: (createdData: any) => {
        return (
          <Tooltip text={createdData?.email}>
            {`${createdData?.firstName ?? "---"} ${
              createdData?.lastName ?? "---"
            }`}
          </Tooltip>
        );
      }
    },
    {
      title: "Initiated From",
      dataIndex: "created",
      key: "initiatedFrom",
      align: "center",
      render: (createdData: any) => {
        return getInitiatedSourceName(createdData?.source);
      }
    },
    {
      title: "Internal Payment",
      dataIndex: "internalPayment",
      key: "internalPayment",
      align: "center",
      render: (internalPayment: boolean) => {
        return internalPayment ? "Yes" : "No";
      }
    },
    {
      title: "Account Owner",
      dataIndex: "ownerEntityId",
      key: "ownerEntityId",
      align: "center",
      render: (text: any) => {
        return getOwner(text);
      }
    },
    // {
    //   key: "debtor",
    //   title: "Client",
    //   render: (row: ErrorRowType) => row?.debtor?.debtorName
    // },
    {
      dataIndex: "transactionReference",
      key: "transactionReference",
      title: "Transaction Reference"
    },
    {
      dataIndex: "isOutbound",
      key: "isOutboun",
      title: "Payment Type",
      render: (text: string) => (text ? "Debit" : "Credit")
    },
    // {
    //   dataIndex: "processFlow",
    //   key: "processFlow",
    //   title: "Process Flow",
    //   render: (text: string) => lodash.startCase(text)
    // },
    // {
    //   dataIndex: 'isOutbound',
    //   key: "isOutbound",
    //   title: "Payment Type",
    //   render: (isOutbound: boolean) => (isOutbound ? "Debit" : "Credit")
    // },
    // {
    //   key: "curency",
    //   title: "Ccy.",
    //   render: (row: ErrorRowType) =>
    //     row?.isOutbound ? row?.debitCurrency : row?.creditCurrency
    // },
    {
      title: "Debit Amount",
      dataIndex: "debitAmount",
      key: "debitAmount",
      align: "center",
      render: (amount: number) => (amount ? amountFormatter(amount) : "")
    },
    {
      title: "Debit Currency",
      dataIndex: "debitCurrency",
      key: "debitCurrency",
      align: "center"
    },
    {
      title: "Credit Amount",
      dataIndex: "creditAmount",
      key: "creditAmount",
      align: "center",
      render: (amount: number) => (amount ? amountFormatter(amount) : "")
    },
    {
      title: "Credit Currency",
      dataIndex: "creditCurrency",
      key: "creditCurrency",
      align: "center"
    },
    {
      title: "Days outstanding review",
      dataIndex: "daysOutstanding",
      key: "daysOutstanding",
      align: "center",
      sorter: (a: any, b: any) => a.daysOutstanding - b.daysOutstanding,
      sortDirections: ["ascend", "descend"]
      // defaultSortOrder: sortBy === 'desc' ? 'ascend' : 'descend'
    },
    {
      title: "Exception",
      dataIndex: "",
      key: "messageValidationResult",
      align: "center",
      fixed: "right",
      render: (text: any) => getExceptionMessage(text)
    },
    {
      title: "Action",
      dataIndex: "",
      key: "x",
      align: "center",
      fixed: "right",
      render: (record: any) => (
        <>
          <Tooltip text="View Details">
            <Icon
              onClick={() => {
                navigate(`/error-queue/${record.id}`, {
                  state: vendorsList
                });
              }}
              name="eyeOpened"
            />
          </Tooltip>
        </>
      )
    }
  ];
  return (
    <>
      <Table
        pagination={{
          pageSizeOptions: ["2", "5", "10", "25", "50", "100"],
          showSizeChanger: true,
          defaultPageSize: 5,
          showTotal: (total, range) =>
            `Show ${range[0]} to ${range[1]} of ${total} entries`
        }}
        rowKey="id"
        size="small"
        scroll={{ x: true }}
        dataSource={dataSource}
        tableColumns={columns}
        rowClassName={css["error-data-row"]}
        // onRow={(item) => {
        //   return {
        //     onClick: () => {
        //       navigate(`/error-queue/${item.id}`);
        //     }
        //   };
        // }}
      />
    </>
  );
};

export { ErrorQueueListTable as default };
