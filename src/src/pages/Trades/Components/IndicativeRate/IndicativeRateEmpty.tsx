import React from "react";
import {
  IndicativeRate,
  IndicativeRateRates
} from "../../../../services/routesService";
import IndicativeRateItem from "./IndicativeRateItem";

interface PropTypes {
  selectedEntityId: string;
  gridColumn: number;
}

const IndicativeRateEmptyComponent: React.FC<PropTypes> = ({
  selectedEntityId,
  gridColumn
}) => {
  return (
    <>
      {selectedEntityId ? (
        <div className="indicative-spinner-container">No Indicative Rate</div>
      ) : (
        Array.from(Array(gridColumn).keys()).map(
          (item: number, index: number) => {
            const rate = {
              currency: "",
              clientId: null,
              rates: [
                {
                  quoteCurrency: "USDC",
                  expiresAt: null,
                  inverseRate: null,
                  rate: null,
                  updatedAt: null
                },
                {
                  quoteCurrency: "USDC",
                  expiresAt: null,
                  inverseRate: null,
                  rate: null,
                  updatedAt: null
                }
              ] as unknown as IndicativeRateRates[]
            } as unknown as IndicativeRate;

            return (
              <IndicativeRateItem
                key={`${index}`}
                rate={rate}
                selectedEntityId={selectedEntityId}
              />
            );
          }
        )
      )}
    </>
  );
};

export default IndicativeRateEmptyComponent;
