import React, { useEffect, useState } from "react";
import { Row, Col } from "antd";
import {
  Modal,
  Form,
  Select,
  Notification,
  DatePicker
} from "@payconstruct/design-system";
import moment, { Moment } from "moment-timezone";
import { useAppSelector } from "../../../../../../redux/hooks/store";
import { useUpdateKycRefreshMutation } from "../../../../../../services/gppService";
import { useGetClientDetailQuery } from "../../../../../../services/clientManagement";
import { selectTimezone } from "../../../../../../config/general/generalSlice";
import { generateRandomName } from "../../../../../../config/transformer";
import { kycStatusList } from "../../../ClientSummaryForm";

const dateFormat = "YYYY-MM-DD";

interface ApplicationApprovalModalProps {
  show: boolean;
  title: any;
  form: any;
  onCancelText: string;
  onOkText: string;
  onClickCancel: () => void;
  onClickOk: (data?: any) => void;
}

const ApplicationApproval: React.FC<ApplicationApprovalModalProps> = ({
  show,
  title,
  form,
  onCancelText,
  onOkText,
  onClickCancel,
  onClickOk
}) => {
  const { isKycStatusLoading } = useAppSelector(
    (state) => state.applicationApproval
  );

  const [kycStatus, setSelectedKycStatus] = useState<string>("");
  const [date, setDate] = useState<boolean>(false);
  const [randomName] = useState(generateRandomName);

  const timezone = useAppSelector(selectTimezone);
  const { clients } = useAppSelector((state) => state.clientManagement);
  const clientId: string = clients?.id;

  const [updateKYCInformation, { isSuccess: isKycUpdateSuccess }] =
    useUpdateKycRefreshMutation();

  const formatDate = (nextKycRefreshDate: string) => {
    if (nextKycRefreshDate) {
      const dateTime = moment(nextKycRefreshDate);
      const nextKycRefresh = dateTime.tz(timezone).format("YYYY-MM-DD");
      return nextKycRefresh;
    }
    return undefined;
  };

  // Api Call to Get the Individual Client Data
  const { refetch } = useGetClientDetailQuery(
    { randomName, clientId },
    { skip: !isKycUpdateSuccess }
  );

  useEffect(() => {
    if (isKycUpdateSuccess) {
      refetch();
      setSelectedKycStatus("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isKycUpdateSuccess]);

  const handleSelectedKycStatus = (status: any): any => {
    if (status) {
      setSelectedKycStatus(status);
    }
  };

  const disabledDate = (current: Moment) => {
    // Can not select days before today
    return current < moment().subtract(1, "day").endOf("day");
  };

  const handleDate = () => {
    setDate(true);
  };

  const ApplicationApprovalModalBody = (form: any, formSubmitAction: any) => {
    const onFinish = async (formValues: {
      kycStatus: string;
      nextKycRefreshDate: string;
    }) => {
      const { kycStatus, nextKycRefreshDate } = formValues;

      try {
        await updateKYCInformation({
          entityId: clients?.id,
          data: {
            kycStatus,
            nextKycRefreshDate: formatDate(nextKycRefreshDate)
          }
        }).unwrap();
        Notification({
          message: "",
          description: "Successfully updated!",
          type: "success"
        });
        formSubmitAction();
        if (form?.resetFields) form?.resetFields();
      } catch (err: any) {
        Notification({
          message: "",
          description: "Failed to update, something is wrong!!",
          type: "error"
        });
      }
    };
    return (
      <div>
        <Form form={form} onFinish={onFinish}>
          <Row gutter={15}>
            <Col className="gutter-row" span={24}>
              <Form.Item name={"kycStatus"}>
                <Select
                  label="KYC Status"
                  optionlist={kycStatusList}
                  placeholder={"Enter KYC Status"}
                  style={{
                    width: "100%"
                  }}
                  onChange={handleSelectedKycStatus}
                />
              </Form.Item>
            </Col>
          </Row>
          {kycStatus === "pass" && (
            <Row gutter={15}>
              <Col className="gutter-row" span={24}>
                <Form.Item name={"nextKycRefreshDate"}>
                  <DatePicker
                    disabledDate={disabledDate}
                    style={{ width: "100%" }}
                    placeholder="Next KYC Refresh Date"
                    format={dateFormat}
                    onChange={handleDate}
                  />
                </Form.Item>
              </Col>
            </Row>
          )}
        </Form>
      </div>
    );
  };

  return (
    <Modal
      modalView={show}
      title={title}
      onCancelText={onCancelText}
      onOkText={onOkText}
      onClickCancel={() => {
        onClickCancel();
        form.resetFields();
      }}
      onClickOk={() => {
        form.submit();
      }}
      description={ApplicationApprovalModalBody(form, onClickOk)}
      btnLoading={isKycStatusLoading}
      buttonOkDisabled={!kycStatus || (kycStatus === "pass" && !date)}
    />
  );
};

export { ApplicationApproval };
