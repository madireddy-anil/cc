import { FC } from "react";
import {
  Row,
  Col,
  Accordions,
  Status,
  Text,
  Colors
} from "@payconstruct/design-system";
import { EFXOrder } from "@payconstruct/pp-types";
import { Account } from "../../../../services/accountService";
import { Card } from "../../Components/Card/Card";
import { Spacer } from "../../../../components";
import { fractionFormat } from "../../../../utilities/transformers";
import css from "./PaymentDetails.module.css";

type TPaymentData = {
  label: string;
  value: any;
};

interface PropTypes {
  trade: EFXOrder;
  account?: Account;
}

const PaymentDetails: FC<PropTypes> = ({ trade, account }) => {
  const balance = account?.balance?.balance;
  const paymentData = [
    { label: "Current Balance", value: balance ?? "N/A" },
    { label: "Currency", value: trade.buyCurrency },
    { label: "Amount", value: fractionFormat(trade.buyAmount) },
    {
      label: "Balance After Transfer",
      value: balance ? Number(balance) - trade.buyAmount : "N/A"
    }
  ];
  return (
    <>
      <Spacer size={15} />
      <Row gutter={15}>
        <Col span={24}>
          <Accordions
            header="Payment Details"
            headerRight={<Status type="approved" />}
            text={
              <Card>
                <div className={css["payment-details"]}>
                  {paymentData.map((d: TPaymentData, i: number) => (
                    <div key={i}>
                      <Text label={d.label} color={Colors.grey.neutral500} />
                      <Text label={d.value} color={Colors.grey.neutral700} />
                    </div>
                  ))}
                </div>
              </Card>
            }
          />
        </Col>
      </Row>
    </>
  );
};

export { PaymentDetails };
