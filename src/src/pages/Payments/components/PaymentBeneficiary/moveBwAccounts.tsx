import { Colors } from "@payconstruct/design-system";
import { lazy, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../../../redux/hooks/store";
import {
  nextStepAction,
  previousStepAction,
  nextBeneStepAction,
  previousBeneStepAction,
  selectPayment
} from "../../PaymentSlice";
import { Steps } from "../../../../components/Steps/Steps";

const MoveBetweenAccounts = (props: any) => {
  const dispatch = useAppDispatch();

  const BeneSearch = lazy(() => import("./BeneSearch/BeneSearch"));
  const BeneSelection = lazy(() => import("./BeneSelection/BeneSelection"));

  const { beneStep } = useAppSelector(selectPayment);

  const onNextStepActionHandler = () => {
    dispatch(nextStepAction());
  };

  const onPreviousStepActionHandler = () => {
    dispatch(previousStepAction());
  };

  const onNextBeneStepActionHandler = () => {
    dispatch(nextBeneStepAction());
  };

  const onPreviousBeneStepActionHandler = () => {
    dispatch(previousBeneStepAction());
  };

  const steps = useMemo(() => {
    return [
      {
        key: 0,
        title: "Beneficary Search",
        content: (
          <BeneSearch
            previousStepHandler={onPreviousStepActionHandler}
            nextStepHandler={onNextBeneStepActionHandler}
          />
        )
      },
      {
        key: 1,
        title: "Account Selection",
        content: (
          <BeneSelection
            previousStepHandler={onPreviousBeneStepActionHandler}
            nextStepHandler={onNextStepActionHandler}
          />
        )
      }
    ];
  }, [
    BeneSearch,
    BeneSelection,
    onPreviousStepActionHandler,
    onNextBeneStepActionHandler,
    onPreviousBeneStepActionHandler,
    onNextStepActionHandler
  ]);

  return (
    <main
      style={{
        margin: 0,
        height: "calc(100vh - 56px)",
        overflowY: "auto",
        background: Colors.grey.neutral50
      }}
    >
      <Steps steps={steps} currentStep={beneStep} />
    </main>
  );
};

export { MoveBetweenAccounts as default };
