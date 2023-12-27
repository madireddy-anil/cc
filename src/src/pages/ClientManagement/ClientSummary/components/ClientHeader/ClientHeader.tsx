import React, { useState } from "react";
import { Header, HeaderContent } from "../../../../../components";
import { Button, Tooltip } from "@payconstruct/design-system";
import LinkDrawer from "./Drawer";
import { useAppSelector } from "../../../../../redux/hooks/store";
import {
  validationOnData,
  capitalize
} from "../../../../../config/transformer";
import Styles from "./clientHeader.module.css";

interface ClientHeaderProps {
  onClickEdit: (data?: any) => void;
  onClickAddNewUser: (data?: any) => void;
}

export const ClientHeader: React.FC<ClientHeaderProps> = ({
  onClickEdit,
  onClickAddNewUser
}) => {
  const [showDrawer, setToggleDrawer] = useState<boolean>(false);
  const { clients } = useAppSelector((state) => state.clientManagement);
  const { genericInformation = {} } = clients || {};
  const industries: any = validationOnData(
    genericInformation?.industries,
    "array"
  );
  const industryType = industries?.length
    ? capitalize(industries[0]?.industryType)
    : "";
  return (
    <>
      <Header>
        <HeaderContent.LeftSide>
          <HeaderContent.Title
            subtitle={
              genericInformation?.tradingName &&
              `${genericInformation?.tradingName} / ${industryType}`
            }
          >
            {genericInformation?.registeredCompanyName || ""}
          </HeaderContent.Title>

          <div className={Styles["general__edit"]}>
            <Button
              type="secondary"
              label="Edit"
              onClick={onClickEdit}
              loading={false}
              size="medium"
              disabled={false}
              icon={{
                name: "pen",
                position: "left"
              }}
            />
          </div>

          <div className={Styles["general__edit"]}>
            <Button
              type="primary"
              label="New User"
              onClick={onClickAddNewUser}
              loading={false}
              size="medium"
              disabled={false}
              icon={{
                name: "add",
                position: "left"
              }}
            />
          </div>
        </HeaderContent.LeftSide>
        <HeaderContent.RightSide>
          <div className={Styles["linkObject__drawer"]}>
            <Tooltip tooltipPlacement="right" text="View Linked Objects">
              <Button
                type="tertiary"
                onClick={() => setToggleDrawer(true)}
                loading={false}
                size="large"
                disabled={false}
                icon={{
                  name: "leftArrow",
                  position: "left"
                }}
              />
            </Tooltip>
            <Tooltip tooltipPlacement="right" text="View Pricing">
              <Button
                type="tertiary"
                loading={false}
                size="large"
                disabled={false}
                icon={{
                  name: "pricing",
                  position: "left"
                }}
              />
            </Tooltip>
          </div>
        </HeaderContent.RightSide>
      </Header>
      <LinkDrawer toggleDrawer={showDrawer} setToggleDrawer={setToggleDrawer} />
    </>
  );
};

// Export need to be default for code Splitting
// https://reactjs.org/docs/code-splitting.html#route-based-code-splitting
export { ClientHeader as default };
