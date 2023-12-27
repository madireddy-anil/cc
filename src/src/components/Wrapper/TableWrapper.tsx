import React from "react";
import { Colors } from "@payconstruct/design-system";

interface WrapperProps {
  children: any;
}

export const TableWrapper: React.FC<WrapperProps> = ({ children }) => {
  return (
    <div
      style={{
        background: Colors.white.primary,
        border: `1px solid ${Colors.grey.outline}`,
        boxSizing: "border-box",
        borderRadius: 10,
        padding: 25
      }}
    >
      {children}
    </div>
  );
};
