import React, { FC } from "react";
import { Accordions, Text, Colors } from "@payconstruct/design-system";
import css from "./AccordionAddress.module.css";

type TAddress = {
  buildingNumber: string;
  country: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
};

interface PropTypes {
  address: TAddress;
}

export const AccordionAddress: FC<PropTypes> = ({ address }) => {
  const { buildingNumber, country, street, city, state, postalCode } = address;

  const noData = "---";

  return (
    <Accordions
      header="Address Details"
      text={
        <div className={css["accordion-address-details"]}>
          <span>
            <Text label="Building" color={Colors.grey.neutral500} />
            <Text label={buildingNumber ?? noData} />
          </span>
          <span>
            <Text label="Country" color={Colors.grey.neutral500} />
            <Text label={country ?? noData} />
          </span>
          <span>
            <Text label="Street" color={Colors.grey.neutral500} />
            <Text label={street ?? noData} />
          </span>
          <span>
            <Text label="City" color={Colors.grey.neutral500} />
            <Text label={city ?? noData} />
          </span>
          <span>
            <Text label="State" color={Colors.grey.neutral500} />
            <Text label={state ?? noData} />
          </span>
          <span>
            <Text label="Zip Code" color={Colors.grey.neutral500} />
            <Text label={postalCode ?? noData} />
          </span>
        </div>
      }
    />
  );
};
