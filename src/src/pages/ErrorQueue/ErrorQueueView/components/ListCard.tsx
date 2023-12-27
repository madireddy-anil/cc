import { FC } from "react";
import { Text, Colors } from "@payconstruct/design-system";
import { TableWrapper } from "../../../../components";
import css from "./ListCard.module.css";

declare type DataType = {
  label: string;
  value: string;
  show?: boolean;
};

interface PropTypes {
  data: Array<DataType>;
}

export const ListCard: FC<PropTypes> = ({ data }) => {
  return (
    <TableWrapper>
      <div className={css["list-card"]}>
        {data.map(
          (d: DataType, i: number) =>
            d.show && (
              <div key={i} className={css["row"]}>
                <Text
                  label={d.label}
                  size="xsmall"
                  color={Colors.grey.neutral500}
                />
                <Text label={d.value} color={Colors.grey.neutral700} />
              </div>
            )
        )}
      </div>
    </TableWrapper>
  );
};
