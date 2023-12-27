import React, { useEffect, useState } from "react";
import { Row, Col, message } from "antd";
import {
  Modal,
  Colors,
  Accordions,
  Button,
  Text,
  Table,
  Spin,
  Image,
  Icon,
  Status,
  Checkbox,
  // Avatar,
  Upload,
  Tooltip
} from "@payconstruct/design-system";
import { Spacer } from "../../../../../../components";
import { FileProgressCard } from "../../../../../../components/FileProgressCard/FileProgressCard";
import { useAppSelector } from "../../../../../../redux/hooks/store";
import {
  GetPreSignedURLReq,
  useGetDocumentFilesByClientIdQuery,
  useGetDocumentQuestionsQuery,
  useGetDocumentCriteriaQuery,
  useGetPresignedURLMutation,
  useDeleteDocumentFileMutation,
  useGetPresignedURLForDownloadMutation,
  useUpdateDocumentStatusMutation
} from "../../../../../../services/clientManagement";
import {
  useAddDocumentFileMutation,
  FileProgressStatusProps
} from "../../../../../../services/documentUploadService";
import { selectCountries } from "../../../../../../config/countries/countriesSlice";
import {
  fileDownloader,
  filePreview,
  formatDocumentForInitialData,
  generateRandomName,
  validationOnData
} from "../../../../../../config/transformer";
import fileIcon from "../../../../../../../src/assets/images/fileIcon.png";
import Styles from "./documents.module.css";

// const commentSection = [
//   {
//     key: 1,
//     avatar: (
//       <Avatar
//         label=""
//         size={24}
//         imgsrc={
//           "https://th.bing.com/th/id/OIP.VoW0K-83DzwOxVQBEW5uYAHaJQ?pid=ImgDet&rs=1"
//         }
//       />
//     ),
//     name: "RajKumar",
//     commentedDate: "7 days ago",
//     commentedText: "This is one of the internal comments text."
//   },
//   {
//     key: 2,
//     avatar: (
//       <Avatar
//         label=""
//         size={24}
//         imgsrc={
//           "https://th.bing.com/th/id/OIP.VoW0K-83DzwOxVQBEW5uYAHaJQ?pid=ImgDet&rs=1"
//         }
//       />
//     ),
//     name: "RameshKumar",
//     commentedDate: "3 days ago",
//     commentedText: "This is one of the internal comments text."
//   }
// ];

interface DocumentsModalBodyProps {
  tableColumns: any[];
}

const DocumentsModalBody: React.FC<DocumentsModalBodyProps> = ({
  tableColumns
}) => {
  const [randomName] = useState(generateRandomName);

  // Initial State Value
  const [progressFile, setProgressFile] = useState<any>({});
  const [isErrorInFile, setErrorInFile] = useState(false);

  const [formState, setFormState] = useState<GetPreSignedURLReq>({
    data: {},
    file: {}
  });

  const [fileProgressStatus, setFileProgressStatus] =
    useState<FileProgressStatusProps>({
      percent: 20,
      status: "normal"
    });

  // Getting the Store Data
  const {
    clients: { id: entityId },
    preSignedURLData
  } = useAppSelector((state) => state.clientManagement);
  const countriesList = useAppSelector(selectCountries);

  const noData = <p>---</p>;

  // Get Document Files By ClientID
  const {
    refetch,
    documentFiles,
    isFetchingUploadedDocs,
    isLoadingUploadedDocs,
    isGetAllDocumentsSuccess,
    isGetAllFileerror
  } = useGetDocumentFilesByClientIdQuery(
    {
      entityId: entityId ?? ""
    },
    {
      selectFromResult: ({
        data,
        isSuccess,
        isFetching,
        isLoading,
        isError
      }) => ({
        documentFiles: formatDocumentForInitialData(
          validationOnData(data?.fileData, "array")
        ),
        isGetAllDocumentsSuccess: isSuccess,
        isFetchingUploadedDocs: isFetching,
        isLoadingUploadedDocs: isLoading,
        isGetAllFileerror: isError
      }),
      refetchOnMountOrArgChange: 5
    }
  );

  // Get All the Document Questions
  const { requiredDocumentsList } = useGetDocumentQuestionsQuery(
    "UploadDocuments",
    {
      selectFromResult: ({ data, isFetching, isLoading }) => ({
        requiredDocumentsList: data?.data,
        isFetching,
        isLoading
      }),
      refetchOnMountOrArgChange: 10
    }
  );

  // Get Document Criteria
  const { documentCriteria } = useGetDocumentCriteriaQuery(
    { randomName },
    {
      refetchOnMountOrArgChange: 2,
      selectFromResult: ({ data }) => ({
        documentCriteria: data?.data?.documentCriteria
      })
    }
  );

  // Get PreSigned URL
  const [getPresignedURL, { isSuccess: preSignedURLSuccess }] =
    useGetPresignedURLMutation();

  // Add Document Files to the Lambda
  const [addDocumentFiles] = useAddDocumentFileMutation();

  // Remove Document Files from the Lambda
  const [removeDocumentFiles] = useDeleteDocumentFileMutation();

  // Download Document Files
  const [getPresignedURLForDownload] = useGetPresignedURLForDownloadMutation();

  // Update Document Status
  const [updateDocumentStatus] = useUpdateDocumentStatusMutation();

  useEffect(() => {
    if (Object.entries(formState.data).length > 0) {
      const formURLState = Object.assign({}, formState.data, {
        entityId: entityId
      });
      getPresignedURL(formURLState).unwrap();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formState.data]);

  useEffect(() => {
    if (preSignedURLSuccess) {
      const preSignData = Object.assign({}, preSignedURLData, {
        filePreSignedData: preSignedURLData?.url
      });
      delete preSignData.url;
      const documentsFileState = Object.assign(formState.file, preSignData);
      setFileProgressStatus({
        percent: 60,
        status: "normal"
      });
      addDocumentFiles(documentsFileState).unwrap().then(refetch); // Refetch after upload
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preSignedURLSuccess]);

  useEffect(() => {
    if (isFetchingUploadedDocs) {
      setFileProgressStatus({
        percent: 80
      });
    }
    if (isGetAllDocumentsSuccess) {
      setProgressFile({});
      setFileProgressStatus({
        percent: 100,
        status: "success"
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFetchingUploadedDocs, isGetAllDocumentsSuccess]);

  const formatLicenseType = (licenseType: any) => {
    if (licenseType) {
      switch (licenseType) {
        case "full":
          return "Full License";
        case "sub_license":
          return "Sub License";
        case "pending":
          return "Pending License";
        case "no_licence":
          return "No License";
        default:
          return "No License";
      }
    }
    return "";
  };

  const formatCountryList = (data: any, countryCode: string) => {
    const countryList = data.find((d: any) => d.alpha2Code === countryCode);
    return countryList?.name;
  };

  const getCardBody = (documentType: any, type: string, item: any) => {
    const handleChange = (info: any, docType: string) => {
      const { file } = info;
      file.documentType = docType;
      setProgressFile(file);
      const isFileExits = documentFiles?.find(
        (files: any) =>
          (file?.friendlyName || file?.name) === files?.friendlyName
      );
      /* 
        Upload document function
      */
      if (
        (file.status !== "error" &&
          file?.status !== "removed" &&
          !isFileExits &&
          file.status === "done") ||
        file.status === undefined
      ) {
        file.documentType = docType;
        setFormState((prev) => ({
          ...prev,
          data: {
            fileName: file?.name,
            uid: file?.uid,
            documentType: docType
          },
          file: file
        }));
        setFileProgressStatus({
          percent: 40,
          status: "normal"
        });
      }
      if (file?.status === "uploading" || file?.status === "error") {
        delete file.response;
      }
      /* 
        Delete document function
      */
      if (file?.status === "removed" && isFileExits) {
        const payload = {
          fileName: isFileExits?.name,
          uid: file?.uid,
          documentType: docType
        };
        setFileProgressStatus({
          percent: 40,
          status: "exception"
        });
        const payloadData = Object.assign({}, payload, { entityId: entityId });
        removeDocumentFiles(payloadData).unwrap().then(refetch);
      }
    };

    /* Download document function */
    const handleDownload = (file: any, documentType: string) => {
      const data = {
        entityId: entityId,
        payload: {
          fileName: file.name,
          documentType: file.documentType,
          isDownload: true
        }
      };

      getPresignedURLForDownload(data)
        .unwrap()
        .then((value) => {
          const { url } = value;
          fileDownloader(url, file?.name, file?.type);
        });
    };

    /* Preview document function */
    const handlePreview = (file: any, documentType: string) => {
      const data = {
        entityId: entityId,
        payload: {
          fileName: file.name,
          documentType: file.documentType,
          isDownload: false
        }
      };

      getPresignedURLForDownload(data)
        .unwrap()
        .then((value) => {
          const { url } = value;
          filePreview(url, file?.name, file?.type);
        });
    };

    return (
      <>
        {type === "card" ? (
          <div className={Styles["upload__wrapper"]}>
            <div className={Styles["custom-upload--wrapper"]}>
              <Tooltip
                text={
                  item?.toolTip +
                  `. And upload file size limits min ${item?.minLimit} and max ${item?.maxLimit}`
                }
              >
                <Upload
                  listSize={"standard"}
                  listType={"text"}
                  // disabled={
                  //   isFetchingUploadedDocs ||
                  //   (documentType?.length > 0 &&
                  //     documentType?.length >= item?.maxLimit)
                  // }
                  // @ts-ignore
                  isDownloadEnabled={true}
                  onChange={(info) => handleChange(info, item?.name)}
                  beforeUpload={(file: any) => {
                    const fileValidation =
                      file.type === "image/png" ||
                      file.type === "image/jpg" ||
                      file.type === "image/jpeg" ||
                      file.type === "application/pdf" ||
                      file.type === "jpg" ||
                      file.type === "jpeg" ||
                      file.type === "png" ||
                      file.type === "pdf" ||
                      file.type === "xls" ||
                      file.type === "xlsx" ||
                      file.type === "application/vnd.ms-excel" ||
                      file.type ===
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                    if (!fileValidation || documentType?.length >= 15) {
                      if (documentType?.length >= 15) {
                        message.error("File limit has exceeded!");
                      } else
                        message.error(
                          "You can only upload JPG,JPEG,PNG,PDF,xls and xlsx file!"
                        );
                      setErrorInFile(true);
                      return true;
                    } else {
                      const isFileExits = (documentFiles || []).filter(
                        (files: any) =>
                          file && file?.name === files?.friendlyName
                      );
                      if (isFileExits?.length > 0) {
                        message.error(
                          "File already exists! Please upload with unique file name"
                        );
                        setErrorInFile(true);
                      } else {
                        setErrorInFile(false);
                      }
                      return isFileExits?.length > 0 ? true : false;
                    }
                  }}
                >
                  <p>
                    Drag-n-drop here or{" "}
                    <b style={{ color: Colors.blue.blue500 }}>Upload</b> file
                    from your PC
                  </p>
                </Upload>
              </Tooltip>
            </div>
            <div className={Styles["custom-uploadList--wrapper"]}>
              {documentType.length > 0 &&
              documentType !== undefined &&
              documentType !== null ? (
                documentType.map((fileD: any, index: number) => {
                  fileD.status = "done";
                  return (
                    <Upload
                      key={fileD?.friendlyName}
                      name={"file"}
                      listSize={"standard"}
                      listType={"text"}
                      disabled={isFetchingUploadedDocs}
                      onChange={(info) => handleChange(info, item?.name)}
                      defaultFileList={[fileD]}
                      // @ts-ignore
                      isDownloadEnabled={true}
                      onDownload={() => handleDownload(fileD, documentType)}
                      onPreview={() => handlePreview(fileD, documentType)}
                    ></Upload>
                  );
                })
              ) : (
                <div
                  style={{ marginTop: "5px", color: "rgba(185, 194, 206, 1)" }}
                >
                  No files uploaded
                </div>
              )}
              {progressFile?.documentType === item?.name &&
                !isGetAllFileerror &&
                !isErrorInFile && (
                  <FileProgressCard
                    loading={true}
                    fileName={progressFile?.name}
                    percent={fileProgressStatus.percent}
                    fileStatus={fileProgressStatus.status}
                  />
                )}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex" }}>
            <span style={{ width: "25px", height: "25px", lineHeight: "25px" }}>
              <Image src={fileIcon} alt="fileIcon" preview={false} />
            </span>
            <span>{documentType}</span>
          </div>
        )}
      </>
    );
  };

  /* Table Columns */
  const columns = [
    {
      key: "licenseType",
      title: "License Type",
      dataIndex: "licenseType",
      render: (licenseType: any) => {
        return formatLicenseType(licenseType) ?? noData;
      }
    },
    {
      key: "regulatedCountry",
      title: "License Location",
      dataIndex: "regulatedCountry",
      render: (regulatedCountry: any) => {
        return formatCountryList(countriesList, regulatedCountry) ?? noData;
      }
    },
    {
      key: "fileName",
      title: "License Copy",
      dataIndex: "fileName",
      render: (fileName: any) => {
        return (fileName && getCardBody(fileName, "table", "")) ?? noData;
      }
    }
  ];

  const getDocumentStatus = (status: any): any => {
    if (status) {
      switch (status) {
        case "pending":
          return {
            status: "pending",
            tooltipText: (
              <div>
                This document is{" "}
                <span style={{ color: "rgba(254, 205, 65, 1)" }}>
                  Pending Approval
                </span>
              </div>
            )
          };
        case "rejected":
          return {
            status: "rejected",
            tooltipText: (
              <div>
                This document is{" "}
                <span style={{ color: "rgba(255, 87, 87, 1)" }}>Rejected</span>
              </div>
            )
          };
        case "incorrect":
          return {
            status: "incorrect",
            tooltipText: "This document is Incorrect"
          };
        case "approved":
          return {
            status: "approved",
            tooltipText: (
              <div>
                This document is{" "}
                <span style={{ color: "rgba(84, 209, 157, 1)" }}>Approved</span>
              </div>
            )
          };
        default:
          return {
            status: "pending",
            tooltipText: (
              <div>
                This document is{" "}
                <span style={{ color: "rgba(254, 205, 65, 1)" }}>
                  Pending Approval
                </span>
              </div>
            )
          };
      }
    }
    return undefined;
  };

  const handleApprove = (documentType: any): any => {
    const updateDetails = { status: "approved" };
    if (
      documentType.length > 0 &&
      documentType !== undefined &&
      documentType !== null
    ) {
      const payload = {
        file: documentType[0]?.name,
        data: updateDetails
      };
      updateDocumentStatus(payload).unwrap().then(refetch);
    }
  };

  const handleReject = (documentType: any): any => {
    const updateDetails = { status: "rejected" };
    if (
      documentType.length > 0 &&
      documentType !== undefined &&
      documentType !== null
    ) {
      const payload = {
        file: documentType[0]?.name,
        data: updateDetails
      };
      updateDocumentStatus(payload).unwrap().then(refetch);
    }
  };

  const getCardHeader = (
    label: any,
    documentStatus: any,
    documentType: any
  ) => {
    return (
      <Row gutter={15} style={{ alignItems: "center" }}>
        <Col span={13}>
          <div style={{ display: "flex" }}>
            <Text weight="bold" size="xsmall" label={label} />
            {documentStatus !== undefined && (
              <Status
                type={documentStatus?.status}
                tooltipText={documentStatus?.tooltipText}
              />
            )}
          </div>
        </Col>
        <Col span={5}>
          <Button
            label="Approve Document"
            onClick={() => handleApprove(documentType)}
            size="medium"
            type="primary"
            icon={{
              name: "checkCircleOutline",
              position: "left"
            }}
            className="approveBtn"
          />
        </Col>
        <Col span={5}>
          <Button
            label="Reject Document"
            onClick={() => handleReject(documentType)}
            size="small"
            type="secondary"
            icon={{
              name: "close",
              position: "left"
            }}
            className="rejectBtn"
          />
        </Col>
        <Col span={1}>
          <span style={{ cursor: "pointer" }}>
            <Icon
              name="more"
              size="small"
              color={Colors.grey.neutral500}
              // onClick={() => handleUpdateWebsiteAddress(d, i)}
            />
          </span>
        </Col>
      </Row>
    );
  };

  const getAccordionsBody = (documentCriteriaData: any): any => {
    return (
      <div className={Styles["documentInfo"]}>
        {documentCriteriaData.length > 0 &&
          (documentCriteriaData || []).map(
            (documentCriteria: any, index: number) =>
              (documentCriteria?.documentCriteria || []).map(
                (option: any, i: number) => {
                  return (
                    <Row gutter={15} key={index}>
                      <Col span={24} key={i}>
                        <Checkbox
                          label={option}
                          defaultChecked={true}
                          // onChange={(e) => onCheck(e.target.checked)}
                          style={{ marginBottom: "15px" }}
                        />
                      </Col>
                    </Row>
                  );
                }
              )
          )}
        <Spacer size={10} />
        {/* <div className={Styles["cardCommentSection"]}>
          {(commentSection || []).map((comment: any, index: number) => (
            <Row gutter={15} key={index}>
              <Col span={1}>{comment?.avatar}</Col>
              <Col span={23}>
                <div>
                  <Text
                    label={`${comment?.name} - `}
                    weight="bold"
                    size="xsmall"
                    color={Colors.grey.neutral700}
                    className={Styles["headerText"]}
                  />
                  <Text
                    label={comment?.commentedDate}
                    size="xsmall"
                    color={Colors.grey.neutral500}
                  />
                  <Spacer size={5} />
                </div>
                <div>{comment?.commentedText}</div>
                <Spacer size={15} />
              </Col>
            </Row>
          ))}
          <Spacer size={25} />
          <Row gutter={15}>
            <Col span={24}>
              <Form.Item name={"comment"} style={{ margin: 0 }}>
                <TextareaInput
                  type={"textarea"}
                  size={"medium"}
                  name={"comment"}
                  label={"Comment"}
                  disabled={false}
                  floatingLabel={true}
                />
              </Form.Item>
            </Col>
          </Row>
          <Spacer size={25} />
        </div> */}
      </div>
    );
  };

  return (
    <div className={Styles["documents-wrapper"]}>
      <Spin
        label="loading wait..."
        loading={isFetchingUploadedDocs || isLoadingUploadedDocs}
      >
        <Table
          rowKey={(record) => record.id}
          dataSource={tableColumns}
          tableColumns={columns}
          pagination={false}
          tableSize="medium"
          rowClassName="trade-row--clickable"
        />
        <Spacer size={25} />
        {(requiredDocumentsList || []).map((item: any, i: number) => {
          const documentType = (documentFiles || []).filter(
            (files: any) =>
              files?.documentType !== undefined &&
              files?.documentType === item?.name
          );
          const documentCriteriaData = (documentCriteria || []).filter(
            (data: any) =>
              data.documentType !== undefined &&
              data?.documentType === item?.name
          );
          const documentStatus = getDocumentStatus(
            documentType?.length > 0 && documentType[0]?.status
          );
          return (
            <div key={i}>
              <div className={Styles["cardWrapper"]}>
                {getCardHeader(item?.label, documentStatus, documentType)}
                {getCardBody(documentType, "card", item)}
              </div>
              <div className={Styles["cardAccordion"]}>
                <Accordions
                  accordionType="simple"
                  header="Document Information"
                  text={getAccordionsBody(documentCriteriaData)}
                />
              </div>
              <Spacer size={15} />
            </div>
          );
        })}
      </Spin>
    </div>
  );
};

interface DocumentsModalProps {
  show: boolean;
  title: any;
  tableColumns: any[];
  onCancelText: string;
  onClickCancel: () => void;
}

const DocumentsModal: React.FC<DocumentsModalProps> = ({
  show,
  title,
  tableColumns,
  onCancelText,
  onClickCancel
}) => {
  return (
    <Modal
      modalView={show}
      modalWidth={930}
      title={title}
      onCancelText={onCancelText}
      onClickCancel={() => {
        onClickCancel();
      }}
      description={<DocumentsModalBody tableColumns={tableColumns} />}
    />
  );
};

export { DocumentsModal };
