import React from "react";
import { Button, Colors, Text, Image } from "@payconstruct/design-system";

import { Spacer } from "../../../../../../components/Spacer/Spacer";

import externalLink from "./../../../../../../../src/assets/images/externalLink.png";

import Styles from "./companyDetails.module.css";

interface CompanyDetailsCardProps {
  headingLabel: string;
  contentData: any;
  onClickEdit?: (data?: any, value?: any) => void;
}

type TContentData = {
  key: number;
  label: string;
  linkUrl?: any;
  value: any;
};

const CompanyDetailCard: React.FC<CompanyDetailsCardProps> = ({
  headingLabel,
  contentData,
  onClickEdit
}) => {
  return (
    <>
      {contentData !== undefined &&
        contentData !== null &&
        contentData.length > 0 && (
          <div className={Styles["client__info_card__container"]}>
            <div className={Styles["client__info__header"]}>
              <Text
                size="default"
                weight="bold"
                color={Colors.grey.neutral700}
                label={headingLabel}
              />
              {onClickEdit && (
                <Button
                  type="tertiary"
                  className={Styles["btn__moreInfo"]}
                  icon={{
                    name: "more"
                  }}
                  onClick={
                    headingLabel === "Brands & Product Usage"
                      ? () => onClickEdit(contentData, "brands")
                      : headingLabel === "Client Websites"
                      ? () => onClickEdit(contentData, "website")
                      : () => onClickEdit(contentData, "address")
                  }
                />
              )}
            </div>
            <div className={Styles["client__info__body"]}>
              {(contentData || []).map((item: TContentData, i: number) => {
                return (
                  <div
                    key={i}
                    className={
                      headingLabel === "Brands & Product Usage"
                        ? `${Styles["client__brand"]}`
                        : `${Styles["client__info__content"]}`
                    }
                  >
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Text
                        size="xsmall"
                        color={Colors.grey.neutral500}
                        label={item ? item?.label : ""}
                      />
                      {item && item.label && item.linkUrl && (
                        <span style={{ marginLeft: "10px" }}>
                          <a
                            href={item.linkUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Image
                              src={externalLink}
                              alt="moreInfo"
                              preview={false}
                            />
                          </a>
                        </span>
                      )}
                    </div>
                    <Spacer size={8} />
                    <Text
                      size="xsmall"
                      color={Colors.grey.neutral700}
                      label={item ? item.value : ""}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
    </>
  );
};

export { CompanyDetailCard };
