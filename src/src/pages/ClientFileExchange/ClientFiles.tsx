import { useEffect, useState } from "react";

import {
  Button,
  Table,
  Spin,
  Pagination,
  Icon,
  Colors,
  Tooltip,
  Notification
} from "@payconstruct/design-system";
import {
  Header,
  HeaderContent,
  PageWrapper,
  Spacer,
  TableWrapper
} from "../../components";
import Filter from "./components/Filter";
import {
  useGetClientFilesQuery,
  useDeleteFileMutation,
  useDownloadFileQuery,
  Files,
  ClientFilesFilterReq,
  StatePaginationProps
} from "../../services/clientFileService";
import { useAppDispatch, useAppSelector } from "../../redux/hooks/store";
import {
  selectClientFilesFilterProps,
  updateClientFilesFilterProps
} from "../../config/ClientFiles/ClientFilesSlice";
import { formatDateAndTime } from "../../utilities/transformers";
import { selectTimezone } from "../../config/general/generalSlice";
import { fileDownloader } from "../../config/transformer";
import Styles from "./ClientFiles.module.css";

const ClientFiles = () => {
  const dispatch = useAppDispatch();

  const timeZone: string = useAppSelector(selectTimezone);
  const clientFilesFilterProps = useAppSelector(selectClientFilesFilterProps);

  const [showDrawer, setShowDrawer] = useState<boolean>(false);
  const [isReqLoading, setReqLoading] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<Files | undefined>();
  const [filesState, setFileState] = useState<Files[]>([]);
  const [paginationProps, setPaginationProps] = useState<StatePaginationProps>({
    current: 1,
    pageSize: 10,
    files: []
  });

  const [deleteFile] = useDeleteFileMutation();

  /* Client Files Api Query */
  const {
    refetch: getClientFiles,
    files,
    isLoading,
    isFetching
  } = useGetClientFilesQuery(clientFilesFilterProps, {
    refetchOnMountOrArgChange: true,
    skip: clientFilesFilterProps?.current === 0,
    selectFromResult: ({
      data,
      isLoading,
      isSuccess,
      isError,
      isFetching
    }) => ({
      files: data?.data,
      isLoading,
      isSuccess,
      isError,
      isFetching
    })
  });

  /* Client Files Api Query */
  const { downloadFileResp, errorOnDownloadFile } = useDownloadFileQuery(
    { id: selectedFile?.id },
    {
      refetchOnMountOrArgChange: true,
      skip: !selectedFile?.fileName,
      selectFromResult: ({ data, isError }) => ({
        downloadFileResp: data,
        errorOnDownloadFile: isError
      })
    }
  );

  useEffect(() => {
    dispatch(updateClientFilesFilterProps({ current: 1, pageSize: 10 }));
    // eslint-disable-next-line
  }, []);

  /* Setting data to state, when data fetched successfully...  */
  useEffect(() => {
    if (files) {
      setFileState(files);
      setPaginationProps({ ...paginationProps, files: files.slice(0, 10) });
    }
    // eslint-disable-next-line
  }, [files]);

  /* Listening the download api query to handle download file  */
  useEffect(() => {
    if (downloadFileResp && selectedFile) {
      const fileName = selectedFile?.fileName;
      fileDownloader(downloadFileResp?.url, fileName, "type");
      setSelectedFile(undefined);
    }
    if (errorOnDownloadFile) {
      Notification({
        type: "error",
        message: "There was an error in downloading the file"
      });
    }
    // eslint-disable-next-line
  }, [downloadFileResp, errorOnDownloadFile]);

  const handleDownloadFile = async (file: Files) => {
    setSelectedFile(file);
    Notification({
      type: "success",
      message: "The file has started downloading"
    });
  };

  const handleDeleteFile = async (fileId: string) => {
    setReqLoading(true);
    try {
      await deleteFile({ id: fileId })
        .unwrap()
        .then(() => {
          setReqLoading(false);
          getClientFiles();
          setPaginationProps({ ...paginationProps, current: 1, pageSize: 10 });
          Notification({
            type: "success",
            message: "The file has been deleted"
          });
        });
    } catch (err: any) {
      console.log("Error:", err);
      setReqLoading(false);
      Notification({
        type: "error",
        message: "There was an error in deleting the file"
      });
    }
  };

  /* On Pagination changes */
  // const handlePaginationChange = (current: number, pageSize: number) => {
  //   dispatch(updateClientFilesFilterProps({ current, pageSize }));
  // };

  // handle the pagination within state component
  const onPaginationChangeHandler = (
    pageNumber: number,
    pSize: number | undefined
  ) => {
    const { current, pageSize } = paginationProps;
    const page = pageNumber ?? current;
    const currentPageSize = pSize ?? pageSize;
    const list = filesState?.slice(
      (pageNumber - 1) * currentPageSize,
      page * currentPageSize
    );
    setPaginationProps({
      current: pageNumber,
      pageSize: pSize ? pSize : pageSize,
      files: list
    });
  };

  const handleFilterOnSubmit = (values: ClientFilesFilterReq) => {
    dispatch(
      updateClientFilesFilterProps({ ...values, current: 1, pageSize: 10 })
    );
    setPaginationProps({ ...paginationProps, current: 1, pageSize: 10 });
    setShowDrawer(false);
  };

  const handleOnFilterClose = () => setShowDrawer(false);

  /* Table Columns */
  const columns = [
    {
      title: "Date",
      key: "uploadedAt",
      dataIndex: "uploadedAt",
      render: (data: Files) => formatDateAndTime(data.uploadedAt, timeZone)
    },
    {
      title: "Client",
      key: "clientName",
      dataIndex: "clientName"
    },
    {
      title: "User",
      key: "uploadedBy",
      dataIndex: "uploadedBy"
    },
    {
      title: "File Name",
      key: "friendlyName",
      dataIndex: "friendlyName"
    },
    {
      title: "Actions",
      dataIndex: "id",
      key: "id",
      render: (fileId: string, record: Files) => {
        return (
          <div style={{ display: "flex" }}>
            <Tooltip text={"Download"}>
              <span style={{ cursor: "pointer" }}>
                <Icon
                  color={Colors.grey.neutral500}
                  name="download"
                  size="small"
                  onClick={() => handleDownloadFile(record)}
                />
              </span>
            </Tooltip>
            <Tooltip text={"Delete"}>
              <span style={{ marginLeft: "12px", cursor: "pointer" }}>
                <Icon
                  color={Colors.grey.neutral500}
                  name="delete"
                  size="small"
                  onClick={() => handleDeleteFile(fileId)}
                />
              </span>
            </Tooltip>
          </div>
        );
      }
    }
  ];

  return (
    <>
      <PageWrapper>
        <Header>
          <HeaderContent.LeftSide>
            <HeaderContent.Title>Client Files</HeaderContent.Title>
          </HeaderContent.LeftSide>
          <HeaderContent.RightSide>
            <Button
              label="Filters"
              onClick={() => setShowDrawer(true)}
              size="medium"
              type="tertiary"
              icon={{
                name: "filter",
                position: "left"
              }}
              style={{ marginTop: "-25px" }}
            />
          </HeaderContent.RightSide>
        </Header>
        <div className={Styles["test"]}></div>
        <Filter
          toggleDrawer={showDrawer}
          onClose={handleOnFilterClose}
          onSubmit={handleFilterOnSubmit}
        />

        <Spin loading={isLoading || isFetching || isReqLoading}>
          <TableWrapper>
            <Table
              rowKey={(record) => record?.filePath}
              scroll={{ x: true }}
              dataSource={paginationProps.files}
              tableColumns={columns}
              pagination={false}
              tableSize="medium"
            />
          </TableWrapper>
          <Spacer size={24} />
          <Pagination
            className={Styles["CP-pagination"]}
            {...paginationProps}
            showSizeChanger
            pageSizeOptions={["10", "25", "50", "100"]}
            total={files?.length}
            showTotal={(total: number, range: any) =>
              `${range[0]}-${range[1]} of ${total} items`
            }
            onChange={onPaginationChangeHandler}
          />
        </Spin>
      </PageWrapper>
    </>
  );
};

export default ClientFiles;
