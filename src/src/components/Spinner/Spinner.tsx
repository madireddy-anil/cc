import React from "react";
import { Spin } from "antd";

interface SpinnerProps {
  size?: "small" | "default" | "large" | undefined;
}

export const Spinner: React.FC<SpinnerProps> = ({ size }) => {
  size = size ? size : "small";
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <Spin size={size} />
    </div>
  );
};
