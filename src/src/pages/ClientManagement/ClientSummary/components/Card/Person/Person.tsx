import React, { useEffect, useState } from "react";
import { Row, Col, Empty } from "antd";
import {
  Text,
  Colors,
  Tag,
  Icon,
  Button,
  Notification
} from "@payconstruct/design-system";

import { TableWrapper } from "../../../../../../components/Wrapper/TableWrapper";
import { Spacer } from "../../../../../../components/Spacer/Spacer";
import { validationOnData } from "../../../../../../config/transformer";
import { formatTimeAndDate, getFormattedAddress } from "../../../../../../utilities/transformers";

import Styles from "./person.module.css";
import { useInvitePeopleMutation } from "../../../../../../services/peopleService";
import { VerifyModal } from "../../Modal/People/VerifyModal";

interface PersonInfoBlockProps {
  contentData: any[];
  showPeopleAddress?: boolean;
  acceptTermsOfServiceLabel?: any;
  timezone?: any;
  emptyData?: string;
}

const PersonCard: React.FC<PersonInfoBlockProps> = ({
  contentData,
  showPeopleAddress,
  acceptTermsOfServiceLabel,
  timezone,
  emptyData
}) => {
  const [invitePeople, { isSuccess: isInviteLinkSentSuccess, isLoading }] =
    useInvitePeopleMutation();
  const [showModal, setShowModal] = useState<boolean>(false);

  const onInviteBtnClick = (id: string) => {
    const record = contentData.find((item: any) => {
      return item.id === id;
    });
    invitePeople({
      data: {
        email: record.email,
        firstName: record.firstName,
        lastName: record.lastName
      }
    });
  };

  useEffect(() => {
    if (isInviteLinkSentSuccess) {
      Notification({
        type: "success",
        message: "Email sent success!"
      });
    }
    setShowModal(false);
  }, [isInviteLinkSentSuccess]);

  /// Filtering the Version Details
  const headerInfo = (item: any) => (
    <div className={Styles["person__info__header"]}>
      <div style={{ display: "flex", marginBottom: "8px" }}>
        <div className={Styles["title"]}>
          <Text
            size="large"
            color={Colors.grey.neutral700}
            label={`${item?.versionId}`}
          />
        </div>
        <div className={Styles["terms__status"]}>
          <div className={Styles["success"]}>
            <Tag
              key={"1"}
              isPrefix
              label={"Status: Accepted"}
              prefix={<Icon name="checkCircle" />}
            />
          </div>
        </div>
      </div>
      <Text size="small" color={Colors.grey.neutral500} label={`Version ID`} />
    </div>
  );

  const footerInfo = (item: any) => {
    const dateTime =
      item?.createdAt && formatTimeAndDate(item?.createdAt, timezone);
    return (
      <div className={Styles["person__info__footer"]}>
        Date/Time: {dateTime}
      </div>
    );
  };
  return (
    <>
      {contentData.length > 0 ? (
        (contentData || []).map((item: any, i: number) => {
          const formatAddress = getFormattedAddress(
            validationOnData(item?.registeredAddress, "object")
          );
          const memberRoles = (item.role || [])
            .map((role: any) => {
              return role;
            })
            .join(", ");
          return (
            <div className={Styles["person__info__wrapper"]} key={i}>
              {item.versionId && headerInfo(item)}
              <div className={Styles["person__info__body"]}>
                <TableWrapper>
                  <Row gutter={15}>
                    <Col className="gutter-row" span={24}>
                      <div className={Styles["title__info"]}>
                        {item?.firstName && item?.lastName && (
                          <div className={Styles["title"]}>
                            <Text
                              size="xlarge"
                              color={Colors.grey.neutral700}
                              label={`${
                                item?.firstName + " " + item?.lastName
                              }`}
                            />
                          </div>
                        )}
                        {item?.percentageOfShares && (
                          <div className={Styles["share__percentage"]}>
                            <Text
                              size="xsmall"
                              color={Colors.grey.neutral700}
                              label={item?.percentageOfShares + "%"}
                            />
                          </div>
                        )}
                      </div>
                    </Col>
                  </Row>
                  <Spacer size={8} />
                  <Row gutter={15}>
                    <Col className="gutter-row" span={12}>
                      <div className={Styles["email__info"]}>
                        {item?.email && memberRoles && (
                          <div className={Styles["email"]}>
                            <Text
                              size="medium"
                              color={Colors.grey.neutral500}
                              label={`${memberRoles} / ${item?.email}`}
                            />
                          </div>
                        )}
                      </div>
                    </Col>
                    <Col className="gutter-row" span={12}>
                      <div
                        style={{ float: "right" }}
                        className={
                          Styles[
                            !item.isIdvScreeningRequired
                              ? "not_required_status"
                              : "required_status"
                          ]
                        }
                      >
                        <Tag
                          label={
                            item.isIdvScreeningRequired
                              ? "Required For verification"
                              : "Not required for verification"
                          }
                        />
                      </div>
                      <div className={Styles["idv__status"]}>
                        {item.isIdvScreeningDone ? (
                          <div className={Styles["success"]}>
                            <Tag
                              key={"1"}
                              isPrefix
                              label={"IDV details provided"}
                              prefix={<Icon name="checkCircle" />}
                            />
                          </div>
                        ) : (
                          <div className={Styles["reject"]}>
                            <Tag
                              key={"1"}
                              isPrefix
                              label={"IDV details provided"}
                              prefix={<Icon name="closeCircle" />}
                            />
                          </div>
                        )}
                      </div>
                    </Col>
                  </Row>
                  {formatAddress && showPeopleAddress && (
                    <Row gutter={15}>
                      <Col className="gutter-row" span={24}>
                        <div style={{ marginTop: "25px" }}>
                          <div className={Styles["address__title"]}>
                            <Text
                              size="xsmall"
                              color={Colors.grey.neutral500}
                              label={"Address"}
                            />
                          </div>
                          <Spacer size={8} />
                          <div className={Styles["address__body"]}>
                            <Text
                              size="medium"
                              color={Colors.grey.neutral700}
                              label={formatAddress}
                            />
                          </div>
                        </div>
                      </Col>
                    </Row>
                  )}
                  <Row gutter={15}>
                    <Col className="gutter-row" span={24}>
                      <div>
                        {!item.isIdvScreeningDone && (
                          <div className={Styles["send-btn"]}>
                            {item.isIdvScreeningRequired ? (
                              <>
                                <Button
                                  type="primary"
                                  label="Re-send verification email"
                                  loading={isLoading}
                                  onClick={() => {
                                    onInviteBtnClick(item.id);
                                  }}
                                />
                              </>
                            ) : (
                              <>
                                <Button
                                  type="primary"
                                  label="Send verification email"
                                  onClick={() => {
                                    setShowModal(true);
                                  }}
                                />
                              </>
                            )}
                          </div>
                        )}
                        <div>
                          {item.isAuthorisedToAcceptTerms && (
                            <div className={Styles["idv__status"]}>
                              <Tag
                                key={"1"}
                                isPrefix
                                label={acceptTermsOfServiceLabel}
                                prefix={<Icon name="checkCircleOutline" />}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      <div></div>
                    </Col>
                    <VerifyModal
                      onClickOk={() => {
                        onInviteBtnClick(item.id);
                      }}
                      show={showModal}
                      title={"Are you sure?"}
                      onCancelText={"Close"}
                      onClickCancel={() => {
                        setShowModal(false);
                      }}
                      loading={isLoading}
                    />
                  </Row>
                </TableWrapper>
              </div>
              {item.createdAt && item?.versionId && footerInfo(item)}
            </div>
          );
        })
      ) : (
        <Empty description={<span>{emptyData}</span>} />
      )}
    </>
  );
};

export { PersonCard };
