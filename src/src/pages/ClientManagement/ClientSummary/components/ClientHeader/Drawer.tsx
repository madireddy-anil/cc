import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { Drawer, Notification, Spin } from "@payconstruct/design-system";
import {
  useAppSelector,
  useAppDispatch
} from "../../../../../redux/hooks/store";
import {
  useGetUsersByClientIdQuery,
  useGetGroupsByIdQuery,
  useDeleteUnlinkUserMutation,
  useUnlinkEntityFromGroupMutation,
  useUpdateGroupsByIdMutation,
  useUpdateLinkUsersMutation
} from "../../../../../services/clientManagement";
import {
  updateGroupId,
  setBtnLoading,
  updateModuleType,
  updateSearchQuery,
  updatePaginationProps
} from "../../../../../config/ClientMangement/ClientManagementSlice";
import {
  generateRandomName,
  validationOnData
} from "../../../../../config/transformer";
import { TradeInfo, UserData } from "../Card/Drawer/Drawer";
import { UnlinkGroupModal } from "../Modal/Drawer/UnlinkGroup";

// groups
import { AddGroup } from "../Modal/Drawer/AddGroup";
import { AddUser } from "../Modal/Drawer/AddUser";
import { UpdateUserRole } from "../Modal/Drawer/UpdateUserRole";

interface LinkDrawerProps {
  toggleDrawer: boolean;
  setToggleDrawer: (data?: any) => void;
}

const LinkDrawer: React.FC<LinkDrawerProps> = ({
  toggleDrawer = false,
  setToggleDrawer
}) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const [userId, setUserId] = useState<any>("");
  const [linkData, setLinkData] = useState<any>([]);
  const [btnDisabled, setBtnDisabled] = useState<boolean>(false);
  const [headerTitle, setHeaderTitle] = useState<string>("");
  const [drawerHeaderTitle, setDrawerHeaderTitle] = useState<string>("");
  const [showDrawerModal, setShowDrawerModal] = useState<boolean>(false);

  const [showAddUserModal, setShowAddUserModal] = useState<boolean>(false);
  const [showAddGroupModal, setShowAddGroupModal] = useState<boolean>(false);
  const [showUpdateUserRoleModal, setUpdateUserRoleModal] =
    useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<UserData>();

  const registerCompanyName: any =
    linkData.length > 0 && linkData[0].label === "Registered Company Name"
      ? linkData[0].value
      : "";
  const userEmail: any =
    linkData.length > 0 && linkData[1]?.label === "Email"
      ? linkData[1]?.value
      : "";
  const [title, setTitle] = useState<string>("");
  const [randomName] = useState<string>(generateRandomName);
  const [isUnlinkUserLoading, setUnlinkUserLoading] = useState<boolean>(false);

  /* Getting the Store Data */
  const {
    clients: { id },
    groupId
  } = useAppSelector((state) => state.clientManagement);
  const selectedUsers = useAppSelector(
    (state) => state.clientManagement.selectedUsers
  );
  const selectedGroup = useAppSelector(
    (state) => state.clientManagement.selectedGroup
  );
  const clientId = useAppSelector((state) => state.clientManagement.clients.id);
  const isUserLoading = useAppSelector(
    (state) => state.clientManagement.isUserLoading
  );
  const isGroupLoading = useAppSelector(
    (state) => state.clientManagement.isGroupLoading
  );
  const btnLoading = useAppSelector(
    (state) => state.clientManagement.btnLoading
  );

  /* Get Linked Users Api Query */
  const {
    userData = [],
    refetch: getLinkedUsers,
    isLoadingUser,
    isFetchingUser
  } = useGetUsersByClientIdQuery(
    {
      uniqueName: randomName,
      entityId: id ?? ""
    },
    {
      refetchOnMountOrArgChange: 2,
      selectFromResult: ({ data, isLoading, isFetching }) => ({
        userData: data?.data ? data?.data?.users : [],
        isLoadingUser: isLoading,
        isFetchingUser: isFetching
      }),
      skip: !id
    }
  );

  /* Get Linked Group Api Query */
  const {
    groupData = [],
    refetch: getLinkedGroups,
    isGroupsLoading,
    isGroupsFetching
  } = useGetGroupsByIdQuery(
    {
      uniqueName: randomName,
      groupId
    },
    {
      refetchOnMountOrArgChange: 2,
      selectFromResult: ({ data, isLoading, isFetching }) => ({
        groupData: data?.data,
        isGroupsLoading: isLoading,
        isGroupsFetching: isFetching
      }),
      skip: !groupId
    }
  );

  useEffect(() => {
    dispatch(updateSearchQuery(""));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatGroupData: any = !groupId
    ? []
    : [
        {
          id: groupId,
          key: groupId,
          data: [
            {
              label: "Group Name",
              value: groupData.groupName ?? "-"
            }
          ]
        }
      ];

  /* Unlink User Api Service */
  const [deleteUnlinkUser] = useDeleteUnlinkUserMutation();
  const [updateGroupById] = useUpdateGroupsByIdMutation();
  const [updateLinkUsers] = useUpdateLinkUsersMutation();

  const handleUpdateGroupById = () => {
    if (validationOnData(selectedGroup, "object")) {
      dispatch(setBtnLoading(true));
      updateGroupById({
        groupId: selectedGroup?.id,
        data: { entityIds: [clientId] }
      })
        .unwrap()
        .then(() => {
          dispatch(updateGroupId(selectedGroup?.id));
          setShowAddGroupModal(false);
          getLinkedGroups();
          dispatch(setBtnLoading(false));
        });
    }
  };

  const handleUpdateUsersIds = () => {
    if (selectedUsers?.length) {
      dispatch(setBtnLoading(true));
      updateLinkUsers({
        entityId: clientId,
        data: { userIds: selectedUsers }
      })
        .unwrap()
        .then(() => {
          setShowAddUserModal(false);
          getLinkedUsers();
          dispatch(setBtnLoading(false));
        })
        .catch((err: any) => {
          Notification({
            message: err?.data?.message
              ? err?.data?.message
              : intl.formatMessage({ id: "somethingIsWrong" }),
            type: "warning"
          });
          dispatch(setBtnLoading(false));
        });
    }
  };

  /* formatLinked Users Data */
  const formatLinkedUsers: any =
    validationOnData(userData, "array") &&
    (userData || []).map((val: any) => {
      const LinkedUserInfoData = [
        {
          id: val?.id,
          data: [
            {
              label: "Name",
              value: val?.firstName + " " + val?.lastName ?? ""
            },
            { label: "Email", value: val?.email ?? "" },
            { label: "Role", value: val?.role ?? "" },
            { label: "Status", value: val?.active ? "active" : "inactive" }
          ]
        }
      ];
      return LinkedUserInfoData;
    });
  /*Api to unlink the entity from group */
  const [unlinkEntityFromGroup] = useUnlinkEntityFromGroupMutation();

  const onClickAddBtn = (type: any) => {
    if (type === "Link Users") {
      dispatch(updatePaginationProps({ current: 1, pageSize: 10 }));
      dispatch(updateModuleType("linked_users"));
      setHeaderTitle("Add New User");
      setShowAddUserModal(true);
    }
    if (type === "Add Group") {
      dispatch(updatePaginationProps({ current: 1, pageSize: 10 }));
      dispatch(updateModuleType("linked_groups"));
      setHeaderTitle("Add New Group");
      setShowAddGroupModal(true);
    }
    if (type === "Add Introducer") {
      setHeaderTitle("Add New Group");
    }
  };

  const onClickUnlink = (info: any, title: any) => {
    const { id, data } = info;
    setUserId(id);
    setLinkData(data);
    setShowDrawerModal(true);
    if (title) {
      setTitle(title);
      switch (title) {
        case "Linked Users":
          setDrawerHeaderTitle("Unlink User");
          return;
        case "Linked Companies":
          return setDrawerHeaderTitle("Unlink Companies");
        case "Linked Group":
          return setDrawerHeaderTitle("Unlink Group");
        default:
          return "";
      }
    }
    return undefined;
  };

  const onBtnSubmit = async () => {
    setUnlinkUserLoading(true);
    if (title === "Linked Users") {
      const payload = {
        userId,
        entityId: id
      };
      try {
        setBtnDisabled(true);
        await deleteUnlinkUser(payload)
          .unwrap()
          .then((res) => {
            setUnlinkUserLoading(false);
            getLinkedUsers();
            Notification({
              message: res?.message
                ? res?.message
                : intl.formatMessage({ id: "unlinkUserInfoSuccess" }),
              type: "success"
            });
          });

        setBtnDisabled(false);
      } catch (err: any) {
        setUnlinkUserLoading(false);
        Notification({
          message: err?.data?.message
            ? err?.data?.message
            : intl.formatMessage({ id: "unlinkUserInfoError" }),
          type: "error"
        });
      }
      dispatch(setBtnLoading(false));
      setShowDrawerModal(false);
    } else if (title === "Linked Group") {
      setBtnDisabled(true);
      try {
        await unlinkEntityFromGroup(id)
          .unwrap()
          .then(() => {
            setBtnDisabled(false);
            getLinkedGroups();
            Notification({
              message: intl.formatMessage({
                id: "unlinkEntityFromGroupSuccess"
              }),
              type: "success"
            });
          });
      } catch (err: any) {
        Notification({
          message: err?.data?.message
            ? err?.data?.message
            : intl.formatMessage({ id: "unlinkEntityFromGroupError" }),
          type: "error"
        });
      }
      dispatch(setBtnLoading(false));
      setShowDrawerModal(false);
    }
  };

  const getLinkedUsersIds = (userData: any) => {
    const linkedUsers = (userData || [])
      .filter((user: any) => user.active === true)
      .map((userLink: any) => {
        return userLink.id;
      });
    return linkedUsers;
  };

  // const parentEntity: any =
  //   userData.length > 0 && userData.every((data: any) => data?.entities.length === 1 && (data?.entities[0] === data?.entity));

  const getDrawerContent = () => {
    return (
      <>
        <div>
          <Spin loading={isLoadingUser || isFetchingUser}>
            <TradeInfo
              title={"Linked Users"}
              subTitle={
                formatLinkedUsers.length !== 0
                  ? `${formatLinkedUsers.length} Results`
                  : `No Results Found`
              }
              createBtnTitle={"Link Users"}
              onClickAddBtn={onClickAddBtn}
              contentData={formatLinkedUsers ? formatLinkedUsers?.flat() : []}
              onClickUnlink={onClickUnlink}
              onClickUpdateUserRole={(v) => {
                setSelectedUser(v);
                setUpdateUserRoleModal(true);
              }}
              // entityInfo={!parentEntity}
            />
          </Spin>
        </div>
        <div style={{ marginTop: "30px" }}>
          <Spin loading={isGroupsLoading || isGroupsFetching}>
            <TradeInfo
              title={"Linked Group"}
              subTitle={
                formatGroupData.length > 0
                  ? `${formatGroupData.length} Results`
                  : `No Results Found`
              }
              createBtnTitle={"Add Group"}
              onClickAddBtn={onClickAddBtn}
              contentData={formatGroupData ? formatGroupData?.flat() : []}
              onClickUnlink={onClickUnlink}
            />
          </Spin>
        </div>
        {/* <div style={{ marginTop: "30px" }}>
          <TradeInfo
            title={"Linked Companies"}
            subTitle={
              formatLinkedCompany.length !== 0
                ? `${formatLinkedCompany.length} Results`
                : `No Results Found`
            }
            createBtnTitle={"Add Company"}
            onClickAddBtn={onClickAddBtn}
            contentData={formatLinkedCompany ? formatLinkedCompany?.flat() : []}
            onClickUnlink={onClickUnlink}
          />
        </div> */}
        <div style={{ marginTop: "30px" }}>
          <TradeInfo
            title={"Linked Introducers"}
            subTitle={"No Results Found"}
            createBtnTitle={"Add Introducer"}
            onClickAddBtn={onClickAddBtn}
            contentData={[]}
          />
        </div>
      </>
    );
  };

  return (
    <>
      <Drawer
        visible={toggleDrawer}
        onClose={() => setToggleDrawer(false)}
        closable={false}
        width={320}
      >
        {getDrawerContent()}
      </Drawer>
      <UnlinkGroupModal
        show={showDrawerModal}
        title={drawerHeaderTitle}
        description={userEmail || registerCompanyName}
        // btnDisabled={btnDisabled}
        isLoading={isUnlinkUserLoading}
        onCancelText={"Cancel"}
        onOkText={"Unlink"}
        onClickCancel={() => {
          setShowDrawerModal(false);
        }}
        onClickOk={onBtnSubmit}
      />

      <AddUser
        show={showAddUserModal}
        title={headerTitle}
        description={"test"}
        btnDisabled={btnDisabled}
        onCancelText={"Cancel"}
        onOkText={"Save"}
        isLoading={isUserLoading || btnLoading}
        linkedUserIds={getLinkedUsersIds(userData)}
        linkedUsers={userData}
        onClickCancel={() => {
          setShowAddUserModal(false);
        }}
        onClickOk={() => handleUpdateUsersIds()}
      />
      <AddGroup
        show={showAddGroupModal}
        title={headerTitle}
        description={"test"}
        btnDisabled={btnDisabled}
        onCancelText={"Cancel"}
        onOkText={"Save"}
        linkedGroup={[groupData]}
        loader={isGroupLoading || btnLoading}
        onClickCancel={() => {
          setShowAddGroupModal(false);
        }}
        onClickOk={() => handleUpdateGroupById()}
      />
      <UpdateUserRole
        show={showUpdateUserRoleModal}
        user={selectedUser}
        toggleShow={(v) => setUpdateUserRoleModal(v)}
        refetchLinkedUsers={() => getLinkedUsers()}
      />
    </>
  );
};

// Export need to be default for code Splitting
// https://reactjs.org/docs/code-splitting.html#route-based-code-splitting
export { LinkDrawer as default };
