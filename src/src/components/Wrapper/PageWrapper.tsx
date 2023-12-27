import React from "react";
import { Colors } from "@payconstruct/design-system";

interface PageWrapperProps {
  children: any;
}

/**
 * Component to Wrap pages when menu is on the side
 * @param children
 * @returns
 */
const PageWrapper: React.FC<PageWrapperProps> = ({ children }) => {
  return (
    <main
      style={{
        padding: "40px 100px 30px",
        margin: 0,
        height: "calc(100vh - 56px)",
        overflowY: "auto",
        background: Colors.grey.neutral50
      }}
    >
      {children}
    </main>
  );
};

export default PageWrapper;
