import { Colors, Text } from "@payconstruct/design-system";
import { useIntl } from "react-intl";
interface VendorHeaderProps {
  name: string;
  currency: string;
  sellAmount: string;
  subAmount: string;
}
// TODO: check subAmount value
const VendorHeader: React.FC<VendorHeaderProps> = ({
  currency,
  name,
  sellAmount,
  subAmount
}) => {
  const intl = useIntl();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between"
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column"
        }}
      >
        <Text label="Vendor" color={Colors.grey.neutral500} />
        <Text label={name} color={Colors.grey.neutral900} />
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between"
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginRight: "30px"
          }}
        >
          <Text label="Vendor Subtotal" color={Colors.grey.neutral500} />
          <Text
            label={intl.formatNumber(Number(subAmount), {
              style: "currency",
              currency: currency
            })}
            color={Colors.grey.neutral900}
          />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column"
          }}
        >
          <Text label="Leg Total" color={Colors.grey.neutral500} />
          <Text
            label={intl.formatNumber(Number(sellAmount), {
              style: "currency",
              currency: currency
            })}
            color={Colors.grey.neutral900}
          />
        </div>
      </div>
    </div>
  );
};

export { VendorHeader };
