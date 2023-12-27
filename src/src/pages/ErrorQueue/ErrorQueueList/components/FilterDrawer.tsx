import React from "react";
import { Text, Button, Select } from "@payconstruct/design-system";
import { Drawer, Space } from "antd";
import { Spacer } from "../../../../components";
import css from "./ErrorQueue.module.css";
import { statusIcon } from "./ErrorQueueListTable";

import {
  FilterOptionType,
  ErrorRowType,
  SelectedFilterType,
  IconKeyType
} from "./errorQueueTypes";

interface PropTypes {
  visible?: true | false;
  handleClose: () => void;
  dataSource: Array<ErrorRowType>;
  setFilter: (a: any) => void;
  selectedFilter: SelectedFilterType;
}

const optionDaysOutstanding: Array<FilterOptionType> = [
  [1, "1 day"],
  [2, "2 days"],
  [3, "3 days"],
  [4, "4 days"],
  [5, "5 days or later"]
];

const getFilterObjects = (dataSource: Array<ErrorRowType>) => {
  // Options Store
  const optionsClient: Array<FilterOptionType> = [];
  const optionsProcessFlow: Array<FilterOptionType> = [];
  const optionsStatus: Array<FilterOptionType> = [];

  // Options compare
  const compareClient: Array<string> = [];
  const compareProcessFlow: Array<string> = [];
  const compareOptionStatus: Array<string> = [];

  for (const x in dataSource) {
    if (!compareClient.includes(dataSource[x]?.debtor?.debtorName)) {
      compareClient.push(dataSource[x]?.debtor?.debtorName);
      optionsClient.push([
        dataSource[x]?.debtor?.debtorName,
        dataSource[x]?.debtor?.debtorName
      ]);
    }
    if (!compareProcessFlow.includes(dataSource[x]?.processFlow)) {
      compareProcessFlow.push(dataSource[x]?.processFlow);
      optionsProcessFlow.push([
        dataSource[x]?.processFlow,
        dataSource[x]?.processFlow
      ]);
    }
    if (!compareOptionStatus.includes(dataSource[x]?.exitStatusCode)) {
      compareOptionStatus.push(dataSource[x]?.exitStatusCode);
      let statusName = statusIcon(dataSource[x]?.exitStatusCode as IconKeyType);
      optionsStatus.push([dataSource[x]?.exitStatusCode, statusName?.text]);
    }
  }
  return { optionsClient, optionsProcessFlow, optionsStatus };
};

const FilterDrawer: React.FC<PropTypes> = ({
  visible,
  handleClose,
  dataSource,
  setFilter,
  selectedFilter
}) => {
  const { optionsClient, optionsProcessFlow, optionsStatus } =
    getFilterObjects(dataSource);

  return (
    <Drawer
      onClose={handleClose}
      visible={visible}
      closable={false}
      width="450px"
      footer={
        <div className={css["filter-drawer-buttons"]}>
          <Button
            type="primary"
            label={`Filter ${
              selectedFilter.count > 0 ? `(${selectedFilter.count})` : ""
            }`}
            size="large"
            onClick={() => {
              let selectedCount = 0;
              for (const [key, value] of Object.entries(selectedFilter)) {
                if (key !== "count") if (value !== undefined) selectedCount++;
              }
              selectedFilter.count = selectedCount;
              setFilter({ ...selectedFilter });
            }}
          />
          <Button
            type="secondary"
            label="Reset"
            onClick={() => {
              setFilter({
                ...selectedFilter,
                optionsClient: undefined,
                optionsProcessFlow: undefined,
                optionsStatus: undefined,
                optionDayOutstanding: 0,
                count: 0
              });
            }}
          />
        </div>
      }
    >
      <Space>
        <Text label="Filter" size="xlarge" weight="bolder" />
      </Space>
      <Spacer size={25} />
      <Select
        label="Client"
        optionlist={optionsClient}
        placeholder="Select"
        style={{
          width: "100%"
        }}
        onChange={(value): void => {
          selectedFilter.optionsClient = value;
          setFilter(selectedFilter);
        }}
        allowClear={true}
        clearIcon={"a"}
      />
      <Spacer size={25} />
      <Select
        label="Process Flow"
        optionlist={optionsProcessFlow}
        placeholder="Select"
        style={{
          width: "100%"
        }}
        onChange={(value): void => {
          selectedFilter.optionsProcessFlow = value;
          setFilter(selectedFilter);
        }}
      />
      <Spacer size={25} />
      <Select
        label="Status"
        optionlist={optionsStatus}
        placeholder="Select"
        style={{
          width: "100%"
        }}
        onChange={(value): void => {
          selectedFilter.optionsStatus = value;
          setFilter(selectedFilter);
        }}
      />
      <Spacer size={25} />
      <Select
        label="Days Outstanding Review"
        optionlist={optionDaysOutstanding}
        placeholder="Select"
        style={{
          width: "100%"
        }}
        onChange={(value): void => {
          selectedFilter.optionDayOutstanding = parseFloat(value);
          setFilter(selectedFilter);
        }}
      />
    </Drawer>
  );
};

export { FilterDrawer as default };
