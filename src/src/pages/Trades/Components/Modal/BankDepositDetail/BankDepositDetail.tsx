import { Modal } from "@payconstruct/design-system";

interface BankDepositDetailProps {
  content: React.ReactNode;
  show: boolean;
  onClickCancel: () => void;
}

const BankDepositDetailModal: React.FC<BankDepositDetailProps> = ({
  content,
  show,
  onClickCancel
}) => {
  return (
    <Modal
      modalView={show}
      title={"Bank Deposit Details"}
      onCancelText={"Cancel"}
      onClickCancel={() => {
        onClickCancel();
      }}
      description={content}
    />
  );
};

export { BankDepositDetailModal };
