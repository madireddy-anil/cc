import React from "react";

interface WrapperProps {
  children: any;
}

const Wrapper: React.FC<WrapperProps> = ({ children }) => {
  return (
    <main
      style={{
        padding: "40px 100px 30px",
        margin: 0,
        height: "calc(100vh - 56px)",
        overflowY: "auto"
      }}
    >
      {children}
    </main>
  );
};

export default Wrapper;
