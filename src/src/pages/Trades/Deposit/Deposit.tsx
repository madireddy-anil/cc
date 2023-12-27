import { Colors } from "@payconstruct/design-system";
import React, { useEffect, lazy } from "react";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks/store";
import { selectDeposit } from "./DepositSlice";
import { updateMenuShow } from "../../../config/general/generalSlice";
import { Steps } from "../../../components/Steps/Steps";
import { nextStepAction, previousStepAction } from "./DepositSlice";
import { ConfirmTrade } from "../../Trades/Components/Modal/ConfirmTrade";

import { setToInitialCLient } from "../../Components/ClientSelection/ClientSelectionSlice";
import { ProductGroup } from "../../../products/Products";

interface DepositProps {}
const Deposit: React.FC<DepositProps> = () => {
  const dispatch = useAppDispatch();
  const { step } = useAppSelector(selectDeposit);

  useEffect(() => {
    dispatch(updateMenuShow(false));
    dispatch(setToInitialCLient());
  }, [dispatch]);

  const ClientSelection = lazy(
    () => import("../../Components/ClientSelection/ClientSelection")
  );
  const AccountSelection = lazy(
    () => import("../../Components/AccountSelection/AccountSelection")
  );
  const DepositAmount = lazy(
    () => import("../Components/DepositAmount/DepositAmount")
  );
  const Beneficiary = lazy(
    () => import("../Components/TradeBeneficiary/Beneficiary")
  );

  const onNextStepActionHandler = () => {
    dispatch(nextStepAction());
  };

  const onPreviousStepActionHandler = () => {
    dispatch(previousStepAction());
  };

  const steps = [
    {
      key: 0,
      title: "Client Selection",
      content: <ClientSelection nextStepHandler={onNextStepActionHandler} />
    },
    {
      key: 1,
      title: "Deposit Currency Selection",
      content: (
        <AccountSelection
          nextStepHandler={onNextStepActionHandler}
          previousStepHandler={onPreviousStepActionHandler}
          hideUnavailableBalance={false}
          filterByProductGroup={ProductGroup.EFX}
        />
      )
    },
    {
      key: 2,
      title: "Deposit & Exchange Attributes",
      content: (
        <DepositAmount
          nextStepHandler={onNextStepActionHandler}
          previousStepHandler={onPreviousStepActionHandler}
        />
      )
    },
    {
      key: 3,
      title: "Beneficiary Selection",
      content: (
        <Beneficiary
          ConfirmModal={ConfirmTrade}
          confirmBtnLabel="Confirm Order"
          previousStepHandler={onPreviousStepActionHandler}
          filterByProductGroup={ProductGroup.GlobalPayments}
        />
      )
    }
  ];

  return (
    <main
      style={{
        padding: "40px",
        margin: 0,
        height: "calc(100vh - 56px)",
        overflowY: "auto",
        background: Colors.grey.neutral50
      }}
    >
      <Steps steps={steps} currentStep={step} />
    </main>
  );
};

export { Deposit as default };
