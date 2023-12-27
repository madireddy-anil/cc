import { Modal } from "@payconstruct/design-system";
import React from "react";

interface VerifyModalProps {
  show: boolean;
  title: string;
  onCancelText: string;
  onClickCancel: () => void;
  onClickOk: () => void;
  loading: boolean;
}

const VerifyModal: React.FC<VerifyModalProps> = ({
  show,
  title,
  onCancelText,
  onClickCancel,
  onClickOk,
  loading
}) => {
  return (
    <Modal
      modalView={show}
      title={title}
      onCancelText={onCancelText}
      onClickCancel={() => {
        onClickCancel();
      }}
      onOkText={"Send verification email"}
      onClickOk={onClickOk}
      description={
        "This person is not required to be verified as per screening rules based on the risk category assigned to the entity"
      }
      btnLoading={loading}
    />
  );
};

export { VerifyModal };
