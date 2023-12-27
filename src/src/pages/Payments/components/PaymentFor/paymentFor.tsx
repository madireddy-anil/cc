import React from "react";
import {
  Button,
  RadioCurrency,
  RadioGroup,
  Tag,
  Icon
} from "@payconstruct/design-system";
import { RadioChangeEvent } from "antd";
import {
  Header,
  HeaderContent
} from "../../../../components/PageHeader/Header";
import { Spacer } from "../../../../components/Spacer/Spacer";
import {
  paymentForProps,
  selectPaymentForAction,
  selectedPayFor as selectedPayForSelection
} from "./paymentForSlice";
import { useAppDispatch, useAppSelector } from "../../../../redux/hooks/store";

import style from "./payermentFor.module.css";

export const paymentForOptions: paymentForProps[] = [
  {
    id: "client",
    name: "Client",
    tag: "Client",
    icon: "user"
  },
  {
    id: "pl",
    name: "PL",
    tag: "Company - PL",
    icon: "business"
  },
  {
    id: "suspense",
    name: "Suspense",
    tag: "Company - Suspense",
    icon: "business"
  }
];

interface PaymentForSelectionProps {
  nextStepHandler?: () => void;
}

const PaymentFor: React.FC<PaymentForSelectionProps> = ({
  nextStepHandler
}) => {
  const dispatch = useAppDispatch();
  const selectedPaymentFor = useAppSelector(selectedPayForSelection);

  const handleRadioGrpChange = (evt: RadioChangeEvent) => {
    const paymentFor = paymentForOptions.find(
      (optionItem: paymentForProps) => optionItem.id === evt.target.value
    );

    dispatch(selectPaymentForAction(paymentFor));
  };

  return (
    <section>
      <Header>
        <HeaderContent.Title subtitle="Select an option for Initiate a payment">
          Payment Initiation For
        </HeaderContent.Title>
      </Header>
      <div className={style["payment-for"]}>
        <RadioGroup
          direction="horizontal"
          value={selectedPaymentFor?.id} // Selected Client
          onChange={handleRadioGrpChange}
        >
          {paymentForOptions?.map(
            (optionItem: paymentForProps, index: number) => {
              const { id, name, tag, icon } = optionItem;

              return (
                <RadioCurrency
                  key={`paymentFor_${id}`}
                  title={name}
                  description={
                    <div className={style["payment-for--radioDesp"]}>
                      {/* <div>
                      {genericInformation?.tradingName ?? "trading Name"}
                    </div> */}
                      <div className={style["payment-for--radioText"]}>
                        <Tag
                          isPrefix
                          label={tag}
                          prefix={<Icon name={icon} size="extraSmall" />}
                        />
                      </div>
                    </div>
                  }
                  showTooltip
                  checked={id === selectedPaymentFor?.id}
                  defaultChecked={id === selectedPaymentFor?.id}
                  value={id}
                />
              );
            }
          )}
        </RadioGroup>
        <Spacer size={40} />
        <Button
          disabled={!Boolean(selectedPaymentFor?.id)}
          onClick={() => {
            nextStepHandler && nextStepHandler();
          }}
          type="primary"
          label="Continue"
          icon={{
            name: "rightArrow",
            position: "right"
          }}
        />
      </div>
    </section>
  );
};
export default PaymentFor;
