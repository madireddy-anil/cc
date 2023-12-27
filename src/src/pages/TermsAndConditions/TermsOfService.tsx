import { useState, useEffect } from "react";
import {
  Icon,
  Table,
  Button,
  Spin,
  Pagination
} from "@payconstruct/design-system";
import { useAppDispatch, useAppSelector } from "../../redux/hooks/store";
import PageWrapper from "../../components/Wrapper/PageWrapper";
import { Spacer } from "../../components/Spacer/Spacer";
import { Header, HeaderContent } from "../../components/PageHeader/Header";
import { TableWrapper } from "../../components/Wrapper/TableWrapper";
import { selectTimezone } from "../../config/general/generalSlice";
import { formatToZoneDate } from "../../utilities/transformers";
import TermsOfServiceModal from "./Components/TermsOfServiceModal";
import NewTermsOfService from "./Components/NewTermsOfService";
import {
  useGetTermsOfServicesQuery
  //useDeleteTermsOfServiceMutation
} from "../../services/termsAndConditions";
import {
  UpdateSelectedVersion,
  UpdateShowTermsOfServiceCreateModal,
  UpdateShowTermsOfServiceViewModal
} from "../../config/TermsAndConditions/termsOfServiceDocumentSlice";
import Styles from "./Terms.module.css";

interface ITermsOfServicePayload {
  current: number;
  pageSize: number;
  count: number;
  versionId?: string;
  versionNo?: string;
}

const TermsOfService = () => {
  const dispatch = useAppDispatch();

  const [termsOfServicePayload, setTermsOfServicePayload] =
    useState<ITermsOfServicePayload>({
      current: 1,
      pageSize: 10,
      count: 0
    });

  const [termsOfServicesList, setTermsOfServicesList] = useState<any[]>([]);

  const termsOfService = useAppSelector(
    (state) => state?.termsAndConditions?.termsOfService
  );
  const timezone = useAppSelector(selectTimezone);
  // const [selectedVersion, setSelectedVersion] = useState({});
  //const [deleteTermsOfService] = useDeleteTermsOfServiceMutation();
  const { showTermsOfServiceCreateModal, showTermsOfServiceViewModal } =
    useAppSelector((state) => state.termsOfServiceDocuments);

  /* Terms Of Services Api Query */
  const {
    response,
    totalListLength,
    refetch: getTermsOfServices,
    isLoading,
    isFetching
  } = useGetTermsOfServicesQuery(termsOfServicePayload, {
    refetchOnMountOrArgChange: true,
    selectFromResult: ({
      data,
      isLoading,
      isSuccess,
      isError,
      isFetching
    }) => ({
      response: data?.data?.termsOfService,
      totalListLength: data?.data?.total,
      isLoading,
      isSuccess,
      isError,
      isFetching
    })
  });
  /* Setting data to state, when data fetched successfully...  */
  useEffect(() => {
    setTermsOfServicesList(response);
  }, [response]);

  useEffect(() => {
    if (!showTermsOfServiceCreateModal && !showTermsOfServiceViewModal) {
      getTermsOfServices();
    }
  }, [
    showTermsOfServiceCreateModal,
    showTermsOfServiceViewModal,
    getTermsOfServices
  ]);

  const columns = [
    { key: "versionId", title: "Version ID", dataIndex: "versionId" },
    {
      key: "versionNo",
      title: "Version No.",
      dataIndex: "versionNo",
      render: (versionNo: any) => {
        return (
          <Button
            label={versionNo}
            type="link"
            onClick={() => {
              const version = termsOfService?.filter(
                (item: any) => item?.versionNo === versionNo
              );
              //setSelectedVersion(version ? version : []);
              dispatch(UpdateSelectedVersion(version ? version[0] : {}));
              dispatch(UpdateShowTermsOfServiceViewModal(true));
            }}
          />
        );
      }
    },
    { key: "fileName", title: "File Name", dataIndex: "fileName" },
    {
      key: "createdAt",
      title: "Created at",
      dataIndex: "createdAt",
      render: (createdAt: any) => {
        return formatToZoneDate(createdAt, timezone);
      }
    },
    { key: "createdBy", title: "Created by", dataIndex: "createdBy" },
    {
      key: "updatedAt",
      title: "Last updated at",
      dataIndex: "updatedAt",
      render: (updatedAt: any) => {
        return formatToZoneDate(updatedAt, timezone);
      }
    },
    { key: "lastUpdatedBy", title: "Last updated by", dataIndex: "updatedBy" },
    {
      title: "Action",
      dataIndex: "id",
      key: "action",
      // render: (id: any) => {
      //   return (
      //     <Icon
      //       name="delete"
      //       onClick={() => {
      //         deleteTermsOfService(id)
      //       }}
      //     />
      //   );
      // }
      render: () => {
        return <Icon name="settings" size="small" />;
      }
    }
  ];

  /* On Pagination changes */
  const handlePaginationChange = (current: any, pageSize: any) => {
    /* 
      Updating the payload for query to get the data
    */
    setTermsOfServicePayload({
      //...appliedClientFilters,
      current,
      pageSize,
      count: termsOfServicePayload.count + 1
    });
    /* 
      Calling the api
    */
    // getTermsOfServices();
  };

  return (
    <PageWrapper>
      <Header>
        <HeaderContent.LeftSide>
          <HeaderContent.Title>Terms of Service</HeaderContent.Title>
          <Button
            label="New Version"
            icon={{
              name: "add",
              position: "left"
            }}
            onClick={() => {
              dispatch(UpdateShowTermsOfServiceCreateModal(true));
              console.log(`New Version`);
            }}
            size="small"
            type="primary"
          />
        </HeaderContent.LeftSide>
        <HeaderContent.RightSide>
          {/* <Button
            label="Filters"
            onClick={() => {
              console.log(`Filters`)
            }}
            size="medium"
            type="tertiary"
            icon={{
              name: "filter",
              position: "left"
            }}
          /> */}
        </HeaderContent.RightSide>
      </Header>
      <TableWrapper>
        <Spin loading={isLoading || isFetching}>
          <Table
            rowKey={(record) => record?.id}
            scroll={{ x: true }}
            dataSource={termsOfServicesList}
            tableColumns={columns}
            tableSize="medium"
            pagination={false}
            rowClassName="trade-row--clickable"
          />
        </Spin>
      </TableWrapper>
      <Spacer size={40} />
      <Pagination
        className={Styles["CP-pagination"]}
        {...termsOfServicePayload}
        showSizeChanger
        pageSizeOptions={["10", "25", "50", "100"]}
        total={totalListLength}
        showTotal={(total: number, range: any) =>
          `${range[0]}-${range[1]} of ${total} items`
        }
        onChange={handlePaginationChange}
      />
      <TermsOfServiceModal
        visible={showTermsOfServiceViewModal}
        //selectedVersion={selectedVersion}
      />
      <NewTermsOfService visible={showTermsOfServiceCreateModal} />
    </PageWrapper>
  );
};
export { TermsOfService as default };
