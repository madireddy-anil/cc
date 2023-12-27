import React from "react";
import { Text, Colors } from "@payconstruct/design-system";

import { TableWrapper } from "../../../../../../components/Wrapper/TableWrapper";
import { Spacer } from "../../../../../../components/Spacer/Spacer";

import Styles from "./basicCompanyInfo.module.css";

interface BasicCompanyInfoProps {
  contentData: any[];
}

type TContentData = {
  label: string;
  value: any;
  hasDivider: boolean;
};

const BasicCompanyInfoCard: React.FC<BasicCompanyInfoProps> = ({
  contentData
}) => {
  return (
    <TableWrapper>
      <div className={Styles["company__info__wrapper"]}>
        {contentData.map((d: TContentData, i: number) => {
          return (
            <div key={i} className={Styles["company__info__body"]}>
              <BasicCompanyInfoBlock
                label={d.label}
                value={d.value}
                hasDivider={d.hasDivider}
              />
            </div>
          );
        })}
      </div>
    </TableWrapper>
  );
};

interface BasicCompanyInfoBlockProps {
  label: string;
  value: any;
  hasDivider?: boolean;
}

const BasicCompanyInfoBlock: React.FC<BasicCompanyInfoBlockProps> = ({
  label,
  value,
  hasDivider
}) => {
  return (
    <div
      className={Styles["company__info__body"]}
      style={{
        ...(hasDivider && {
          marginRight: 50,
          borderRight: `1px solid ${Colors.grey.outline}`
        })
      }}
    >
      <Text size="xsmall" color={Colors.grey.neutral500} label={label} />
      <Spacer size={15} />
      <Text size="small" color={Colors.grey.neutral700} label={value} />
    </div>
  );
};

export { BasicCompanyInfoCard };
