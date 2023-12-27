import { Colors, CurrencyTag, List } from "@payconstruct/design-system";
import React, { CSSProperties, useMemo } from "react";
import style from "./tradeQueue.module.css";
import { EFXOrder } from "@payconstruct/pp-types";
import moment from "moment";
import { isCurrencyPresent } from "../../Helpers/currencyTag";
import { useGetTradesQuery } from "../../../../services/tradesService";

const groupDataPerDate = (list: EFXOrder[]) => {
  let dates: { [key: string]: any } = {};
  const sortedDate = sortDataPerDate(list);
  sortedDate.forEach((el) => {
    const d = moment(el.executionDate).format("YYYY-MM-DD");
    if (dates[d]) {
      dates[d].push(el);
    } else {
      dates = { ...dates, [d]: [el] };
    }
  });

  return dates;
};

const sortDataPerDate = (list: EFXOrder[]) => {
  return list.sort((a, b) => {
    const aValue = moment(a.executionDate).format("YYYY-MM-DD");
    const bValue = moment(b.executionDate).format("YYYY-MM-DD");

    if (aValue < bValue) {
      return -1;
    }
    if (aValue > bValue) {
      return 1;
    }
    return 0;
  });
};

interface TradeQueueProps extends React.HTMLAttributes<HTMLBaseElement> {
  style?: CSSProperties;
  className?: string;
}

const TradeQueue = React.forwardRef<any, TradeQueueProps>((props, ref) => {
  const { tradeList = [] } = useGetTradesQuery("", {
    selectFromResult: ({ data, isLoading, isFetching }) => ({
      tradeList: data?.orders,
      isLoading,
      isFetching
    }),
    refetchOnMountOrArgChange: 5,
    refetchOnFocus: true
  });

  const customStyle = {
    ...props.style,
    borderColor: Colors.grey.neutral100
  };

  let filteredList = [...tradeList];

  const memoizePerDate = useMemo(() => {
    return groupDataPerDate(filteredList);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tradeList]);

  // TODO: Pull Data
  // Filter by date:
  // Then by tradeStatus:
  // Filter tradeStatus === "pending_approval_client";

  return (
    <aside ref={ref} className={style["trade-queue"]} style={customStyle}>
      {Object.keys(memoizePerDate).map((dateKey, index: number) => {
        return (
          <div key={dateKey + "_" + index}>
            <p className={style["trade-queue__title"]}>
              Trade queue for {moment(dateKey).format("DD/MM/YYYY")}
            </p>
            {memoizePerDate[dateKey].map((trade: EFXOrder, index: number) => {
              return (
                <List
                  key={dateKey + "_list_" + index}
                  background
                  listType="vertical"
                  src={[
                    {
                      label: "Account",
                      value: trade?.sellAccountId ?? "-"
                    },
                    {
                      label: "Beneficiary",
                      value: trade?.beneficiaryName ?? "-"
                    },
                    {
                      currencyTag: (
                        <CurrencyTag
                          currency={trade.buyCurrency}
                          prefix={isCurrencyPresent(trade.buyCurrency)}
                        />
                      ) as any,
                      label: "Amount",
                      value: String(trade.buyAmount)
                    }
                  ]}
                />
              );
            })}
          </div>
        );
      })}
    </aside>
  );
});

export { TradeQueue };
