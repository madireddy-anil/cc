import React from "react";
import {
  Drawer,
  Header,
  Text,
  Form,
  Select,
  Button
  // DatePicker
} from "@payconstruct/design-system";
import { useAppSelector } from "../../../redux/hooks/store";
import Styles from "./Filter.module.css";

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
  onSubmit: (values: any) => void;
  onClose: () => void;
}

const ClientsFilter: React.FC<IClientsFilterProps> = ({
  toggleDrawer = false,
  onSubmit,
  onClose
}) => {
  const [form] = Form.useForm();
  // const { RangePicker } = DatePicker;

  const { allClients } = useAppSelector((state) => state.general);

  const getDrawerContent = () => {
    let companyNameOptions: any = [];

    /* 
        Extracting the company and trading name for filter dropdown list data.
      */

    for (let i = 0; i < allClients.length; i++) {
      const current = allClients[i];
      /* Getting Company name */
      if (current?.genericInformation) {
        if (
          current?.genericInformation?.registeredCompanyName &&
          current?.id !== ""
        ) {
          companyNameOptions.push([
            current?.id,
            current?.genericInformation?.registeredCompanyName
          ]);
        }
      }
    }

    const handleOnClose = () => {
      form.resetFields();
      onClose();
    };

    return (
      <>
        <Form form={form} onFinish={(formData: any) => onSubmit(formData)}>
          <div className={Styles["filter__header"]}>
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
          <div className={Styles["filter__main"]}>
            {/* <Form.Item name="fromToDate"> */}
            {/* @ts-ignore */}
            {/* <RangePicker
                helperText=""
                label="Select Date Range"
                onChange={function noRefCheck() {}}
                onOk={function noRefCheck() {}}
                placeholder={["From Date", "To Date"]}
                style={{ width: "100%" }}
              /> */}
            {/* </Form.Item> */}
            <Form.Item name="entityId">
              <Select
                label="Company Name"
                optionlist={companyNameOptions}
                placeholder="Select"
                optionFilterProp="children"
              />
            </Form.Item>
          </div>
          <div className={Styles["filter__footer"]}>
            <Button
              className={Styles["cancel__filter-btn"]}
              label="Cancel"
              type="secondary"
              onClick={handleOnClose}
            />
            <Button
              label="Apply"
              type="primary"
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
