import { FC } from "react";
import { Text, Colors } from "@payconstruct/design-system";

interface PropTypes {
  data: string;
}

export const DateTime: FC<PropTypes> = ({ data }) => {
  return <Text label={data} size="small" color={Colors.grey.neutral500} />;
};
