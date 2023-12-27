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
import { message } from "antd";
import {
  TermsOfServiceRequest,
  useCreateTermsOfServiceMutation
} from "../../../services/termsAndConditions";
import {
  GetPreSignedURLReq,
  useGetPresignedURLMutation,
  useDeleteDocumentFileMutation,
  useGetPresignedURLForDownloadMutation
} from "../../../services/termsOfServiceDocument";
import { useAddDocumentFileMutation } from "../../../services/documentUploadService";
import {
  UpdateShowTermsOfServiceCreateModal,
  updateCurrentFileName,
  updateUploadedFileList,
  resetToInitialState
} from "../../../config/TermsAndConditions/termsOfServiceDocumentSlice";
import styles from "../Terms.module.css";
import { fileDownloader, filePreview } from "../../../config/transformer";

interface CreateModalProps {
  visible: boolean;
}

const NewTermsOfService: React.FC<CreateModalProps> = ({ visible }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const [form] = DSForm.useForm();
  const [formState, setFormState] = useState<TermsOfServiceRequest>({
    versionNo: "",
    fileName: ""
  });
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [formFileState, setFormFileState] = useState<GetPreSignedURLReq>({
    data: {},
    file: {}
  });

  const [
    createTermsOfService,
    { isLoading: isCreating, isSuccess: isCreationSuccess }
  ] = useCreateTermsOfServiceMutation();

  const [
    getPresignedURL,
    { isLoading: isUploading, isSuccess: preSignedURLSuccess }
  ] = useGetPresignedURLMutation();

  const [addDocumentFiles, { isLoading: isUpdatingToS3 }] =
    useAddDocumentFileMutation();

  const [getPresignedURLForDownload, { isLoading: isFetchingUrl }] =
    useGetPresignedURLForDownloadMutation();

  const [removeDocumentFiles, { isLoading: isDeleting }] =
    useDeleteDocumentFileMutation();

  const preSignedURLData = useAppSelector(
    (state) => state.termsOfServiceDocuments?.preSignedURLData
  );
  const uploadedFileList = useAppSelector(
    (state) => state.termsOfServiceDocuments?.uploadedFileList
  );

  const lastUpdatedVersionNo = useAppSelector(
    (state) => state.termsAndConditions?.lastUpdatedVersionRecord?.versionNo
  );

  useEffect(() => {
    if (isCreationSuccess) {
      dispatch(UpdateShowTermsOfServiceCreateModal(false));
      dispatch(resetToInitialState());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCreationSuccess]);

  // Get PresignedURL
  useEffect(() => {
    if (Object.entries(formFileState.data).length > 0) {
      getPresignedURL(formFileState.data).unwrap();
    }
  }, [formFileState, getPresignedURL]);

  // Uploading file to s3
  useEffect(() => {
    if (preSignedURLSuccess) {
      const { updatedFileName } = preSignedURLData;
      const latestVersionNo = lastUpdatedVersionNo
        ? parseFloat(lastUpdatedVersionNo) + 1
        : "1";
      setFormState((prev) => ({
        ...prev,
        fileName: updatedFileName,
        versionNo: latestVersionNo.toString()
      }));

      dispatch(updateCurrentFileName(updatedFileName));
      const documentsFileState = Object.assign(
        formFileState.file,
        preSignedURLData
      );

      addDocumentFiles(documentsFileState)
        .unwrap()
        .then(() => {
          const currentFile = {
            name: updatedFileName,
            type: formFileState.file?.type,
            status: "done",
            uid: formFileState.file?.uid
          };
          dispatch(updateUploadedFileList([currentFile]));
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preSignedURLSuccess]);

  // Resetting the form Input Fields
  useEffect(() => {
    if (!visible) {
      form.resetFields();
      setFormFileState({
        data: {},
        file: {}
      });
      dispatch(resetToInitialState());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, form, dispatch]);

  // Input Values On change
  const onChangeModalInput = (item: any) => {
    const name = item.target.id;
    const value = item.target.value;
    setFormState((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // On file Download
  const handleDownload = (file: any) => {
    const data = {
      fileName: preSignedURLData?.updatedFileName
    };
    getPresignedURLForDownload(data)
      .unwrap()
      .then((value) => {
        const { filePreSignedData } = value;
        fileDownloader(
          filePreSignedData,
          preSignedURLData?.updatedFileName,
          file?.type
        );
      });
  };

  // On file Preview
  const handlePreview = (file: any) => {
    const data = {
      fileName: preSignedURLData?.updatedFileName
    };

    getPresignedURLForDownload(data)
      .unwrap()
      .then((value) => {
        const { filePreSignedData } = value;
        filePreview(
          filePreSignedData,
          preSignedURLData?.updatedFileName,
          file?.type
        );
      });
  };

  useEffect(() => {
    if (uploadedFileList?.length === 0 || !formState.fileName) {
      setButtonDisabled(true);
    } else {
      setButtonDisabled(false);
    }
  }, [formState, uploadedFileList]);

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

    /* FILE DELETE */
    if (file?.status === "removed") {
      const data = {
        fileName: preSignedURLData?.updatedFileName,
        documentId: file?.uid
      };

      removeDocumentFiles(data)
        .unwrap()
        .then(() => {
          setFormFileState({
            data: {},
            file: {}
          });
          dispatch(updateUploadedFileList([]));
        });
    }
  };

  const handleRemove = (file: any) => {
    console.log("FILE DELETE ACTION");
  };

  const onFinish = async () => {
    if (formState.versionNo && formState.fileName) {
      try {
        await createTermsOfService(formState)
          .unwrap()
          .then(() => {
            Notification({
              type: "success",
              message: "Success",
              description: "Terms Of Service Created Successfully"
            });
          });
        setFormFileState({
          data: {},
          file: {}
        });
        setFormState({
          fileName: "",
          versionNo: ""
        });
        dispatch(resetToInitialState());
      } catch (err) {
        Notification({
          message: "Error",
          description: "Error in Creating the Terms Of Service",
          type: "error"
        });
      }
    }
  };

  const hideModal = () => {
    dispatch(resetToInitialState());
  };

  return (
    <Modal
      title={intl.formatMessage({ id: "newVersion" })}
      onOkText={intl.formatMessage({ id: "submit" })}
      onCancelText={intl.formatMessage({ id: "cancel" })}
      buttonOkDisabled={buttonDisabled}
      onClickCancel={hideModal}
      onClickOk={onFinish}
      modalView={visible}
      modalWidth={750}
      description={
        <main>
          <Spin
            label="loading wait..."
            loading={
              isUploading ||
              isUpdatingToS3 ||
              isFetchingUrl ||
              isDeleting ||
              isCreating
            }
          >
            <DSForm
              id="myForm"
              form={form}
              initialValues={{
                versionNo: lastUpdatedVersionNo
                  ? parseFloat(lastUpdatedVersionNo) + 1
                  : 1
              }}
            >
              <div key="add-new-terms-of-service">
                {/* <Input
                  name="versionId"
                  type="text"
                  size="large"
                  label="Version ID"
                  required
                  style={{ width: "100%" }}
                  onChange={onChangeModalInput}
                /> */}
                <Input
                  name="versionNo"
                  type="text"
                  size="large"
                  label="Version Number"
                  required
                  style={{ width: "100%" }}
                  disabled
                  onChange={onChangeModalInput}
                />
                <div className={styles["custom-upload--wrapper"]}>
                  <Text label="Upload a copy of New Terms Of Service. (PDF only)" />
                  <Spacer size={15} />

                  {/* <Tooltip text={`Upload the pdf file with new Version of Terms Of Service`}> */}
                  <Upload
                    name={"file"}
                    listSize={"standard"}
                    listType={"text"}
                    disabled={Object.entries(formFileState.data).length !== 0}
                    isDownloadEnabled={true}
                    onChange={(info) => handleChange(info)}
                    onRemove={(info) => handleRemove(info)}
                    beforeUpload={(file: any) => {
                      const fileValidation =
                        file.type === "application/pdf" || file.type === "pdf";
                      if (
                        !fileValidation ||
                        Object.entries(formFileState.data).length !== 0
                      ) {
                        if (Object.entries(formFileState.data).length !== 0) {
                          message.error(
                            "File limit has exceeded. Can upload only one file"
                          );
                        } else message.error("You can only upload PDF file!");
                        return true;
                      } else {
                        return false;
                      }
                    }}
                  >
                    <p>
                      Drag-n-drop here or{" "}
                      <b style={{ color: Colors.blue.blue500 }}>Upload</b> file
                      from your PC
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
                            disabled={isUpdatingToS3}
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
        </main>
      }
    />
  );
};

export { NewTermsOfService as default };
