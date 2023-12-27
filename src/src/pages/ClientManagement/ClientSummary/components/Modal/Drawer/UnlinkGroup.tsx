import React from "react";
import { Modal } from "@payconstruct/design-system";

interface UnlinkGroupModalProps {
  show: boolean;
  title: any;
  description?: any;
  btnDisabled?: boolean;
  onCancelText: string;
  onOkText: string;
  isLoading: boolean;
  onClickCancel: () => void;
  onClickOk: (data?: any) => void;
}

const UnlinkGroupModal: React.FC<UnlinkGroupModalProps> = ({
  show,
  title,
  description,
  btnDisabled,
  onCancelText,
  onOkText,
  isLoading,
  onClickCancel,
  onClickOk
}) => {
  return (
    <Modal
      modalView={show}
      title={title}
      buttonOkDisabled={btnDisabled}
      onCancelText={onCancelText}
      onOkText={onOkText}
      btnLoading={isLoading}
      onClickCancel={() => {
        onClickCancel();
      }}
      onClickOk={() => {
        onClickOk();
      }}
      description={<>Are you sure you want to unlink {description}</>}
    />
  );
};

export { UnlinkGroupModal };
