import React, { useState } from "react";
import { Table, Spin, Button, Form } from "@payconstruct/design-system";

import { Header, HeaderContent, Spacer } from "../../../../../../components";

import { BasicCompanyInfoCard } from "../BasicCompanyInfo/BasicCompanyInfo";
import { DocumentsModal } from "../../Modal/Documents/Documents";
import { PeopleModal } from "../../Modal/People/People";
import { ApplicationApproval } from "../../Modal/ApplicationApproval/ApplicationApproval";
import { RegulatoryInfoModal } from "../../Modal/RegulatoryInfo/RegulatoryInfo";

import { useAppSelector } from "../../../../../../redux/hooks/store";

import { formatTimeAndDate } from "../../../../../../utilities/transformers";

import Styles from "./riskAndKyc.module.css";

interface RiskAndKycProps {
  title: string;
  rightSideHeaderData: any[];
  leftSideSubHeaderData: any[];
  contentData: any[];
  clientDetailFetching: boolean;
  clientDetailLoading: boolean;
  riskAndKycTableColumn: any;
  timezone?: any;
}

type rightSideHeaderData = {
  key: string;
  label: string;
};

const RiskAndKyc: React.FC<RiskAndKycProps> = ({
  title,
  rightSideHeaderData,
  leftSideSubHeaderData,
  contentData,
  clientDetailFetching,
  clientDetailLoading,
  riskAndKycTableColumn,
  timezone
}) => {
  const [form] = Form.useForm();
  // Setting the Initial State Values
  const [showDocumentsModal, setShowDocumentsInfoModal] =
    useState<boolean>(false);
  const [showPeopleModal, setShowPeopleModal] = useState<boolean>(false);
  const [showKycModal, setShowKycModal] = useState<boolean>(false);
  const [showRegulatoryInfoModal, setShowRegulatoryInfoModal] =
    useState<boolean>(false);

  // Getting the Store Data
  const {
    clients: { regulatoryDetails: { licenses = [] } = {} }
  } = useAppSelector((state) => state.clientManagement);

  const handleTableBtnClick = (name: string) => {
    if (name === "Onboarding") {
      setShowRegulatoryInfoModal(true);
    }
  };

  /* Table Columns */
  const columns = [
    {
      key: "name",
      title: "Name",
      dataIndex: "name",
      render: (name: any) => {
        return (
          name && (
            <Button
              label={name}
              type="link"
              style={{ padding: 0 }}
              onClick={() => handleTableBtnClick(name)}
            />
          )
        );
      }
    },
    {
      key: "timeDate",
      title: "Time/Date",
      dataIndex: "timeDate",
      render: (timeDate: any) => {
        return timeDate ? formatTimeAndDate(timeDate, timezone) : null;
      }
    }
  ];

  const validateTableColumn = (riskAndKycTableColumn || []).filter(
    (data: any) => data.timeDate !== ""
  );

  const handleButtonClick = (label: string) => {
    if (label === "Documents") {
      setShowDocumentsInfoModal(true);
    }
    if (label === "People") {
      setShowPeopleModal(true);
    }
  };

  return (
    <div className={Styles["risk__kyc__wrapper"]}>
      <Header>
        <HeaderContent.LeftSide>
          <HeaderContent.Title>{title}</HeaderContent.Title>
        </HeaderContent.LeftSide>
        <HeaderContent.RightSide>
          {(rightSideHeaderData || []).map(
            (d: rightSideHeaderData, i: number) => (
              <div key={i} className={Styles["btn__rightSide"]}>
                <Button
                  label={d?.label}
                  type="tertiary"
                  style={{ padding: 0 }}
                  onClick={() => handleButtonClick(d?.label)}
                />
              </div>
            )
          )}
        </HeaderContent.RightSide>
      </Header>
      <div className={Styles["risk__kyc__subHeader"]}>
        {(leftSideSubHeaderData || []).map(
          (d: rightSideHeaderData, i: number) => {
            if (d?.label.includes("KYC status")) {
              return (
                <Button
                  key={d.key}
                  type="secondary"
                  size="small"
                  label={d?.label}
                  icon={{ name: "pen", position: "right" }}
                  onClick={() => setShowKycModal(true)}
                />
              );
            }
            return (
              <div key={i} className={Styles["btn__leftSide"]}>
                <span>{d.label}</span>
              </div>
            );
          }
        )}
      </div>
      <BasicCompanyInfoCard contentData={contentData} />
      <Spacer size={24} />
      <Spin loading={clientDetailLoading || clientDetailFetching}>
        <Table
          rowKey={(record) => record?.name || record?.timeDate}
          dataSource={validateTableColumn}
          tableColumns={columns}
          pagination={false}
          tableSize="medium"
          rowClassName="trade-row--clickable"
        />
        <Spacer size={25} />
      </Spin>
      <DocumentsModal
        show={showDocumentsModal}
        title={"Documents"}
        tableColumns={licenses}
        onCancelText={"Close"}
        onClickCancel={() => {
          setShowDocumentsInfoModal(false);
        }}
      />
      <PeopleModal
        show={showPeopleModal}
        title={"People"}
        onCancelText={"Close"}
        onClickCancel={() => {
          setShowPeopleModal(false);
        }}
      />
      <ApplicationApproval
        show={showKycModal}
        title={"Application Decision"}
        form={form}
        onCancelText={"Cancel"}
        onOkText={"Save Details"}
        // buttonOkDisabled={btnDisabled}
        onClickCancel={() => {
          setShowKycModal(false);
        }}
        onClickOk={() => {
          setShowKycModal(false);
        }}
      />
      <RegulatoryInfoModal
        show={showRegulatoryInfoModal}
        title={"Onboarding"}
        onCancelText={"Close"}
        onClickCancel={() => {
          setShowRegulatoryInfoModal(false);
        }}
      />
    </div>
  );
};

export { RiskAndKyc };
