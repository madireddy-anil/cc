import { useEffect } from "react";
import {
  Avatar,
  Dropdown,
  Topbar as DSTopBar,
  TopbarContent
} from "@payconstruct/design-system";
import { Menu, Button } from "antd";
import { useNavigate, useMatch } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/hooks/store";
import {
  updateMenuShow,
  updateTopBarShow
} from "../../config/general/generalSlice";

import { useRevokeTokenMutation } from "../../services/tokenService";

interface TopbarProps {
  title: string;
  parentPage?: string;
}

export const TopBar: React.FC<TopbarProps> = ({ title, parentPage }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const match = useMatch("/*");
  const deeperPath = match?.pathname.split("/").length ?? 0;

  const [revokeToken] = useRevokeTokenMutation();

  useEffect(() => {
    if (deeperPath > 2) {
      dispatch(updateTopBarShow(true));
      return;
    }
    dispatch(updateTopBarShow(false));
  }, [deeperPath, dispatch]);

  const topBarViewFlip = useAppSelector(
    (state) => state.general.topBarViewFlip
  );

  //! Need a rework
  const goBackAction = () => {
    dispatch(updateMenuShow(true));
    dispatch(updateTopBarShow(false));
    if (parentPage) return navigate(parentPage);

    return navigate(-1);
  };

  const logoutHandler = () => {
    revokeToken();
    dispatch({ type: "user/LOG_OUT" });
  };

  return (
    <>
      <DSTopBar
        showBack={topBarViewFlip}
        showBackIcon={parentPage ? "close" : "leftArrow"}
        goBackAction={goBackAction}
        title={title}
      >
        <TopbarContent.RightSide>
          <Dropdown disabled>
            <Button disabled>TimeZone: {"HKT"}</Button>
          </Dropdown>
          <Dropdown
            arrow
            overlay={
              <Menu>
                <Menu.Item key="logout" onClick={logoutHandler}>
                  Logout
                </Menu.Item>
              </Menu>
            }
            placement="bottomLeft"
          >
            <Avatar
              size={24}
              src="https://th.bing.com/th/id/OIP.VoW0K-83DzwOxVQBEW5uYAHaJQ?pid=ImgDet&rs=1"
            />
          </Dropdown>
        </TopbarContent.RightSide>
      </DSTopBar>
    </>
  );
};
