import { Colors, Text } from "@payconstruct/design-system";
import { Rate } from "@payconstruct/pp-types";
// import { formatPair } from "../../helpers/vendorRatesHelpers";
import style from "../../VendorRates.module.css";

const vendorRateHeader = (vendor: Rate) => (
  <div className={style["vendor-rates__accordion-header"]}>
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Text
        label={vendor.vendorName ?? "N/A"}
        size="medium"
        color={Colors.grey.neutral700}
      />
      <Text label={vendor.pair} size="xsmall" color={Colors.grey.neutral400} />
    </div>
  </div>
);

export { vendorRateHeader };
