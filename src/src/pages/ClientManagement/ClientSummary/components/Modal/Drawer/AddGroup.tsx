import React, { useEffect, useState } from "react";
import {
  Search as Searcher,
  Modal,
  Pagination,
  Spin,
  Table
} from "@payconstruct/design-system";
import {
  useAppDispatch,
  useAppSelector
} from "../../../../../../redux/hooks/store";
import { useDebounce } from "../../../../../../customHooks/useDebounce";
import {
  useGetGroupsQuery,
  useGetGroupsOnSearchQuery,
  GroupOnSearchRequest
} from "../../../../../../services/clientManagement";
import {
  searchQuery as searchQueryReducer,
  updateSelectedGroup,
  updatePaginationProps,
  updateSearchQuery
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
  loader: boolean;
  linkedGroup: any[];
  onClickCancel: () => void;
  onClickOk: (e?: any, v?: any) => void;
}

const AddGroup: React.FC<CreateNewGroupModalProps> = ({
  show,
  title,
  btnDisabled,
  onCancelText,
  onOkText,
  loader,
  linkedGroup,
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
  const groupId = useAppSelector((state) => state.clientManagement.groupId);

  /* Api call payload */
  const [searchPayload, setSearchPayload] = useState<GroupOnSearchRequest>({
    query: ""
  });

  const [listOfGroups, setListOfGroups] = useState<any[]>([]);
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);
  const [isBtnDisabled, setBtnDisabled] = useState<boolean>(true);

  /* state to preventing the useEffect calling when component remounts */
  const [isDataPreserved, setIfDataPreserved] = useState<boolean>(false);

  const selectedGroupId = linkedGroup?.length ? linkedGroup[0]?.id : "";

  /* Groups Api Query */
  const { allGroups, totalListLength, isLoading, isFetching } =
    useGetGroupsQuery(paginationProps, {
      refetchOnMountOrArgChange: true,
      skip: moduleType !== "linked_groups" || paginationProps.current === 0,
      selectFromResult: ({
        data,
        isLoading,
        isSuccess,
        isError,
        isFetching
      }) => ({
        allGroups: data?.data?.groups,
        totalListLength: data?.data?.total,
        selectedGroup: data?.data?.groups.find(
          (group: any) => group?.id === groupId
        ),
        isLoading,
        isSuccess,
        isError,
        isFetching
      })
    });

  /* Groups Api Query on Search */
  const { groupOnSearchResponse, isGroupSearchLoading } =
    useGetGroupsOnSearchQuery(searchPayload, {
      refetchOnMountOrArgChange: true,
      selectFromResult: ({
        data,
        isLoading,
        isSuccess,
        isError,
        isFetching
      }) => ({
        groupOnSearchResponse: data?.data?.groups,
        totalListLength: data?.data?.total,
        isGroupSearchLoading: isLoading,
        isSuccess,
        isError,
        isFetching
      }),
      skip: searchPayload.query === "" || isDataPreserved
    });

  useEffect(() => {
    selectedGroupId && setSelectedRowKeys([selectedGroupId]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      setListOfGroups(allGroups ?? []);
    }
    if (searchValue) {
      setListOfGroups(groupOnSearchResponse ?? []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allGroups, groupOnSearchResponse, searchValue, isGroupSearchLoading]);

  useEffect(() => {
    if (
      (allGroups && !searchPayload?.query && paginationProps.current === 1) ||
      !searchKey
    ) {
      const removeDuplicate = allGroups?.filter(
        (data: any) => !selectedRowKeys.includes(data?.id)
      );
      const allGroupList = linkedGroup.concat(removeDuplicate);
      const result = [];
      const map = new Map();
      for (const item of allGroupList) {
        if (!map.has(item?.id)) {
          map.set(item?.id, true); // set any value to Map
          result.push(item);
        }
      }
      paginationProps.current === 1 && setListOfGroups(result);
      paginationProps.current !== 1 && setListOfGroups(removeDuplicate);
      selectedGroupId && setSelectedRowKeys([selectedGroupId]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allGroups, searchKey]);

  const shiftAccountToFirst = () => {
    setIfDataPreserved(true);
  };

  const groupsModal = () => {
    /* Table Columns */
    const columns = [
      {
        key: "groupName",
        title: "Group Name",
        dataIndex: "groupName"
      }
    ];

    /* On Pagination changes */
    const handlePaginationChange = (current: any, pageSize: any) => {
      dispatch(updatePaginationProps({ current, pageSize }));
    };

    const onSelectChange = (selectedRowKeys: any) => {
      setSelectedRowKeys(selectedRowKeys);
      setBtnDisabled(false);
      const selectedGroupDetails = (listOfGroups || []).find(
        (group: any) => group.id === selectedRowKeys[0]
      );
      dispatch(updateSelectedGroup(selectedGroupDetails));
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
        selectedGroupId && setSelectedRowKeys([selectedGroupId]);
        dispatch(
          updatePaginationProps({
            current: paginationProps.current,
            pageSize: paginationProps.pageSize
          })
        );
      }
    };
    return (
      <>
        <Spin loading={isLoading || isFetching}>
          <Searcher
            defaultValue={searchQuery}
            bordered={true}
            style={{ height: "auto" }}
            onChange={handleOnType}
            onClear={() => {}}
          />
          <Spacer size={24} />
          <div>
            <Table
              rowSelection={{ type: "radio", ...rowSelection }}
              rowKey={(record) => record?.id}
              scroll={{ x: true }}
              dataSource={listOfGroups}
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
      buttonOkDisabled={isBtnDisabled || btnDisabled}
      onCancelText={onCancelText}
      onOkText={onOkText}
      btnLoading={loader}
      onClickCancel={() => {
        onClickCancel();
      }}
      onClickOk={() => onClickOk()}
      description={groupsModal()}
    />
  );
};

export { AddGroup };
