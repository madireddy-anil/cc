import { CurrencyTag, Text } from "@payconstruct/design-system";
import { EFXOrder } from "@payconstruct/pp-types";
import { Account } from "../../../../services/accountService";
import { Card } from "../../Components/Card/Card";
import { isCurrencyPresent } from "../../Helpers/currencyTag";
import styles from "../tradeOffer.module.css";

interface AccountDetailsProps {
  trade: EFXOrder;
  account?: Account;
}

const AccountDetails: React.FC<AccountDetailsProps> = ({ trade, account }) => {
  return (
    <Card>
      <p className={styles["trade-offer-card__title"]}>Deposit Currency </p>
      <div className={styles["trade-offer-card__detail"]}>
        {/* <span className={styles["trade-offer-card__detail-text"]}>
          @ts-ignore
          {account?.accountIdentification?.accountNumber ?? "N/A"}
        </span> */}
        <CurrencyTag
          currency={trade?.buyCurrency ?? ""}
          prefix={isCurrencyPresent(trade?.buyCurrency)}
        />
      </div>
      <Text
        size="small"
        label={account?.accountName ?? "N/A"}
        weight="lighter"
      />
    </Card>
  );
};

export { AccountDetails };
