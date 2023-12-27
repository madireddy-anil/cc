import React, { useEffect, useState } from "react";
import {
  Search as Searcher,
  Modal,
  Pagination,
  Spin,
  Table
} from "@payconstruct/design-system";
import {
  useGetUsersQuery,
  useGetUsersOnSearchQuery,
  UserOnSearchRequest
} from "../../../../../../services/clientManagement";
import { useDebounce } from "../../../../../../customHooks/useDebounce";
import {
  useAppDispatch,
  useAppSelector
} from "../../../../../../redux/hooks/store";
import {
  updateSelectedUsers,
  updateSearchQuery,
  updatePaginationProps,
  searchQuery as searchQueryReducer,
  updateUserSearchLoading
} from "../../../../../../config/ClientMangement/ClientManagementSlice";
import { Spacer } from "../../../../../../components";
import Styles from "./Drawer.module.css";

interface CreateNewGroupModalProps {
  show: boolean;
  title: any;
  description?: any;
  btnDisabled: boolean;
  onCancelText: string;
  onOkText: string;
  isLoading: boolean;
  linkedUserIds: any[];
  linkedUsers: any[];
  onClickCancel: () => void;
  onClickOk: (data?: any) => void;
}

const AddUser: React.FC<CreateNewGroupModalProps> = ({
  show,
  title,
  btnDisabled,
  onCancelText,
  onOkText,
  isLoading,
  linkedUsers,
  linkedUserIds,
  onClickCancel,
  onClickOk
}) => {
  const dispatch = useAppDispatch();

  const searchQuery = useAppSelector(searchQueryReducer);
  const moduleType = useAppSelector(
    (state) => state.clientManagement.moduleType
  );

  const paginationProps = useAppSelector(
    (state) => state.clientManagement.paginationProps
  );

  const searchKey = useAppSelector(
    (state) => state.clientManagement.searchQuery
  );

  /* Api call payload */
  const [searchPayload, setSearchPayload] = useState<UserOnSearchRequest>({
    query: ""
  });

  const [listOfUsers, setListOfUsers] = useState<any[]>([]);
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);
  const [isBtnDisabled, setBtnDisabled] = useState<boolean>(true);

  /* state to preventing the useEffect calling when component remounts */
  const [isDataPreserved, setIfDataPreserved] = useState<boolean>(false);

  /* Users Api Query */
  const {
    response,
    totalListLength,
    refetch: getUsersList,
    isUsersLoading,
    isUserFetching
  } = useGetUsersQuery(paginationProps, {
    refetchOnMountOrArgChange: true,
    skip: moduleType !== "linked_users" || paginationProps.current === 0,
    selectFromResult: ({
      data,
      isLoading,
      isSuccess,
      isError,
      isFetching
    }) => ({
      response: data?.data?.user,
      totalListLength: data?.data?.total,
      isUsersLoading: isLoading,
      isUserFetching: isFetching,
      isSuccess,
      isError
    })
  });

  /* Users Api Query on Search */
  const { usersOnSearchResponse, isUserSearchLoading } =
    useGetUsersOnSearchQuery(searchPayload, {
      refetchOnMountOrArgChange: true,
      selectFromResult: ({
        data,
        isLoading,
        isSuccess,
        isError,
        isFetching
      }) => ({
        usersOnSearchResponse: data?.data?.users,
        totalListOnSearchLength: data?.data?.total,
        isUserSearchLoading: isLoading,
        isSuccess,
        isError,
        isFetching
      }),
      skip: searchPayload.query === "" || isDataPreserved
    });

  useEffect(() => {
    setSelectedRowKeys(linkedUserIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // useEffect(() => {
  //   if (paginationProps) {
  //     getUsersList();
  //   }
  //   getUsersList();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [paginationProps]);

  useEffect(() => {
    if (searchQuery !== "") {
      shiftAccountToFirst();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* when user starts typing adding a delay and update the state */
  useDebounce(
    () => {
      if (searchValue) {
        setSearchPayload({
          query: searchValue
        });
      }
    },
    350,
    [searchValue]
  );

  /* Setting data to state, when data fetched successfully...  */
  useEffect(() => {
    if (!searchValue) {
      setListOfUsers(response ?? []);
    }
    if (searchValue) {
      setListOfUsers(usersOnSearchResponse ?? []);
    }
    if (isUserSearchLoading || !isUserSearchLoading) {
      dispatch(updateUserSearchLoading(isUserSearchLoading));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response, usersOnSearchResponse, searchValue, isUserSearchLoading]);

  useEffect(() => {
    if ((response && !searchPayload?.query) || !searchKey) {
      const removeDuplicate = response?.filter(
        (data: any) => !selectedRowKeys.includes(data?.id)
      );
      const allUsers = linkedUsers.concat(removeDuplicate);

      const result = [];
      const map = new Map();
      for (const item of allUsers) {
        if (!map.has(item?.id)) {
          map.set(item?.id, true); // set any value to Map
          result.push(item);
        }
      }

      paginationProps?.current === 1 && setListOfUsers(result);
      paginationProps?.current !== 1 &&
        setListOfUsers(removeDuplicate ? removeDuplicate : []);
      setSelectedRowKeys(linkedUserIds);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response, searchKey]);

  const shiftAccountToFirst = () => {
    setIfDataPreserved(true);
  };

  const createNewGroupModalBody = () => {
    /* Table Columns */
    const columns = [
      {
        key: "email",
        title: "Email",
        dataIndex: "email"
      },
      {
        key: "firstName",
        title: "First Name",
        dataIndex: "firstName"
      },
      {
        key: "secondName",
        title: "Last Name",
        dataIndex: "lastName"
      }
    ];

    /* On Pagination changes */
    const handlePaginationChange = (current: any, pageSize: any) => {
      current !== 1 && setSelectedRowKeys(selectedRowKeys);
      dispatch(updatePaginationProps({ current, pageSize }));
    };

    const onSelectChange = (selectedRowKeys: any) => {
      setBtnDisabled(false);
      const allLinkUsers = linkedUserIds.concat(selectedRowKeys);

      setSelectedRowKeys(selectedRowKeys);
      paginationProps.current === 1
        ? dispatch(updateSelectedUsers(selectedRowKeys))
        : dispatch(updateSelectedUsers(allLinkUsers));
    };

    const rowSelection = {
      selectedRowKeys,
      onChange: onSelectChange
    };

    /* setting state of query which user typed */
    const handleOnType = ({
      target: { value }
    }: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(updateSearchQuery(value));
      setSearchValue(value);
      if (!value) {
        setSelectedRowKeys(linkedUserIds);
        dispatch(
          updatePaginationProps({
            current: paginationProps.current,
            pageSize: paginationProps.pageSize
          })
        );
      }
    };

    const hasSelected = selectedRowKeys?.length > 0;
    return (
      <>
        <Spin loading={isUsersLoading || isUserFetching}>
          <Searcher
            defaultValue={searchQuery}
            bordered={true}
            style={{ height: "auto" }}
            onChange={handleOnType}
            onClear={() => {}}
          />
          <Spacer size={24} />

          <div>
            <span style={{ marginLeft: 8 }}>
              {hasSelected ? `Selected ${selectedRowKeys?.length} items` : ""}
            </span>
            <Table
              rowSelection={rowSelection}
              rowKey={(record) => record?.id}
              scroll={{ x: true }}
              dataSource={listOfUsers}
              tableColumns={columns}
              pagination={false}
              tableSize="medium"
            />
          </div>
          <Spacer size={24} />
          {!searchKey && (
            <Pagination
              className={Styles["CP-pagination"]}
              {...paginationProps}
              showSizeChanger
              disabled={searchKey ? true : false}
              pageSizeOptions={["10", "25", "50", "100"]}
              total={totalListLength}
              showTotal={(total: number, range: any) =>
                `${range[0]}-${range[1]} of ${total} items`
              }
              onChange={handlePaginationChange}
            />
          )}
        </Spin>
      </>
    );
  };

  return (
    <Modal
      modalView={show}
      modalWidth={870}
      title={title}
      btnLoading={isLoading}
      buttonOkDisabled={isBtnDisabled || btnDisabled}
      onCancelText={onCancelText}
      onOkText={onOkText}
      onClickCancel={() => {
        onClickCancel();
      }}
      onClickOk={() => {
        onClickOk();
      }}
      description={createNewGroupModalBody()}
    />
  );
};

export { AddUser };
