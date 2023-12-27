import React from "react";
import { Empty } from "antd";
import { Header, HeaderContent } from "../../../../../../components";
import {
  Text,
  Colors,
  Button,
  Icon,
  Tooltip
} from "@payconstruct/design-system";
import Styles from "./drawer.module.css";
import { Spacer } from "../../../../../../components";

interface TradeCardProps {
  title?: string;
  subTitle?: string;
  createBtnTitle?: string;
  contentData: any;
  // entityInfo?: boolean;
  onClickAddBtn?: (data?: any) => void;
  onClickUnlink?: (data?: any, i?: any) => void;
  onClickUpdateUserRole?: (data: UserData) => void;
}

export interface UserData {
  id: string;
  data: any[];
}

const TradeInfo: React.FC<TradeCardProps> = ({
  title,
  subTitle,
  createBtnTitle,
  contentData,
  // entityInfo,
  onClickAddBtn,
  onClickUnlink,
  onClickUpdateUserRole
}) => {
  return (
    <div className={Styles["tradeCardWrapper"]}>
      <Header>
        {title && subTitle && (
          <HeaderContent.LeftSide>
            <HeaderContent.Title subtitle={subTitle}>
              {title}
            </HeaderContent.Title>
          </HeaderContent.LeftSide>
        )}
        {onClickAddBtn && (
          <HeaderContent.RightSide>
            <div className={Styles["Add__icon"]}>
              <Button
                type="link"
                label={createBtnTitle}
                onClick={() => onClickAddBtn(createBtnTitle)}
                loading={false}
                size="medium"
                disabled={false}
                icon={{
                  name: "plus",
                  position: "left"
                }}
              />
            </div>
          </HeaderContent.RightSide>
        )}
      </Header>
      <div className={Styles["tradeCard__info__body__wrapper"]}>
        {contentData.length > 0 &&
        contentData !== undefined &&
        contentData !== null ? (
          <>
            <div
              className={
                contentData.length >= 3
                  ? Styles["tradeCard__info__body__scroll"]
                  : Styles["tradeCard__info__body"]
              }
            >
              {(contentData || []).map((d: UserData, i: number) => {
                return (
                  <div key={i}>
                    {d !== undefined && d !== null && (
                      <div className={Styles["tradeCard__info__body__inner"]}>
                        {(d?.data || []).map((user: any, index: number) => {
                          return (
                            <div key={index}>
                              <TradeCardDrawerBody
                                label={
                                  user?.label === "Role" ? (
                                    <div style={{ display: "flex" }}>
                                      <span style={{ margin: "4px 2px 0 0" }}>
                                        {user?.label}
                                      </span>
                                      <Tooltip text={"Edit user role"}>
                                        <Icon
                                          name="edit"
                                          onClick={() =>
                                            onClickUpdateUserRole &&
                                            onClickUpdateUserRole(d)
                                          }
                                        />
                                      </Tooltip>
                                    </div>
                                  ) : (
                                    user?.label
                                  )
                                }
                                value={user?.value}
                              />
                            </div>
                          );
                        })}
                        {onClickUnlink && (
                          <div className={Styles["moreInfo__Icon"]}>
                            <Button
                              type="link"
                              onClick={() => onClickUnlink(d, title)}
                              loading={false}
                              size="large"
                              disabled={false}
                              icon={{
                                name: "more",
                                position: "left"
                              }}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className={Styles["tradeCard__info__body__wrapper"]}>
            <div className={Styles["empty__Card"]}>
              <Empty description={<span>No Data Found</span>} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface TradeCardBodyProps {
  label: string;
  value: React.ReactNode;
}

const TradeCardDrawerBody: React.FC<TradeCardBodyProps> = ({
  label,
  value
}) => {
  return (
    <div className={Styles["body__wrapper"]}>
      <Text size="xsmall" color={Colors.grey.neutral500}>
        {label}
      </Text>
      <Spacer size={3} />
      <Text size="small" color={Colors.grey.neutral700}>
        {value ?? ""}
      </Text>
    </div>
  );
};

export { TradeInfo };
