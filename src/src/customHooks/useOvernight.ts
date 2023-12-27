import { useState, useEffect } from "react";
import { useGetTradeByIDQuery } from "../services/tradesService";
import { useGetDepositsQuery } from "../services/ExoticFX/Finance/endpoints/depositEndpoints";
import { EFXOrder } from "@payconstruct/pp-types";
import { OrderDepositDetails } from "../services/ExoticFX/Finance/financeService";

export type useOvernightType = (id: string) => {
  selectedTrade: EFXOrder | undefined;
  isDay1: boolean;
  deposits: OrderDepositDetails[];
  localDeposits: OrderDepositDetails[];
};

export const useOvernight: useOvernightType = (id) => {
  const { data: selectedTrade } = useGetTradeByIDQuery(
    { id },
    {
      refetchOnMountOrArgChange: true
    }
  );

  const [isDay1, setIsDay1] = useState(false);
  const { data: depositList } = useGetDepositsQuery({ id });

  const deposits = (depositList?.deposits || []).map((d) => d.deposits).flat();
  const confirmedDeposits = deposits.filter(
    (d) => d.status === "pending_remittance" || d.status === "complete"
  );

  const localDeposits = deposits.filter((d) => d.type === "local");
  const confirmedLocalDeposits = localDeposits.filter(
    (d) => d.status === "pending_remittance" || d.status === "complete"
  );

  useEffect(() => {
    if (selectedTrade && selectedTrade.depositType === "overnight") {
      const { status } = selectedTrade;

      if (
        (status === "accepted_by_client" ||
          status === "deposit_ready_to_trade" ||
          status === "await_final_settlement" ||
          status === "completed" ||
          status === "payment_initiated" ||
          status === "auto_accepted") &&
        deposits.length > 0 &&
        (localDeposits.length === 0 ||
          (localDeposits.length > 0 &&
            localDeposits.length === confirmedLocalDeposits.length))
      ) {
        setIsDay1(true);
      }
    }
  }, [selectedTrade, deposits, confirmedDeposits]);

  return { selectedTrade, isDay1, deposits, localDeposits };
};
