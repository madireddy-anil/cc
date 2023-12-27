import { financeApiUrl } from "../../../config/variables";
import { Upload as AntUpload } from "antd";
import { UploadChangeParam, RcFile } from "antd/lib/upload/interface";
import { Notification } from "@payconstruct/design-system";

export const handleUploadFiles = async (
  info: UploadChangeParam,
  url: string,
  token: string | null,
  setLoading: (loading: boolean) => void
) => {
  const { file } = info;
  const { status, originFileObj } = file;

  if (status !== "removed" && status !== "uploading") {
    setLoading(true);
    const res = await getPresignedUrl(url, token);

    //! Trusting the response from the server to have filePreSignedData
    await uploadImage(originFileObj, res.filePreSignedData);

    setLoading(false);
  }
};

export const checkFileType = (file: RcFile) => {
  const supportedTypes = ["png", "jpg", "jpeg", "pdf"];
  const { type } = file;
  if (!supportedTypes.includes(type.split("/")[1])) {
    Notification({
      message: "Unsupported file type",
      description: "Please upload a valid file type (png, jpg, jpeg, pdf)",
      type: "error"
    });
    return AntUpload.LIST_IGNORE;
  }
  return true;
};

export const getPresignedUrl = async (url: string, token: string | null) => {
  const requestOptions = {
    method: "GET",
    headers: {
      authorization: `Bearer ${token}`
    }
  };
  try {
    const res = await fetch(
      `${financeApiUrl}/getPreSignedUrl?${url}`,
      requestOptions
    );
    return await res.json();
  } catch (error) {
    console.log(error);
  }
};

export const generatePresignedDownload = async (url: string, token: any) => {
  const requestOptions = {
    method: "GET",
    headers: {
      authorization: `Bearer ${token}`
    }
  };
  try {
    const res: any = await fetch(
      `${financeApiUrl}/getPreSignedURLForDownload?${url}`,
      requestOptions
    );
    const result = await res.json();
    return result?.filePreSignedDownloadData;
    // window.open(result?.filePreSignedDownloadData, "_newtab");
  } catch (error) {
    console.log(error);
  }
};

export const uploadImage = async (file: any, url: string) => {
  const fd = new FormData();
  fd.append("file", file);
  const requestOptions = {
    method: "PUT",
    body: file
  };
  try {
    const res = await fetch(url, requestOptions);
    return await res;
  } catch (error) {
    console.log(error);
  }
};

// @ts-ignore
export const dummyRequest = ({ onSuccess }) => {
  setTimeout(() => {
    onSuccess("ok");
  }, 0);
};
