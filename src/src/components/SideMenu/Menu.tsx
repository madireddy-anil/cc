import {
  Icon,
  SideMenu,
  MenuItem,
  MenuItemGroup
} from "@payconstruct/design-system";
import { useEffect, useMemo } from "react";
import { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import {
  selectMenuEnable,
  selectMenuCollapsed,
  updateMenuCollapse
} from "../../config/general/generalSlice";

import { useAppDispatch, useAppSelector } from "../../redux/hooks/store";
import { FullScreenLoading } from "../Loading/FullScreenLoading";
import "./Menu.module.css";

const Menu = () => {
  const isMenuEnabled = useAppSelector(selectMenuEnable);
  const isMenuCollapsed = useAppSelector(selectMenuCollapsed);
  const dispatch = useAppDispatch();

  const menuShowingNotCollapsedStyle = useMemo(() => {
    return {
      width: `calc(100% - 300px)`,
      background: "#f7f8fa",
      marginLeft: "300px"
    };
  }, []);

  const menuShowingCollapsedStyle = useMemo(() => {
    return {
      width: `calc(100% - 80px)`,
      background: "#f7f8fa",
      marginLeft: "80px"
    };
  }, []);

  const menuHidden = useMemo(() => {
    return {
      width: `calc(100% - 0px)`,
      background: "#f7f8fa",
      marginLeft: "0px"
    };
  }, []);

  const [mainStyle, setMainStyle] = useState(menuShowingNotCollapsedStyle);

  const handleCollapse = (isCollapsed: boolean) => {
    dispatch(updateMenuCollapse(isCollapsed));

    if (isCollapsed) {
      setMainStyle(menuShowingCollapsedStyle);
      return;
    }
    setMainStyle(menuShowingNotCollapsedStyle);
  };

  useEffect(() => {
    if (isMenuEnabled) {
      if (isMenuCollapsed) {
        setMainStyle(menuShowingCollapsedStyle);
        return;
      }
      setMainStyle(menuShowingNotCollapsedStyle);
      return;
    }
    setMainStyle(menuHidden);
  }, [
    isMenuEnabled,
    isMenuCollapsed,
    menuHidden,
    menuShowingCollapsedStyle,
    menuShowingNotCollapsedStyle
  ]);

  return (
    <>
      <FullScreenLoading />
      <SideMenu
        collapsed={isMenuCollapsed}
        theme="dark"
        showBack={isMenuEnabled}
        collapsible={true}
        onCollapse={handleCollapse}
        style={{
          height: "100vh",
          left: 0,
          overflow: "hidden",
          position: "fixed"
        }}
      >
        <MenuItem
          key="Accounts List"
          title="Accounts List"
          icon={<Icon name="reports" color="white" size="small" />}
        >
          <Link to="/accounts">Accounts</Link>
        </MenuItem>
        <MenuItem
          key="new-payment"
          title="New Payment"
          icon={<Icon name="newPayment" color="white" size="small" />}
        >
          <Link to="/new-payment">New Payment</Link>
        </MenuItem>
        <MenuItem
          key="Error Queue List"
          title="Error Queue List"
          icon={<Icon name="pricing" color="white" size="small" />}
        >
          <Link to="/error-queue">Error Queue List</Link>
        </MenuItem>
        <MenuItem
          key="Exotic FX"
          title="Exotic FX"
          icon={<Icon name="exoticEfx" color="white" size="small" />}
        >
          <Link to="/orders">Exotic FX</Link>
        </MenuItem>
        <MenuItem
          key="Vendor Rates"
          title="Vendor Rates"
          icon={<Icon name="newPayment" color="white" size="small" />}
        >
          <Link to="/vendor-rates">Vendor Rates</Link>
        </MenuItem>
        <MenuItemGroup title="CLIENT MANAGEMENT" />
        <MenuItem
          key="Clients"
          title="Clients"
          icon={<Icon name="userGroup" color="white" size="small" />}
        >
          <Link to="/client-management">Clients</Link>
        </MenuItem>
        <MenuItem
          key="Clients File Exchange"
          title="Clients File Exchange"
          icon={<Icon name="file" color="white" size="small" />}
        >
          <Link to="/client-file-exchange">Clients File Exchange</Link>
        </MenuItem>
        <MenuItemGroup title="TERMS OF SERVICE" />
        <MenuItem
          key="Terms of Service"
          title="Terms of Service"
          icon={<Icon name="attention" color="white" size="small" />}
        >
          <Link to="/terms-of-service">Terms of Service</Link>
        </MenuItem>
      </SideMenu>
      <div style={mainStyle}>
        <Outlet />
      </div>
    </>
  );
};

// Export need to be default for code Splitting
// https://reactjs.org/docs/code-splitting.html#route-based-code-splitting
export { Menu as default };
