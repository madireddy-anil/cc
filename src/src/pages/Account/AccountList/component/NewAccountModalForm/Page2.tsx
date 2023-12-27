import { FC, Fragment } from "react";
import {
  Input,
  Select,
  Form as DSForm,
  Switch,
  Text
} from "@payconstruct/design-system";

import {
  DropDownGroupType,
  CurrencySetType,
  PageConfigType
} from "../accountListTypes";
import css from "./style.module.css";

interface PropTypes {
  currencyType: CurrencySetType;
  dropdownList: DropDownGroupType;
  setModalPageConfig: (e: any) => void;
  modalPageConfig: PageConfigType;
}

const Page2: FC<PropTypes> = ({
  currencyType,
  dropdownList,
  setModalPageConfig,
  modalPageConfig
}) => {
  return (
    <Fragment>
      <div className={css["modal-input-row"]}>
        <div className={css["modal-switch-parent"]}>
          <div style={{ flexGrow: 8 }}>
            <Text label="Auto generate from bank" />
          </div>
          <div style={{ flexGrow: 1, textAlign: "right" }}>
            <Switch
              checked={modalPageConfig.isAutoGenerate}
              onChange={(dd) => {
                console.log("changed");
                setModalPageConfig({ ...modalPageConfig, isAutoGenerate: dd });
              }}
              switchSize="large"
            />
          </div>
        </div>
      </div>

      {modalPageConfig.isAutoGenerate ? (
        <Fragment></Fragment>
      ) : (
        <Fragment>
          {currencyType === "fiat" ? (
            <Fragment>
              <div style={{ marginBottom: "-40px" }}>
                <DSForm.Item
                  name="accountNumber"
                  rules={
                    [
                      // { required: true, message: "Account Number is required" }
                    ]
                  }
                >
                  <Input
                    label="Account Number"
                    className={css["modal-input-row"]}
                  />
                </DSForm.Item>
              </div>
              <div style={{ marginBottom: "70px" }}>
                <DSForm.Item
                  name="accountRegion"
                  rules={[
                    { required: true, message: "Account Region is required" }
                  ]}
                >
                  <Select
                    label="Region *"
                    placeholder="Select"
                    optionlist={dropdownList.region}
                    optionFilterProp="children"
                  />
                </DSForm.Item>
              </div>
              <div className={css["modal-input-row-text"]}>
                <DSForm.Item name="bankCode">
                  <Input label="Bank Code" className={css["modal-input-row"]} />
                </DSForm.Item>
              </div>
              <div className={css["modal-input-row-text"]}>
                <DSForm.Item name="IBAN">
                  <Input label="IBAN" className={css["modal-input-row"]} />
                </DSForm.Item>
              </div>
              <div className={css["modal-input-row-text"]}>
                <DSForm.Item name="BIC">
                  <Input label="Swift BIC" className={css["modal-input-row"]} />
                </DSForm.Item>
              </div>
              <div className={css["modal-input-row-text"]}>
                <DSForm.Item name="intermediaryBank">
                  <Input
                    label="Intermediary Bank"
                    className={css["modal-input-row"]}
                  />
                </DSForm.Item>
              </div>
            </Fragment>
          ) : (
            <Fragment>
              <DSForm.Item
                name="walletId"
                rules={[{ required: true, message: "Wallet ID is required" }]}
              >
                <Input
                  name="accountNumber"
                  label="Wallet ID"
                  className={css["modal-input-row"]}
                />
              </DSForm.Item>
              <DSForm.Item
                name="blockchain"
                rules={[{ required: true, message: "Blockchain" }]}
              >
                <Input
                  name="blockchain"
                  label="Blockchain"
                  className={css["modal-input-row"]}
                />
              </DSForm.Item>
            </Fragment>
          )}
        </Fragment>
      )}
    </Fragment>
  );
};

export default Page2;
