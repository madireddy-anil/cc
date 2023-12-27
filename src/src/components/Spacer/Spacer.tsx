import React from "react";

interface SpacerProps {
  size?: number;
}

export const Spacer: React.FC<SpacerProps> = ({ size }) => {
  return <div style={{ height: size }} />;
};
