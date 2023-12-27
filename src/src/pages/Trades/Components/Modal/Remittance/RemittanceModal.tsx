import { Modal } from "@payconstruct/design-system";
import { EFXOrder } from "@payconstruct/pp-types";
import React, { useEffect, useState } from "react";
import { RemittanceModalMainBody } from "./RemittanceModalMainBody";
import { RemittanceModalTransactions } from "./RemittanceModalTransactions";
import { RemittanceModalBodyWithTransactions } from "./RemittanceModalBodyWithTransactions";
import { OrderDepositDetails } from "../../../../../services/ExoticFX/Finance/financeService";

interface RemittanceModalProps {
  loading: boolean;
  deposit: OrderDepositDetails;
  trade: EFXOrder;
  documents: string[];
  onClickCancel: () => void;
  onClickOk: (data?: any) => void;
  setDocuments: (data?: any) => void;
  setLoading: (checked: boolean) => void;
}

const RemittanceModal: React.FC<RemittanceModalProps> = ({
  deposit,
  trade,
  documents,
  onClickCancel,
  onClickOk,
  setDocuments,
  loading
}) => {
  const [showOtherTxs, setShowOtherTxs] = useState(false);
  const [selectedDeposits, setSelectedDeposits] = useState<
    OrderDepositDetails[]
  >([]);
  const [amount, setAmount] = useState("");
  const [disabled, setDisabled] = useState(true);

  useEffect(() => {
    if (loading === true) return setDisabled(true);

    if (Number(amount) === 0 && showOtherTxs === false)
      return setDisabled(true);

    if (Number(amount) >= 0 && showOtherTxs === false)
      return setDisabled(false);

    if (showOtherTxs && selectedDeposits.length) return setDisabled(false);

    if (showOtherTxs && !selectedDeposits.length) return setDisabled(true);
  }, [amount, loading, showOtherTxs, selectedDeposits.length]);

  const handleCheckDeposit = (checked: boolean, deposit: any) => {
    if (checked) {
      setSelectedDeposits([...selectedDeposits, deposit]);
    } else {
      setSelectedDeposits([
        ...selectedDeposits.filter((item) => item.PK !== deposit.PK)
      ]);
    }
  };

  const handleDeleteDeposit = (id: string) => {
    setSelectedDeposits([...selectedDeposits.filter((item) => item.PK !== id)]);
  };

  const handleCheck = (check: boolean) => {
    setSelectedDeposits([]);
    setShowOtherTxs(check);
  };

  return (
    <Modal
      modalView={true}
      title={showOtherTxs ? "Received Transactions" : "Remittance Confirmation"}
      buttonOkDisabled={disabled}
      onCancelText={showOtherTxs ? "Back" : "Cancel"}
      onOkText={showOtherTxs ? "Proceed" : "Confirm Remittance"}
      onClickCancel={() => {
        if (showOtherTxs) {
          setShowOtherTxs(false);
          setSelectedDeposits([]);
        } else {
          onClickCancel();
        }
      }}
      onClickOk={() => {
        if (showOtherTxs) {
          setShowOtherTxs(false);
        } else {
          onClickOk({ deposits: selectedDeposits, amount });
        }
      }}
      description={
        showOtherTxs ? (
          <RemittanceModalTransactions
            deposit={deposit}
            trade={trade}
            showOtherTxs={showOtherTxs}
            onCheck={handleCheckDeposit}
          />
        ) : (
          <React.Fragment>
            <RemittanceModalMainBody
              deposit={deposit}
              selectedDeposits={selectedDeposits}
              showOtherTxs={showOtherTxs}
              documents={documents}
              onCheck={(checked) => handleCheck(checked)}
              onChangeAmount={(amount) => setAmount(amount)}
              setDocuments={setDocuments}
              loading={loading}
              vendorAmount={Number(amount)}
            />
            {selectedDeposits.length > 0 && (
              <RemittanceModalBodyWithTransactions
                deposits={selectedDeposits}
                trade={trade}
                onDelete={handleDeleteDeposit}
              />
            )}
          </React.Fragment>
        )
      }
    />
  );
};

export { RemittanceModal };
