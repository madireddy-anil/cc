import React, { useState, useEffect, useMemo } from "react";
import {
  Button,
  DatePicker,
  Drawer,
  Input,
  Select
} from "@payconstruct/design-system";
import { useAppSelector, useAppDispatch } from "../../../../redux/hooks/store";
import {
  showFilterAction,
  filterListAction,
  selectTrades,
  EFXOrder
} from "../../../../config/trades/tradeSlice";
import moment, { Moment } from "moment-timezone";
import { selectTimezone } from "../../../../config/general/generalSlice";
import styles from "./TradeDrawer.module.css";

interface DrawerProps {
  setCounter: (e: any) => void;
  tradeList: EFXOrder[];
}

const FilterDrawerDom: React.FC<DrawerProps> = ({
  setCounter,
  tradeList: trades
}) => {
  const dispatch = useAppDispatch();
  const {
    tradesHistory: { showFilters }
  } = useAppSelector(selectTrades);
  const timezone = useAppSelector(selectTimezone);
  const { RangePicker } = DatePicker;
  const [tempList, setTempList] = useState<EFXOrder[]>(trades);

  // This function is used to filter the list of order per data range
  const [dateRange, setDateRange] = useState<[string, string] | undefined>();
  const [selectedClientNames, setSelectedClientNames] = useState<string[]>([]);
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>([]);
  const [selectAccountType, setSelectedAccountType] = useState<string[]>([]);
  const [selectStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectAmount, setAmount] = useState<number>();
  const [selectedOrderReference, setSelectedOrderReference] = useState<
    string[]
  >([]);

  const toOptionFormat = <T, K extends keyof T>(orders: T[], property: K) => {
    const cachedNames: Map<string, string> = new Map();

    if (Array.isArray(orders)) {
      for (const order of orders) {
        let name = order[property];
        if (typeof name === "string") {
          if (!cachedNames.has(name))
            cachedNames.set(name, name.replaceAll("_", " ").toUpperCase());
        }
      }
    }

    return Array.from(cachedNames);
  };

  const clientNameOptions = useMemo(() => {
    return toOptionFormat(trades, "clientName");
  }, [trades]);

  const currenciesOptions = useMemo(() => {
    return toOptionFormat(trades, "buyCurrency");
  }, [trades]);

  const accountTypeOptions = useMemo(() => {
    return toOptionFormat(trades, "requestedAccountType");
  }, [trades]);

  const orderReferenceOptions = useMemo(() => {
    return toOptionFormat(trades, "orderReference");
  }, [trades]);

  const statusOptions = useMemo(() => {
    return toOptionFormat(trades, "status");
  }, [trades]);

  useEffect(() => {
    let filters: EFXOrder[];

    //Data Range filter
    filters = trades.filter((order: EFXOrder) => {
      if (!dateRange) return order;

      const orderDate = moment(order.executionDate)
        .tz(timezone)
        .format("YYYY-MM-DD");

      return orderDate >= dateRange[0] && orderDate <= dateRange[1];
    });

    //Client Name filter
    filters = filters.filter((order: EFXOrder) => {
      if (!selectedClientNames.length) return order;
      return selectedClientNames.includes(order.clientName);
    });

    filters = filters.filter((order: EFXOrder) => {
      if (!selectedCurrencies.length) return order;
      return selectedCurrencies.includes(order.buyCurrency);
    });

    filters = filters.filter((order: EFXOrder) => {
      if (!selectAccountType.length) return order;
      return selectAccountType.includes(order.requestedAccountType);
    });

    filters = filters.filter((order: EFXOrder) => {
      if (!selectedOrderReference.length) return order;
      return selectedOrderReference.includes(order.orderReference);
    });

    filters = filters.filter((order: EFXOrder) => {
      if (!selectStatus.length) return order;
      return selectStatus.includes(order.status);
    });

    filters = filters.filter((order: EFXOrder) => {
      if (!selectAmount) return order;
      console.log(selectAmount);
      console.log("order", order.buyAmount);
      const amount = order.buyAmount.toString();
      return (
        parseInt(amount) ===
        parseInt(selectAmount.toString().replace(/\D/g, ""))
      );
    });

    setTempList(filters);
  }, [
    trades,
    dateRange,
    selectedClientNames,
    selectedCurrencies,
    selectedOrderReference,
    selectAccountType,
    selectStatus,
    selectAmount
  ]);

  const selectRangeDate = (key: string, dateRange: [Moment, Moment]) => {
    if (!dateRange) return setDateRange(undefined);

    const [start, end] = dateRange;

    setDateRange([
      start.tz(timezone).format("YYYY-MM-DD"),
      end.tz(timezone).format("YYYY-MM-DD")
    ]);
  };

  const resetFilter = () => {
    dispatch(filterListAction(trades));
    dispatch(showFilterAction(false));
    /* Reset the state of the drawer */
    setTimeout(() => {
      setCounter((state: any) => state + 1);
    }, 600);
  };

  const showFiltered = () => {
    dispatch(filterListAction(tempList));
    dispatch(showFilterAction(false));
  };

  return (
    <Drawer
      className={styles["TradeDrawer"]}
      title="Filter"
      width={400}
      visible={showFilters}
      onClose={() => {
        dispatch(showFilterAction(false));
      }}
    >
      <div>
        {/* @ts-ignore */}
        <RangePicker
          style={{ width: "100%", height: "46px" }}
          label="Select execution date"
          onChange={(val: any) => selectRangeDate("orderExecutionDate", val)}
          onOk={function noRefCheck() { }}
          placeholder={["From Date", "To Date"]}
        />
        <br />
      </div>
      <div>
        <Select
          label="Select a Client"
          mode="multiple"
          optionlist={clientNameOptions}
          onChange={(val: any) => setSelectedClientNames(val)}
          placeholder="Select Options"
        />
      </div>
      <br />
      <div>
        <Select
          label="Account Type"
          mode="multiple"
          optionlist={accountTypeOptions}
          placeholder="Select"
          style={{
            width: "100%"
          }}
          onChange={(val: any) => setSelectedAccountType(val)}
        />
        <br />
      </div>
      <div>
        <Select
          label="Order Reference"
          mode="multiple"
          optionlist={orderReferenceOptions}
          placeholder="Select"
          style={{
            width: "100%"
          }}
          onChange={(val: any) => setSelectedOrderReference(val)}
        />
        <br />
      </div>
      <div>
        <Select
          label="Deposit Currency"
          mode="multiple"
          optionlist={currenciesOptions}
          placeholder="Select"
          style={{
            width: "100%"
          }}
          onChange={(val: any) => setSelectedCurrencies(val)}
        />
        <br />
      </div>
      <div>
        <Input
          label="Amount"
          type="text"
          size="large"
          placeholder="Amount"
          onChange={(e: any) => setAmount(e.target.value)}
        />
        <br />
      </div>
      <div>
        <Select
          label="Status"
          optionlist={statusOptions}
          placeholder="Select"
          style={{
            width: "100%"
          }}
          onChange={(val: any) => setSelectedStatus(val)}
          mode="multiple"
        />
        <br />
      </div>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Button
            label="Reset"
            onClick={resetFilter}
            size="small"
            type="secondary"
          />
          <Button
            label={`See Results (${tempList.length})`}
            onClick={showFiltered}
            size="small"
            type="primary"
          />
        </div>
      </div>
    </Drawer>
  );
};

export { FilterDrawerDom };
