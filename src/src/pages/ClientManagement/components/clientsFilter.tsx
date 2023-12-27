import React from "react";
import {
  Drawer,
  Header,
  Text,
  Form,
  Select,
  Button
} from "@payconstruct/design-system";
import "./clientsFilter.css";
import { useAppSelector } from "../../../redux/hooks/store";

/**
 *
 *  @component clients Filter
 *
 *  @param toggleDrawer Show / Hide Filter Drawer.
 *  @param onSubmit  Callback function when user clicks on submit btn.
 *  @param onClose   Callback function when user clicks on Cancel btn, it's will clear the filtered data and refetch the initial data.
 *
 *  @returns null
 */

interface IClientsFilterProps {
  toggleDrawer: boolean;
  loading: boolean;
  onSubmit: (values: any) => void;
  onClose: () => void;
}

const ClientsFilter: React.FC<IClientsFilterProps> = ({
  toggleDrawer = false,
  loading = false,
  onSubmit,
  onClose
}) => {
  const [form] = Form.useForm();

  const { allClients } = useAppSelector((state) => state.general);

  const getDrawerContent = () => {
    let tradingNameOptions: any = [],
      companyNameOptions: any = [];

    /* 
        Extracting the company and trading name for filter dropdown list data.
      */

    for (let i = 0; i < allClients.length; i++) {
      const current = allClients[i];
      /* Getting Company name */
      if (current?.genericInformation) {
        if (
          current?.genericInformation?.registeredCompanyName &&
          current?._id !== ""
        ) {
          companyNameOptions.push([
            current?._id,
            current?.genericInformation?.registeredCompanyName
          ]);
        }
        /* Getting Trading name */
        if (current?.genericInformation?.tradingName && current?._id !== "") {
          tradingNameOptions.push([
            current?._id,
            current?.genericInformation?.tradingName
          ]);
        }
      }
    }

    const riskCategoriesOptions: any = [
      ["high_risk_one", "High Risk One"],
      ["high_risk_two", "High Risk Two"],
      ["high_risk_three", "High Risk Three"],
      ["medium", "Medium"],
      ["low", "Low"]
    ];

    const kycStatusOptions: any = [
      ["pass", "Pass"],
      ["fail", "Fail"],
      ["review_required", "Review Required"],
      ["pending", "Pending"],
      ["new", "New"]
    ];

    const handleOnClose = () => {
      form.resetFields();
      onClose();
    };

    return (
      <>
        <Form form={form} onFinish={(formData: any) => onSubmit(formData)}>
          <div className="filter__header">
            <Header header="Filter" subHeader="" />
            <div
              onClick={() => {
                form.resetFields();
              }}
              style={{ cursor: "pointer" }}
            >
              <Text label="Clear all" size="default" />
            </div>
          </div>
          <div className="filter__main pt-3">
            <Form.Item name="companyName">
              <Select
                label="Company Name"
                optionlist={companyNameOptions}
                placeholder="Select"
                optionFilterProp="children"
              />
            </Form.Item>
            <Form.Item name="tradingName">
              <Select
                label="Trading Name"
                optionlist={tradingNameOptions}
                placeholder="Select"
                optionFilterProp="children"
              />
            </Form.Item>
            <Form.Item name="riskCategory">
              <Select
                label="Risk Category"
                optionlist={riskCategoriesOptions}
                placeholder="Select"
                optionFilterProp="children"
              />
            </Form.Item>
            <Form.Item name="kycStatus">
              <Select
                label="KYC Status"
                optionlist={kycStatusOptions}
                placeholder="Select"
                optionFilterProp="children"
              />
            </Form.Item>
          </div>
          <div className="filter__footer">
            <Button
              className="cancel__filter-btn"
              label="Cancel"
              type="secondary"
              disabled={loading}
              onClick={handleOnClose}
            />
            <Button
              label="See Results"
              type="primary"
              loading={loading}
              onClick={() => form.submit()}
            />
          </div>
        </Form>
      </>
    );
  };

  return (
    <Drawer visible={toggleDrawer} closable={false} width={400}>
      {getDrawerContent()}
    </Drawer>
  );
};

export default ClientsFilter;
