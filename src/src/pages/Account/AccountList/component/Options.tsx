import React from "react";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router-dom";

import { Space, Row, Col, Menu, Dropdown } from "antd";
import { Text, Button, Colors, Icon, Badge } from "@payconstruct/design-system";
import { MenuOutlined, AppstoreTwoTone } from "@ant-design/icons";
import { selectAppliedFilter } from "../../../../config/account/accountSlice";
import { useAppSelector } from "../../../../redux/hooks/store";
import { FormPageType } from "./accountListTypes";

import "./Options.css";

const toggleView = (label: string, selected: string): object => {
  const styleSelected = {
    backgroundColor: Colors.grey.neutral200
  };
  return label === selected ? styleSelected : {};
};

interface PropTypes {
  selected: string;
  clickEvent: (e: any) => void;
  openModalPage: (e: FormPageType) => void;
  showFilters: () => void;
}

const Options: React.FC<PropTypes> = ({
  selected = "list",
  clickEvent,
  openModalPage,
  showFilters
}) => {
  const intl = useIntl();
  const navigate = useNavigate();
  const clickToggle = (viewType: string, handler: any) => {
    return () => {
      handler(viewType);
    };
  };
  const appliedFilterProperty: any = useAppSelector(selectAppliedFilter);

  return (
    <>
      <Row>
        <Col span={18}>
          <Space className="gutter-row account-list-options-height">
            <Text
              size="xlarge"
              weight="bold"
              label={intl.formatMessage({ id: "accounts" })}
            />
            <Dropdown
              overlay={
                <Menu color={"#000"}>
                  <Menu.Item key="account-menu-0">
                    <Button
                      size="medium"
                      label={intl.formatMessage({ id: "clientAccount" })}
                      type="tertiary"
                      onClick={() => openModalPage("client")}
                    />
                  </Menu.Item>
                  <Menu.Item key="account-menu-1">
                    <Button
                      size="medium"
                      label="PL Account"
                      type="tertiary"
                      onClick={() => openModalPage("pl")}
                    />
                  </Menu.Item>
                  <Menu.Item key="account-menu-2">
                    <Button
                      size="medium"
                      label="Vendor Client Account"
                      type="tertiary"
                      onClick={() => openModalPage("vendor-client")}
                    />
                  </Menu.Item>
                  <Menu.Item key="account-menu-3">
                    <Button
                      size="medium"
                      label="Vendor PL Account"
                      type="tertiary"
                      onClick={() => openModalPage("vendor-pl")}
                    />
                  </Menu.Item>
                  <Menu.Item key="account-menu-4">
                    <Button
                      size="medium"
                      label="Suspense Account"
                      type="tertiary"
                      onClick={() => openModalPage("suspense")}
                    />
                  </Menu.Item>
                </Menu>
              }
              trigger={["click"]}
              placement="bottomLeft"
            >
              <div>
                <Button
                  icon={{
                    name: "add"
                  }}
                  label={intl.formatMessage({ id: "newAccount" })}
                  size="medium"
                  type="primary"
                />
              </div>
            </Dropdown>

            <Button
              icon={{
                name: "add"
              }}
              label={intl.formatMessage({ id: "newPayment" })}
              size="medium"
              type="secondary"
              onClick={() => {
                navigate("/new-payment");
              }}
            />
          </Space>
        </Col>
        <Col span={6}>
          <div className="account-options-toggle account-list-options-height">
            <div
              onClick={clickToggle("grid", clickEvent)}
              style={toggleView("grid", selected)}
            >
              <AppstoreTwoTone
                className="account-options-toggle-icon"
                style={{ fontSize: "1.8rem" }}
                twoToneColor={Colors.grey.neutral900}
              />
            </div>
            <div
              onClick={clickToggle("list", clickEvent)}
              style={toggleView("list", selected)}
            >
              <MenuOutlined
                className="account-options-toggle-icon"
                style={{ fontSize: "1.8rem" }}
                twoToneColor={Colors.grey.neutral900}
              />
            </div>
            <div style={{ direction: "ltr" }}>
              <Badge
                dot={
                  appliedFilterProperty.accountType !== undefined ||
                  appliedFilterProperty.issuerEntityId !== undefined ||
                  appliedFilterProperty.ownerEntityId !== undefined ||
                  appliedFilterProperty.currency !== undefined
                }
              >
                {/* <Button
                  label="Filters"
                  onClick={showFilters}
                  size="medium"
                  type="tertiary"
                  icon={{
                    name: "filter",
                    position: "left"
                  }}
                /> */}
                <Icon name="filter" onClick={showFilters} />
              </Badge>
            </div>
          </div>
        </Col>
      </Row>
    </>
  );
};

export default Options;
