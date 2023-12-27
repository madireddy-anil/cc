import React from "react";
import {
  Header,
  HeaderContent
} from "../../../../components/PageHeader/Header";
import Search from "./search/search";

interface PayerSelectionProps {
  nextStepHandler?: () => void;
}

/**
 *
 *  @component PayerSelection
 *
 *  @props PayerSelectionProps
 *
 *  In New Payment, Payer Selection to select client or company.
 *
 */

const PayerSelection: React.FC<PayerSelectionProps> = ({ nextStepHandler }) => {
  return (
    <section>
      <Header>
        <HeaderContent.Title subtitle="Select a payer to start">
          Payer Selection
        </HeaderContent.Title>
      </Header>
      <Search nextStepHandler={nextStepHandler} />
    </section>
  );
};

export default PayerSelection;
