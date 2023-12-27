import { Modal } from "@payconstruct/design-system";

interface DepositNotesProps {
  content: React.ReactNode;
  show: boolean;
  onClickCancel: () => void;
}

const DepositNotesModal: React.FC<DepositNotesProps> = ({
  content,
  show,
  onClickCancel
}) => {
  return (
    <Modal
      modalView={show}
      title={"Deposit Notes"}
      onCancelText={"Cancel"}
      onClickCancel={() => {
        onClickCancel();
      }}
      description={content}
    />
  );
};

export { DepositNotesModal };
