import { Colors } from "@payconstruct/design-system";
import React, { useEffect, lazy, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks/store";
import {
  updateMenuShow,
  updateTopBarShow
} from "../../config/general/generalSlice";
import {
  setToInitialStep,
  nextStepAction,
  previousStepAction,
  selectPayment
} from "./PaymentSlice";
import { Steps } from "../../components/Steps/Steps";
import ConfirmPayment from "./components/Modal/confirmPayment";
import {
  selectClientAction,
  setToInitialCLient
} from "../Components/ClientSelection/ClientSelectionSlice";
import { setToInitialAccount } from "../Components/AccountSelection/AccountSelectionSlice";
import {
  setToInitialBeneficiary,
  settlementType
} from "../Components/Beneficiary/BeneficiarySlice";
import { setToInitialFormState } from "../Components/DepositAmount/DepositAmountSlice";
import {
  selectPayerAction,
  updatePaginationProperty,
  updateSearchedData,
  updateSearchQuery
} from "./components/PayerSelection/payerSelectionSlice";
import { ProductGroup } from "../../products/Products";
import { useGetCurrenciesQuery } from "../../services/currencies";
import { useGetCountriesQuery } from "../../services/bmsService";
import { setToInitial } from "./components/PaymentBeneficiary/moveBetweenAccountSlice";

const NewPayment = (props: any) => {
  const dispatch = useAppDispatch();

  const { step } = useAppSelector(selectPayment);

  const selectedSettlementType = useAppSelector(settlementType);

  useEffect(() => {
    dispatch(updateMenuShow(false));
    dispatch(updateTopBarShow(true));
  }, [dispatch]);

  useEffect(() => {
    dispatch(setToInitialCLient());
    dispatch(setToInitialAccount());
    dispatch(setToInitialBeneficiary());
    dispatch(setToInitialFormState());
    dispatch(setToInitialStep());
    dispatch(setToInitial());
    dispatch(
      updatePaginationProperty({
        current: 1,
        pageSize: 10
      })
    );
    dispatch(updateSearchQuery(""));
    dispatch(updateSearchedData([]));
    dispatch(selectClientAction(""));
    dispatch(selectPayerAction(""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const PayerSelection = lazy(
    () => import("./components/PayerSelection/PayerSelection")
  );

  const AccountSelection = lazy(
    () => import("../Components/AccountSelection/AccountSelection")
  );

  const Beneficiary = lazy(
    () => import("./components/PaymentBeneficiary/Beneficiary")
  );

  const DepositAmount = lazy(() => import("./components/Amount/amount"));

  const onNextStepActionHandler = () => {
    dispatch(nextStepAction());
  };

  const onPreviousStepActionHandler = () => {
    dispatch(previousStepAction());
  };

  useGetCurrenciesQuery({});
  useGetCountriesQuery({});

  const steps = useMemo(() => {
    return [
      {
        key: 0,
        title: "Payer Selection",
        content: (
          <PayerSelection
            nextStepHandler={onNextStepActionHandler}
          />
        )
      },
      {
        key: 1,
        title: "Account",
        content: (
          <AccountSelection
            nextStepHandler={onNextStepActionHandler}
            previousStepHandler={onPreviousStepActionHandler}
            hideUnavailableBalance
            filterByProductGroup={ProductGroup.GlobalPayments}
          />
        )
      },
      {
        key: 2,
        title: `Move Funds ${
          selectedSettlementType === "internal"
            ? "Between Accounts"
            : "to Beneficiary"
        }`,
        content: (
          <Beneficiary
            nextStepHandler={onNextStepActionHandler}
            previousStepHandler={onPreviousStepActionHandler}
          />
        )
      },
      {
        key: 3,
        title: "Amount",
        content: (
          <DepositAmount
            nextStepHandler={onNextStepActionHandler}
            previousStepHandler={onPreviousStepActionHandler}
            confirmBtnLabel={"Confirm Payment"}
            ConfirmModal={ConfirmPayment}
          />
        )
      }
    ];
  }, [
    PayerSelection,
    AccountSelection,
    Beneficiary,
    DepositAmount,
    onNextStepActionHandler,
    onPreviousStepActionHandler
  ]);

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

export { NewPayment as default };
