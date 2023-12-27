import React from "react";
import {
  NotificationDropdown,
  Icon,
  Colors
} from "@payconstruct/design-system";
import { notificationData } from "./notifications.mock";

export const Notifications = () => {
  return (
    <NotificationDropdown count={5} notifications={notificationData}>
      <Icon
        color={Colors.grey.neutral500}
        customStyle={{ background: "none" }}
        name="bell"
        size="large"
      />
    </NotificationDropdown>
  );
};
