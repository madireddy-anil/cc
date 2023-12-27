import React from "react";
import { Colors } from "@payconstruct/design-system";

interface WrapperProps {
  children: any;
}

const Wrapper: React.FC<WrapperProps> = ({ children }) => {
  return (
    <div
      style={{
        background: Colors.white.primary,
        boxSizing: "border-box",
        borderRadius: 10,
        padding: "20px 30px"
      }}
    >
      {children}
    </div>
  );
};

export default Wrapper;
