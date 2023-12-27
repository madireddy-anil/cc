import React, { useState } from "react";
import {
  Modal,
  Spin,
  Icon,
  Text,
  Colors,
  Row,
  Col,
  Tag,
  Button
} from "@payconstruct/design-system";
import { useAppSelector } from "../../../../../../redux/hooks/store";
import { TableWrapper } from "../../../../../../components";
import { Spacer } from "../../../../../../components/Spacer/Spacer";
import {
  validationOnData,
  camelize
} from "../../../../../../config/transformer";
import Styles from "./regulatoryinfo.module.css";

const RegulatoryInfoModalBody: React.FC<any> = () => {
  const [regulatoryInfoTitle] = useState("General Questions");
  const [flowOfFunds] = useState("The flow of funds");
  const [reasonForUsingOurServicesLabel] = useState(
    "Reason For Using Our Services"
  );
  const [noData] = useState<String>("--");
  const [visibleTextFlowOfFunds, setVisibleTextFlowOfFunds] =
    useState<boolean>(true);
  const [
    visibleTextReasonOfUsingOurService,
    setVisibleTextReasonOfUsingOurService
  ] = useState<boolean>(true);

  // Getting the Store Data
  const { isClientSummaryInfoFetched, regulatoryDetails } = useAppSelector(
    (state) => state.clientManagement
  );

  const getRegulatoryQusDetails = () => {
    const {
      licenses,
      isOperatingInRiskCountries,
      majorityClientBase,
      majorityClientJurisdiction,
      transactionMonitor,
      subjectToRegulatoryEnforcement
    } = regulatoryDetails;

    const validateFields =
      isOperatingInRiskCountries === undefined &&
      transactionMonitor === undefined &&
      subjectToRegulatoryEnforcement === undefined;

    if (licenses === undefined && licenses === null && licenses.length === 0) {
      return <>No Data</>;
    }

    if (
      licenses === undefined &&
      licenses === null &&
      licenses[0]?.licenseType === "no_licence"
    ) {
      return <>No License</>;
    }

    const getLabels = (list: any[]) => {
      return list.map((item: any, index: number) => {
        return <Tag key={index} isPrefix label={camelize(item)} />;
      });
    };

    return (
      <div className={Styles["regulatoryInfo__Wrapper"]}>
        <Row>
          <Col span={12}>
            <Text label={"Is Operating In Risk Countries"} size="small" />
          </Col>
          <Col span={12}>
            <div className={Styles["info__rightSide"]}>
              {isOperatingInRiskCountries ? (
                <Icon color="blue" name="checkCircle" />
              ) : validateFields ? (
                noData
              ) : (
                <Icon color="#da6464" name="closeCircle" />
              )}
            </div>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Text label={"Transaction Monitor"} size="small" />
          </Col>
          <Col span={12}>
            <div className={Styles["info__rightSide"]}>
              {transactionMonitor ? (
                <Icon name="checkCircle" />
              ) : validateFields ? (
                noData
              ) : (
                <Icon name="closeCircle" />
              )}
            </div>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Text label={"Regulatory Enforcement"} size="small" />
          </Col>
          <Col span={12}>
            <div className={Styles["info__rightSide"]}>
              {subjectToRegulatoryEnforcement ? (
                <Icon name="checkCircle" />
              ) : validateFields ? (
                noData
              ) : (
                <Icon name="closeCircle" />
              )}
            </div>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Text label={"Majority Client Base"} size="small" />
          </Col>
          <Col span={12}>
            <div className={Styles["info__rightSide"]}>
              {majorityClientBase?.length
                ? getLabels(majorityClientBase)
                : "--"}
            </div>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Text label={"Majority Client Jurisdiction"} size="small" />
          </Col>
          <Col span={12}>
            <div className={Styles["info__rightSide"]}>
              {majorityClientJurisdiction?.length
                ? getLabels(majorityClientJurisdiction)
                : "--"}
            </div>
          </Col>
        </Row>
      </div>
    );
  };

  const handleWrapText = () => {
    setVisibleTextFlowOfFunds(visibleTextFlowOfFunds ? false : true);
  };

  const getRegulatoryFlowOfFunds = () => {
    return (
      <div>
        <Row>
          <Col lg={{ span: 24 }}>
            <Text
              size="small"
              color={Colors.grey.neutral400}
              label={"Additional flow of funds information"}
            />
          </Col>
        </Row>
        <Row>
          {validationOnData(regulatoryDetails?.flowOfFundsComment, "string") ? (
            <div className={Styles["additionalFlowOfFunds"]}>
              <div
                className={
                  visibleTextFlowOfFunds ? Styles["text_wrap_text_less"] : ""
                }
              >
                <Text
                  size="small"
                  weight="bold"
                  color={Colors.grey.neutral700}
                  label={regulatoryDetails?.flowOfFundsComment}
                />
              </div>
              <Button
                type="link"
                size="medium"
                label={visibleTextFlowOfFunds ? "See more" : "See less"}
                onClick={() => handleWrapText()}
              />
            </div>
          ) : (
            <Text
              size="small"
              weight="bold"
              color={Colors.grey.neutral700}
              label={"No content available"}
            />
          )}
        </Row>
      </div>
    );
  };

  const handleWrapTextOurService = () => {
    setVisibleTextReasonOfUsingOurService(
      visibleTextReasonOfUsingOurService ? false : true
    );
  };

  const getRegulatoryReasonForUsingOurService = () => {
    return (
      <div>
        <Row>
          {validationOnData(
            regulatoryDetails?.reasonForUsingOurServices,
            "string"
          ) ? (
            <div className={Styles["additionalFlowOfFunds"]}>
              <div
                className={
                  visibleTextReasonOfUsingOurService
                    ? Styles["text_wrap_text_less"]
                    : ""
                }
              >
                <Text
                  size="small"
                  weight="bold"
                  color={Colors.grey.neutral700}
                  label={regulatoryDetails?.reasonForUsingOurServices}
                />
              </div>
              <Button
                type="link"
                size="medium"
                label={
                  visibleTextReasonOfUsingOurService ? "See more" : "See less"
                }
                onClick={() => handleWrapTextOurService()}
              />
            </div>
          ) : (
            <Text
              size="small"
              weight="bold"
              color={Colors.grey.neutral700}
              label={"No content available"}
            />
          )}
        </Row>
      </div>
    );
  };

  return (
    <>
      <Spin label="loading wait..." loading={isClientSummaryInfoFetched}>
        <TableWrapper>
          <Text
            size="small"
            weight="bold"
            color={Colors.grey.neutral700}
            label={regulatoryInfoTitle}
          />
          <Spacer size={10} />
          {getRegulatoryQusDetails()}
        </TableWrapper>
        <Spacer size={10} />
        <TableWrapper>
          <Text
            size="small"
            weight="bold"
            color={Colors.grey.neutral700}
            label={flowOfFunds}
          />
          <Spacer size={10} />
          {getRegulatoryFlowOfFunds()}
        </TableWrapper>
        <Spacer size={10} />
        <TableWrapper>
          <Text
            size="small"
            weight="bold"
            color={Colors.grey.neutral700}
            label={reasonForUsingOurServicesLabel}
          />
          <Spacer size={10} />
          {getRegulatoryReasonForUsingOurService()}
        </TableWrapper>
      </Spin>
    </>
  );
};

interface RegulatoryInfoModalProps {
  show: boolean;
  title: any;
  onCancelText: string;
  onClickCancel: () => void;
}

const RegulatoryInfoModal: React.FC<RegulatoryInfoModalProps> = ({
  show,
  title,
  onCancelText,
  onClickCancel
}) => {
  return (
    <Modal
      modalView={show}
      modalWidth={930}
      title={title}
      onCancelText={onCancelText}
      onClickCancel={() => {
        onClickCancel();
      }}
      description={<RegulatoryInfoModalBody />}
    />
  );
};

export { RegulatoryInfoModal };
