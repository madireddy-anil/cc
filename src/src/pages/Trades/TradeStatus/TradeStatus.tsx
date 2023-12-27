import React from "react";
import {
  TradeStatus as DSTradeStatus,
  Button
} from "@payconstruct/design-system";
import PageWrapper from "../../../components/Wrapper/PageWrapper";
import { Spacer } from "../../../components/Spacer/Spacer";
import { useNavigate, useLocation, Link } from "react-router-dom";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const TradeStatus: React.FC = () => {
  let navigate = useNavigate();
  let query = useQuery();

  const orderReference = query.get("orderReference");
  const id = query.get("id");

  const status = "approved";

  return (
    <PageWrapper>
      <Spacer size={50} />
      <DSTradeStatus
        type={status}
        heading="Exotic FX Order Submitted Successfully!"
        message={`Your order with reference ${orderReference} has been successfully submitted.`}
        link={<Link to={`/order/${id}`}>View order confirmation</Link>}
        actions={[
          <Button
            label="Back to home"
            onClick={() => {
              navigate("/orders");
            }}
            style={{ height: "40px", width: "140px" }}
            type="primary"
          />,
          <Button
            label="Create new order"
            onClick={() => {
              navigate("/order/deposit");
            }}
            style={{ height: "40px", width: "140px" }}
            type="secondary"
          />
        ]}
      />
    </PageWrapper>
  );
};

export { TradeStatus as default };
