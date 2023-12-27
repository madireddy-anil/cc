import React, { useEffect, useState } from "react";
import { Button, Notification } from "@payconstruct/design-system";
import styles from "../tradeOffer.module.css";
import { useNavigate, useParams } from "react-router-dom";
import { useIntl } from "react-intl";
import {
  useAcceptTradeMutation,
  useGetTradeByIDQuery,
  useRejectTradeMutation
} from "../../../../services/tradesService";

interface AcceptOrDeclineOfferProps {
  onAccept?: () => void;
  onDecline?: () => void;
}

const AcceptOrDeclineOffer: React.FC<AcceptOrDeclineOfferProps> = ({
  onAccept,
  onDecline
}) => {
  let { id } = useParams<{ id: string }>();
  const intl = useIntl();
  const navigate = useNavigate();
  const [acceptTrade] = useAcceptTradeMutation();
  const [rejectTrade] = useRejectTradeMutation();
  const [processingAccept, setProcessingAccept] = useState(false);
  const [processingReject, setProcessingReject] = useState(false);
  const [isDisabled, setDisabled] = useState(true);

  const { data: selectedTrade } = useGetTradeByIDQuery(
    { id: id ?? "" },
    {
      refetchOnMountOrArgChange: true
    }
  );

  useEffect(() => {
    if (
      selectedTrade?.status === "deposit_pending_approval" ||
      selectedTrade?.status === "pending_approval_client"
    ) {
      setDisabled(false);
      return;
    }

    setDisabled(true);
  }, [selectedTrade]);

  const handleClickAccept = async () => {
    setProcessingAccept(true);

    try {
      await acceptTrade({ id }).unwrap();
      onAccept?.();
      setProcessingAccept(false);
    } catch (err) {
      Notification({
        message: intl.formatMessage({ id: "acceptTradeError" }),
        description: intl.formatMessage({ id: "acceptTradeErrorDescription" }),
        type: "error"
      });
      setProcessingAccept(false);
    }
  };

  const handleClickReject = async () => {
    setProcessingReject(true);
    try {
      await rejectTrade({ id }).unwrap();
      onDecline?.();
      navigate("/orders");
    } catch (err) {
      Notification({
        message: intl.formatMessage({ id: "rejectTradeError" }),
        description: intl.formatMessage({ id: "rejectTradeErrorDescription" }),
        type: "error"
      });
      setProcessingReject(false);
    }
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "row", marginBottom: "20px" }}
    >
      <Button
        disabled={isDisabled || selectedTrade?.status === "cancelled"}
        loading={processingAccept}
        type="primary"
        label="Accept order on behalf of client"
        style={{ marginRight: "15px" }}
        icon={{ name: "checkCircleOutline" }}
        className={styles["button-icon"]}
        onClick={handleClickAccept}
      />
      <Button
        disabled={isDisabled || selectedTrade?.status === "cancelled"}
        loading={processingReject}
        type="secondary"
        label="Decline Order"
        icon={{ name: "close" }}
        onClick={handleClickReject}
      />
    </div>
  );
};

export { AcceptOrDeclineOffer };
