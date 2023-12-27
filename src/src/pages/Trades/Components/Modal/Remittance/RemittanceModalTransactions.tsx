import React, { useEffect, useState } from "react";
import {
  Colors,
  Text,
  Form,
  Select,
  Checkbox,
  Row,
  Col,
  Search
} from "@payconstruct/design-system";
import moment from "moment";
import { EFXOrder } from "@payconstruct/pp-types";
import { Spacer } from "../../../../../components/Spacer/Spacer";
import { CurrencyBadge } from "../../../../../components/CurrencyBadge/CurrencyBadge";
import styles from "./RemittanceModal.module.css";
import { Empty, Spin } from "antd";
import { fractionFormat } from "../../../../../utilities/transformers";
import { useGetBatchRemittanceDepositsQuery } from "../../../../../services/ExoticFX/Finance/endpoints/depositEndpoints";
import { OrderDepositDetails } from "../../../../../services/ExoticFX/Finance/financeService";
import { useGetClientByIdQuery } from "../../../../../services/ControlCenter/endpoints/entitiesEndpoint";

interface RemittanceModalTransactionsProps {
  deposit: OrderDepositDetails;
  trade: EFXOrder;
  showOtherTxs: boolean;
  onCheck: (checked: boolean, deposit: any) => void;
}

const RemittanceModalTransactions: React.FC<
  RemittanceModalTransactionsProps
> = ({ deposit, trade, onCheck }) => {
  const [groupedDeposits, setGroupedDeposits]: any[] = useState([]);
  const [groupedFilteredDeposits, setGroupedFilteredDeposits]: any[] = useState(
    []
  );
  const [tradeList, setTradeList]: any[] = useState([["", "Select order id"]]);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const { data, isLoading } = useGetBatchRemittanceDepositsQuery(
    { currency: deposit.currency, vendorId: deposit.vendorId },
    {
      selectFromResult: ({ data, isLoading }) => {
        return {
          data: data,
          isLoading
        };
      },
      refetchOnMountOrArgChange: true
    }
  );
  const { data: clientData } = useGetClientByIdQuery({ id: trade.clientId });
  const clientName =
    clientData?.data?.genericInformation?.registeredCompanyName;

  useEffect(() => {
    if (data) {
      const groupedDeposits: any[] = [];

      (data?.deposits || []).forEach((deposit: any) => {
        const group = groupedDeposits.find(
          (grp: any) =>
            grp.valueDate === deposit.valueDate &&
            grp.orderId === deposit.orderId
        );

        if (group) {
          group.deposits = [...group.deposits, deposit].filter(
            (value, index, self) =>
              index === self.findIndex((t) => t.uuid === value.uuid)
          );
        } else {
          setTradeList((data: any) => [
            ...data,
            [deposit.orderReference, `Order Ref-${deposit.orderReference}`]
          ]);
          groupedDeposits.push({
            orderReference: deposit.orderReference ?? "N/A",
            valueDate: deposit.valueDate,
            orderId: deposit.orderId,
            accountId: deposit.accountId,
            deposits: [deposit]
          });

          // setGroupedDeposits((data: any) => [
          //   ...data,
          //   {
          //     orderReference: deposit.orderReference ?? "N/A",
          //     valueDate: deposit.valueDate,
          //     orderId: deposit.orderId,
          //     accountId: deposit.accountId,
          //     deposits: [deposit]
          //   }
          // ]);
          // setGroupedFilteredDeposits((data: any) => [
          //   ...data,
          //   {
          //     valueDate: deposit.valueDate,
          //     orderId: deposit.orderId,
          //     accountId: deposit.accountId,
          //     deposits: [deposit]
          //   }
          // ]);
        }
      });

      setGroupedDeposits(groupedDeposits);
    }
  }, [data]);

  const handleFilter = (val: any, type: string) => {
    let value: string;
    if (type === "search") value = val.target.value;
    else value = val;

    if (type === "search") {
      setSearch(val.target.value);
    } else {
      setFilter(val);
    }
  };

  let filteredDeposits = [...groupedDeposits];

  if (search) {
    filteredDeposits = groupedDeposits.filter(
      (group: any) =>
        group.orderReference.toLowerCase().indexOf(search?.toLowerCase()) !==
          -1 ||
        group?.deposits.find(
          (deposit: any) =>
            deposit.accountNumber
              .toLowerCase()
              .indexOf(search?.toLowerCase()) !== -1
        )
    );
  }

  if (filter) {
    filteredDeposits = groupedDeposits.filter(
      (item: any) => item.orderReference === filter
    );
  }

  return (
    <div className={styles["receipt-modal"]}>
      <Form
        initialValues={{
          currency: deposit.currency,
          calculatedExchangeAmount: deposit.exchangedAmount,
          vendorAmount: "",
          rate: deposit.expectedRate
        }}
      >
        <Row gutter={15}>
          <Col span={16}>
            <Search
              bordered={true}
              style={{ height: "auto" }}
              // @ts-ignore
              onChange={(v) => handleFilter(v, "search")}
              onClear={() => {}}
            />
          </Col>
          <Col span={8}>
            <Select
              label="Orders"
              optionlist={tradeList}
              placeholder="Select Options"
              // @ts-ignore
              onChange={(v) => handleFilter(v, "filter")}
            />
          </Col>
        </Row>
        <Row gutter={15}>
          {isLoading && (
            <Col span={24}>
              <Spin />
            </Col>
          )}
          {filteredDeposits.length === 0 && !isLoading ? (
            <Col span={24}>
              <Empty description={<span>There is no deposit</span>} />
            </Col>
          ) : (
            filteredDeposits.map((group: any, index: number) => (
              <Col span={24} key={index}>
                <Spacer size={20} />
                <div className={styles["space-between"]}>
                  <Text
                    label={`${group.orderReference} - ${clientName}`}
                    weight="bold"
                    size="small"
                    color={Colors.grey.neutral900}
                  />
                  <Text
                    label={moment(group.valueDate).format("l")}
                    weight="bold"
                    size="small"
                    color={Colors.grey.neutral400}
                  />
                </div>
                {group.deposits.map((deposit: any, i: number) => (
                  <div className={styles["deposit-item"]} key={i}>
                    <Checkbox
                      label=""
                      onChange={(e) => onCheck(e.target.checked, deposit)}
                    />
                    <div>
                      <div className={styles["align-center"]}>
                        <Text
                          label={fractionFormat(deposit.deposited)}
                          weight="bold"
                          size="small"
                          color={Colors.grey.neutral900}
                        />
                        <CurrencyBadge currency={deposit.currency} />
                      </div>
                      <div>
                        <Text
                          label={deposit.accountNumber}
                          weight="bold"
                          size="small"
                          color={Colors.grey.neutral400}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </Col>
            ))
          )}
        </Row>
      </Form>
    </div>
  );
};

export { RemittanceModalTransactions };
