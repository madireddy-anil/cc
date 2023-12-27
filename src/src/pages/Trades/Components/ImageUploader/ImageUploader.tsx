import {
  Upload,
  Notification,
  Spin,
  Colors
} from "@payconstruct/design-system";
import { useAuth } from "../../../../redux/hooks/useAuth";
import {
  dummyRequest,
  handleUploadFiles,
  checkFileType
} from "../../Helpers/imageUploader";
import { UploadChangeParam } from "antd/lib/upload/interface";
import { DeleteOutlined } from "@ant-design/icons";
import { useState } from "react";
import { parse, stringify } from "query-string";

interface ImageUploaderProps {
  url: string;
  documents: string[];
  onUploadFinish?: (documents: string[]) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  documents,
  url,
  onUploadFinish
}) => {
  const { auth } = useAuth();
  const fileCount = documents.length;
  const maxUploadSize = 10 - fileCount;
  const [loading, setLoading] = useState(false);

  //* Add format for uploaded files missing other params
  const ImageDocs = documents.map((doc) => {
    return { name: doc };
  });

  const UploadOnChange = (info: UploadChangeParam) => {
    const {
      fileList,
      file: { name }
    } = info;

    const newUrl = {
      ...parse(url),
      fileName: name
    };

    const isFileIncluded = fileList.filter((file) => file.name === name);
    const isFileRemoved = isFileIncluded.length === 0;
    const getFileListSize = fileList.length;

    handleUploadFiles(info, stringify(newUrl), auth.token, setLoading)
      .then(() => {
        onUploadFinish?.(fileList.map((file) => file.name));
      })
      .catch((err) => {
        console.log("Error Occurred", err);
      });
  };

  return (
    <div style={{ display: "inline-block", width: "100%" }}>
      <Upload
        accept="png, jpg, jpeg, pdf"
        action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
        beforeUpload={checkFileType}
        defaultFileList={[...ImageDocs]}
        listSize="standard"
        listType="text"
        multiple={true}
        // @ts-ignore
        customRequest={dummyRequest}
        onChange={UploadOnChange}
        showUploadList={{
          removeIcon: loading ? <Spin /> : <DeleteOutlined />,
          showRemoveIcon: true
        }}
      >
        <p>
          Drag-n-drop here or{" "}
          <b style={{ color: Colors.blue.blue500 }}>Upload</b> file from your PC
        </p>
        {loading && <Spin />}
      </Upload>
    </div>
  );
};

export { ImageUploader };
