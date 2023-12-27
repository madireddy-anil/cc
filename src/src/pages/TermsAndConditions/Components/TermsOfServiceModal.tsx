import React, { useState, useEffect } from "react";
import { useIntl } from "react-intl";
import { useAppSelector, useAppDispatch } from "../../../redux/hooks/store";
import {
  Modal,
  Text,
  Colors,
  Upload,
  Form as DSForm,
  Input,
  Spin,
  Notification
} from "@payconstruct/design-system";
import { Spacer } from "../../../components";
import { selectTimezone } from "../../../config/general/generalSlice";
import { formatToZoneDate } from "../../../utilities/transformers";
import { Document, Page, pdfjs } from "react-pdf";
import { message } from "antd";
import { fileDownloader, filePreview } from "../../../config/transformer";
import {
  TermsOfServiceUpdateRequest,
  useUpdateTermsOfServiceMutation
} from "../../../services/termsAndConditions";
import { useAddDocumentFileMutation } from "../../../services/documentUploadService";
import {
  UpdateSelectedVersion,
  updateCurrentFileName,
  //updateTermsBase64,
  updateUploadedFileList,
  updateContentEditable,
  resetToInitialState
} from "../../../config/TermsAndConditions/termsOfServiceDocumentSlice";
import {
  GetPreSignedURLReq,
  useGetPresignedURLMutation,
  useDeleteDocumentFileMutation,
  useGetPresignedURLForDownloadMutation
} from "../../../services/termsOfServiceDocument";
import styles from "../Terms.module.css";

interface ViewModalProps {
  visible: boolean;
}

const TermsOfServiceModal: React.FC<ViewModalProps> = ({ visible }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const timezone = useAppSelector(selectTimezone);
  //const legalAgreement = selectedVersion[0];
  const [formState, setFormState] = useState<TermsOfServiceUpdateRequest>({
    documentId: "",
    data: {
      versionNo: "",
      fileName: ""
    }
  });

  const [form] = DSForm.useForm();
  const [formFileState, setFormFileState] = useState<GetPreSignedURLReq>({
    data: {},
    file: {}
  });
  const [buttonDisabled, setButtonDisabled] = useState(false);

  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
  const [numPages, setNumPages] = useState(null);

  // Using Services
  const [
    getPresignedURL,
    { isLoading: isUploading, isSuccess: preSignedURLSuccess }
  ] = useGetPresignedURLMutation();

  const [addDocumentFiles, { isLoading: isUploadingToS3 }] =
    useAddDocumentFileMutation();

  const [getPresignedURLForDownload, { isLoading: isFetchingUrl }] =
    useGetPresignedURLForDownloadMutation();

  const [removeDocumentFiles, { isLoading: isDeleting }] =
    useDeleteDocumentFileMutation();

  const [updateTermsOfService, { isLoading: isUpdating }] =
    useUpdateTermsOfServiceMutation();

  const {
    selectedVersion: legalAgreement,
    contentEditable,
    preSignedURLData,
    preSignedDownloadURL,
    currentFileName,
    termsBase64,
    uploadedFileList
  } = useAppSelector((state) => state.termsOfServiceDocuments);

  const onDocumentLoadSuccess = ({ numPages }: any) => {
    setNumPages(numPages);
  };

  // Setting Existing File Details as List
  useEffect(() => {
    if (legalAgreement?.fileName && uploadedFileList?.length === 0) {
      setFormState((prev: any) => ({
        documentId: legalAgreement?.id,
        data: {
          versionNo: legalAgreement?.versionNo,
          fileName: legalAgreement?.fileName
        }
      }));
      const existingFile = {
        name: legalAgreement?.fileName,
        type: "pdf",
        status: "done",
        uid: "1"
      };
      setFormFileState((prev: any) => ({
        ...prev,
        data: existingFile
      }));
      dispatch(updateUploadedFileList([existingFile]));
      dispatch(updateCurrentFileName(legalAgreement?.fileName));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [legalAgreement]);

  useEffect(() => {
    if (legalAgreement && visible && termsBase64 === "") {
      const data = {
        fileName: legalAgreement?.fileName
      };
      getPresignedURLForDownload(data)
        .unwrap()
        .then((value) => {
          //const { filePreSignedData } = value;
          //getBase64FromUrl(filePreSignedData)
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, legalAgreement, termsBase64]);

  // const getBase64FromUrl = async (url: any) => {
  //   const data = await fetch(url);
  //   const blob = await data.blob();
  //   return new Promise((resolve, reject) => {
  //     const reader = new FileReader()
  //     reader.readAsDataURL(blob)
  //     reader.onload = () => resolve(reader.result)
  //     reader.onerror = error => reject(error)
  //   }).then((result: any)=>{
  //     dispatch(updateTermsBase64(result));
  //   })
  // };

  // Resetting the form Input Fields
  useEffect(() => {
    if (!visible) {
      form.resetFields();
      dispatch(UpdateSelectedVersion({}));
      setFormState((prev: any) => ({
        documentId: "",
        data: {
          versionNo: "",
          fileName: ""
        }
      }));
      setFormFileState({
        data: {},
        file: {}
      });
      dispatch(resetToInitialState());
    }
  }, [visible, form, dispatch]);

  // Get PresignedURL
  useEffect(() => {
    if (Object.entries(formFileState.data).length > 0 && contentEditable) {
      getPresignedURL(formFileState.data).unwrap();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formFileState]);

  // Uploading file to s3
  useEffect(() => {
    if (preSignedURLSuccess) {
      const { updatedFileName } = preSignedURLData;
      setFormState((prev) => ({
        ...prev,
        data: {
          ...prev.data,
          fileName: updatedFileName
        }
      }));

      dispatch(updateCurrentFileName(updatedFileName));
      const documentsFileState = Object.assign(
        formFileState.file,
        preSignedURLData
      );

      addDocumentFiles(documentsFileState)
        .unwrap()
        .then(() => {
          if (updatedFileName) {
            const currentFile = {
              name: updatedFileName,
              type: formFileState.file?.type,
              status: "done",
              uid: formFileState.file?.uid
            };
            dispatch(updateUploadedFileList([currentFile]));
          }
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preSignedURLSuccess]);

  // Input Values On change
  const onChangeModalInput = (item: any) => {
    const value = item.target.value;
    setFormState((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        versionNo: value
      }
    }));
  };

  // file on change
  const handleChange = (info: any) => {
    console.log("FILE CHANGE ACTION");
    const { file } = info;
    if (
      (file.status !== "error" &&
        file?.status !== "removed" &&
        file.status === "done") ||
      file.status === undefined
    ) {
      setFormFileState((prev) => ({
        data: {
          fileName: file?.name,
          uid: file?.uid
        },
        file: file
      }));
    }

    if (file?.status === "uploading" || file?.status === "error") {
      delete file.response;
    }
    if (file?.status === "removed") {
      const data = {
        fileName: currentFileName,
        documentId: file?.uid
      };
      removeDocumentFiles(data)
        .unwrap()
        .then(() => {
          dispatch(updateUploadedFileList([]));
          setFormFileState({
            data: {},
            file: {}
          });
        });
    }
  };
  const handleRemove = (file: any) => {
    console.log("FILE DELETE ACTION");
  };

  // On file Download
  const handleDownload = (file: any) => {
    fileDownloader(preSignedDownloadURL, currentFileName, file?.type);
    // const data = {
    //   fileName: currentFileName,
    // };
    // getPresignedURLForDownload(data)
    //   .unwrap()
    //   .then((value) => {
    //     const { filePreSignedData } = value;
    //     fileDownloader(filePreSignedData, currentFileName, file?.type);
    //   });
  };

  const handlePreview = (file: any) => {
    filePreview(preSignedDownloadURL, currentFileName, file?.type);
    // const data = {
    //   fileName: currentFileName,
    // };
    // getPresignedURLForDownload(data)
    //   .unwrap()
    //   .then((value) => {
    //     const { filePreSignedData } = value;
    //     filePreview(filePreSignedData, currentFileName, file?.type);
    //   });
  };

  // set OK ButtonDisabled on change
  useEffect(() => {
    //console.log(uploadedFileList)
    if (
      uploadedFileList?.length === 0 ||
      !formState.data?.versionNo ||
      !formState.data?.fileName
    ) {
      setButtonDisabled(true);
    } else {
      setButtonDisabled(false);
    }
  }, [formState, uploadedFileList]);

  const handleEditable = () => {
    if (!contentEditable) {
      dispatch(updateContentEditable(true));
    }
  };

  // Submitting the Form Details
  const handleOnFinish = async () => {
    if (Object.entries(formState).length !== 0) {
      try {
        await updateTermsOfService(formState)
          .unwrap()
          .then(() => {
            form.resetFields();
            dispatch(UpdateSelectedVersion({}));
            dispatch(resetToInitialState());
            setFormState((prev: any) => ({
              documentId: "",
              data: {
                versionNo: "",
                fileName: ""
              }
            }));
            Notification({
              type: "success",
              message: "Success",
              description: "Terms Of Service Updated Successfully"
            });
          });
      } catch (err) {
        Notification({
          message: "Error",
          description: "Error in updating the Terms Of Service",
          type: "error"
        });
      }
    }
  };
  const hideModal = () => {
    if (Object.entries(formFileState.data).length === 0) {
      Notification({
        type: "warning",
        message: "No File",
        description: "Please Upload a copy of Terms Of Service. (PDF only)"
      });
    } else {
      dispatch(resetToInitialState());
      form.resetFields();
      dispatch(UpdateSelectedVersion({}));
      setFormFileState({
        data: {},
        file: {}
      });
      setFormState((prev: any) => ({
        documentId: "",
        data: {
          versionNo: "",
          fileName: ""
        }
      }));
    }
  };

  return (
    <Modal
      title={
        !contentEditable
          ? intl.formatMessage({ id: "versionNo" }) +
            ": " +
            legalAgreement?.versionNo
          : intl.formatMessage({ id: "editTerms" })
      }
      // onOkText={
      //   !contentEditable
      //     ? intl.formatMessage({ id: "edit" })
      //     : intl.formatMessage({ id: "submit" })
      // }
      onCancelText={intl.formatMessage({ id: "cancel" })}
      buttonOkDisabled={contentEditable && buttonDisabled}
      onClickCancel={hideModal}
      onClickOk={!contentEditable ? handleEditable : handleOnFinish}
      modalView={visible}
      modalWidth={750}
      description={
        <div
          style={{
            background: Colors.white.primary,
            boxSizing: "border-box",
            borderRadius: 10
          }}
        >
          {contentEditable ? (
            <>
              <Spin
                label="loading wait..."
                loading={
                  isUploading ||
                  isUploadingToS3 ||
                  isFetchingUrl ||
                  isDeleting ||
                  isUpdating
                }
              >
                <DSForm form={form} initialValues={legalAgreement}>
                  <div key="add-new-terms-of-service">
                    <Input
                      name="versionId"
                      type="text"
                      size="large"
                      label="Version ID"
                      required
                      disabled
                      style={{ width: "100%" }}
                      onChange={onChangeModalInput}
                    />
                    <Input
                      name="versionNo"
                      type="text"
                      size="large"
                      label="Version Number"
                      required
                      style={{ width: "100%" }}
                      onChange={onChangeModalInput}
                    />
                    <div className={styles["custom-upload--wrapper"]}>
                      <Text label="Upload a copy of Edited/Updated Terms Of Service. (PDF only)" />
                      <Spacer size={10} />
                      {/* <Tooltip text="Upload the pdf file with updated content. Can upload only one Pdf file" > */}
                      <Upload
                        name={"file"}
                        listSize={"standard"}
                        listType={"text"}
                        disabled={
                          Object.entries(formFileState.data).length !== 0
                        }
                        isDownloadEnabled={true}
                        onChange={(info) => handleChange(info)}
                        beforeUpload={(file: any) => {
                          const fileValidation =
                            file.type === "application/pdf" ||
                            file.type === "pdf";
                          if (!fileValidation) {
                            message.error("You can only upload PDF file!");
                            return true;
                          } else {
                            return false;
                          }
                        }}
                      >
                        <p>
                          Drag-n-drop here or{" "}
                          <b style={{ color: Colors.blue.blue500 }}>Upload</b>{" "}
                          file from your PC
                        </p>
                      </Upload>
                      {/* </Tooltip> */}
                    </div>
                    <div className={styles["custom-uploadList--wrapper"]}>
                      {uploadedFileList?.length > 0 &&
                        uploadedFileList?.map(
                          (fileD: { [key: string]: string }) => {
                            //fileD.status === "done"
                            return (
                              <Upload
                                key={fileD?.name}
                                name={"file"}
                                listSize={"standard"}
                                listType={"text"}
                                //disabled={isFetchingUploadedDocs}
                                onChange={(info) => handleChange(info)}
                                onRemove={(info) => handleRemove(info)}
                                defaultFileList={[fileD]}
                                isDownloadEnabled
                                onDownload={() => handleDownload(fileD)}
                                onPreview={() => handlePreview(fileD)}
                              ></Upload>
                            );
                          }
                        )}
                    </div>
                  </div>
                </DSForm>
              </Spin>
            </>
          ) : (
            <>
              <Spin label="loading wait..." loading={isFetchingUrl}>
                <div className={styles["list-card"]}>
                  <div className={styles["row"]}>
                    <Text
                      size="xxsmall"
                      label={legalAgreement?.versionId}
                      color={Colors.grey.neutral700}
                    />
                    <Text
                      label={"version ID"}
                      size="xsmall"
                      color={Colors.grey.neutral500}
                    />
                  </div>
                  <div className={styles["row"]}>
                    <Text
                      size="xxsmall"
                      label={legalAgreement?.createdBy}
                      color={Colors.grey.neutral700}
                    />
                    <Text
                      label={"Created By"}
                      size="xsmall"
                      color={Colors.grey.neutral500}
                    />
                  </div>
                  <div className={styles["row"]}>
                    <Text
                      size="xxsmall"
                      label={formatToZoneDate(
                        legalAgreement?.createdAt,
                        timezone
                      )}
                      color={Colors.grey.neutral700}
                    />
                    <Text
                      label={"Created At"}
                      size="xsmall"
                      color={Colors.grey.neutral500}
                    />
                  </div>
                </div>

                {preSignedDownloadURL && (
                  <div
                    style={{
                      height: "50vh",
                      overflowY: "scroll",
                      margin: "15px 0px",
                      borderRadius: "10px",
                      padding: "0 5px"
                    }}
                  >
                    <div className="all-page-container">
                      <Document
                        file={{
                          url: preSignedDownloadURL
                        }}
                        options={{ workerSrc: "/pdf.worker.js" }}
                        onLoadSuccess={onDocumentLoadSuccess}
                      >
                        {Array.from(new Array(numPages), (el, index) => (
                          <Page
                            key={`page_${index + 1}`}
                            pageNumber={index + 1}
                          />
                        ))}
                      </Document>
                    </div>
                  </div>
                )}
              </Spin>
            </>
          )}
        </div>
      }
    />
  );
};

export { TermsOfServiceModal as default };
