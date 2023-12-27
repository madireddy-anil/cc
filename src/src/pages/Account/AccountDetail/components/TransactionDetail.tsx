import React from "react";
import { Space } from "antd";
import { Text, Switch, Colors, Popconfirm } from "@payconstruct/design-system";

interface TransactionDetailProps {
  accountNumber: string;
  buttonLabel: string;
  handleButtonClick: any;
  accountStatus: string;
  visibleConfirm: boolean;
  onCancelStatusChange: any;
  onConfirmStatusChange: any;
  showPopconfirm: any;
  // handleAccountStatusChange: any;
  isLoadingStatusChange: boolean;
  account: any;
}

const TransactionDetail: React.FC<TransactionDetailProps> = ({
  account,
  accountStatus,
  visibleConfirm,
  buttonLabel,
  handleButtonClick,
  onCancelStatusChange,
  onConfirmStatusChange,
  showPopconfirm,
  // handleAccountStatusChange,
  isLoadingStatusChange
}) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}
    >
      <Space direction="vertical">
        <div
          style={{
            display: "flex",
            alignItems: "center"
          }}
        >
          <div>
            <Text
              size="xlarge"
              weight="bold"
              // label={account?.accountIdentification?.accountNumber ?? ""}
              label={account?.accountName}
            />
          </div>
          {/* <div style={{ marginLeft: "12px" }}>
            <Button
              label={buttonLabel}
              onClick={handleButtonClick}
              size="medium"
              type="primary"
            />
          </div> */}
        </div>

        {account?.currencyType === "fiat" ? (
          <>
            {account?.accountIdentification?.IBAN ? (
              <Space>
                <Text color={Colors.grey.neutral500} label="IBAN:" />
                <Text
                  color={Colors.grey.neutral700}
                  label={account?.accountIdentification?.IBAN}
                />
              </Space>
            ) : (
              ""
            )}
            {account?.accountIdentification?.BIC ? (
              <Space>
                <Text color={Colors.grey.neutral500} label="BIC:" />
                <Text
                  color={Colors.grey.neutral700}
                  label={account?.accountIdentification?.BIC}
                />
              </Space>
            ) : (
              ""
            )}
            {account?.accountIdentification?.bankCode ? (
              <Space>
                <Text color={Colors.grey.neutral500} label="Bank Code:" />
                <Text
                  color={Colors.grey.neutral700}
                  label={account?.accountIdentification?.bankCode}
                />
              </Space>
            ) : (
              ""
            )}
          </>
        ) : (
          ""
        )}
      </Space>

      <Popconfirm
        cancelText="No"
        okText="Yes"
        visible={visibleConfirm}
        onCancel={onCancelStatusChange}
        onConfirm={onConfirmStatusChange}
        title={
          <div style={{ width: "40rem", marginTop: "-4px" }}>
            <Text size="xsmall">
              <b>Note:</b> Please transfer out any funds on the account and
              ensure zero balance before closing. Closed accounts are not
              visible to clients and cannot receive payments. This action is not
              reversible.
            </Text>
          </div>
        }
      >
        <Space>
          <Text
            label="Account Status"
            size="medium"
            color={Colors.grey.neutral700}
          />
          <Switch
            defaultChecked={Boolean(accountStatus === "active")}
            checked={Boolean(accountStatus === "active")}
            checkedChildren="Active"
            unCheckedChildren="Closed"
            switchSize="large"
            onClick={showPopconfirm}
            // onChange={showPopconfirm}
            // onChange={handleAccountStatusChange}
            disabled={
              isLoadingStatusChange || Boolean(accountStatus !== "active")
            }
          />
        </Space>
      </Popconfirm>
    </div>
  );
};

export default TransactionDetail;
