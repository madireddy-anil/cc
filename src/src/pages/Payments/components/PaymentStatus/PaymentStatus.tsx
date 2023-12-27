import React from "react";
import {
  TradeStatus as DSPaymentStatus,
  Button
} from "@payconstruct/design-system";
import PageWrapper from "../../../../components/Wrapper/PageWrapper";
import { Spacer } from "../../../../components/Spacer/Spacer";
import { useNavigate, useLocation } from "react-router-dom";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const PaymentStatus: React.FC = () => {
  let navigate = useNavigate();
  let query = useQuery();

  const orderReference = query.get("orderReference");

  const status = "approved";

  return (
    <PageWrapper>
      <Spacer size={50} />
      <DSPaymentStatus
        type={status}
        heading="Payment Submitted Successfully!"
        message={`Your payment with reference ${orderReference} has been successfully submitted.`}
        actions={[
          <Button
            key="backToHome"
            label="Back to home"
            onClick={() => {
              navigate("/accounts");
            }}
            style={{ height: "40px", width: "140px" }}
            type="primary"
          />,
          <Button
            key="newPayment"
            label="Make New Payment"
            onClick={() => {
              navigate("/new-payment");
            }}
            style={{ height: "40px", width: "140px" }}
            type="secondary"
          />
        ]}
      />
    </PageWrapper>
  );
};

export { PaymentStatus as default };
