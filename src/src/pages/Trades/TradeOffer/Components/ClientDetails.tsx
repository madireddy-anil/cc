import { EFXOrder } from "@payconstruct/pp-types";
import { Card } from "../../Components/Card/Card";
import { Empty } from "antd";
import styles from "../tradeOffer.module.css";

interface ClientDetailsProps {
  trade: EFXOrder;
  userData: any;
}
const ClientDetails: React.FC<ClientDetailsProps> = ({ trade, userData }) => {
  if (!trade) {
    return <Empty />;
  }
  return (
    <Card>
      <p className={styles["trade-offer-card__title"]}>Client Details</p>
      <div className={styles["trade-offer-card__detail"]}>
        <span className={styles["trade-offer-card__detail-text"]}>
          {trade.clientName}
        </span>
      </div>
    </Card>
  );
};

export { ClientDetails };
