import React from "react";
import { Card, Progress } from "antd";
import { Spin } from "@payconstruct/design-system";
import style from "./FileProgressCard.module.css";

interface FileLoaderProps {
  fileName?: string;
  loading?: boolean;
  percent?: number;
  fileStatus?: "exception" | "active" | "success" | "normal" | undefined;
}

export const FileProgressCard: React.FC<FileLoaderProps> = ({
  fileName = "file loading wait...",
  loading,
  percent = 10,
  fileStatus = "normal"
}) => {
  return (
    <Card
      className={style["custom-progresslog--wrapper"]}
      style={{ borderRadius: "5px", padding: "0px" }}
      bodyStyle={{ padding: "0px" }}
      headStyle={{ padding: "0px" }}
    >
      <div style={{ marginTop: "13px", marginLeft: "12px" }}>
        {" "}
        <Spin loading={loading} /> {fileName}
      </div>
      <div className={style["custom-progressstatus--wrapper"]}>
        {" "}
        <Progress width={1} status={fileStatus} percent={percent} />
      </div>
    </Card>
  );
};
