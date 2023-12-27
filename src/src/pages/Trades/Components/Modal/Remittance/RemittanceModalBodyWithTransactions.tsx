import React from "react";
import { Colors, Text, Form } from "@payconstruct/design-system";
import { EFXOrder } from "@payconstruct/pp-types";
import { Spacer } from "../../../../../components/Spacer/Spacer";
import { CurrencyBadge } from "../../../../../components/CurrencyBadge/CurrencyBadge";
import styles from "./RemittanceModal.module.css";
import { useGetClientByIdQuery } from "../../../../../services/ControlCenter/endpoints/entitiesEndpoint";

interface RemittanceModalBodyWithTransactionsProps {
  deposits: any[];
  trade: EFXOrder;
  onDelete: (id: string) => void;
}

const RemittanceModalBodyWithTransactions: React.FC<RemittanceModalBodyWithTransactionsProps> =
  ({ deposits, trade, onDelete }) => {
    const { data: clientData } = useGetClientByIdQuery({ id: trade.clientId });
    const clientName =
      clientData?.data?.genericInformation?.registeredCompanyName;

    return (
      <div className={styles["receipt-modal"]}>
        <Form
          initialValues={{
            vendorAmount: ""
          }}
        >
          <Spacer size={10} />
          {deposits.map((deposit: any) => (
            <div>
              <Form
                initialValues={{
                  amount: deposit.deposited,
                  currency: deposit.currency
                }}
              >
                <div className={styles["space-between"]}>
                  <Text
                    label={`${deposit.orderReference} - ${clientName}`}
                    weight="bold"
                    size="small"
                    color={Colors.grey.neutral900}
                  />
                  {/* <div
                    style={{
                      lineHeight: 0,
                      cursor: "pointer"
                    }}
                    onClick={() => onDelete(deposit.PK)}
                  >
                    <Icon name="delete" color="gray" />
                  </div> */}
                </div>
                <div className={styles["deposit-item"]}>
                  {/* <Checkbox
                    label=""
                    onChange={(e) => onCheck(e.target.checked, deposit)}
                  /> */}
                  <div>
                    <div className={styles["align-center"]}>
                      <Text
                        label={deposit.deposited}
                        weight="bold"
                        size="small"
                        color={Colors.grey.neutral900}
                      />
                      <CurrencyBadge currency={deposit.currency} />
                    </div>
                    <div>
                      <Text
                        label={trade.clientName}
                        weight="bold"
                        size="small"
                        color={Colors.grey.neutral400}
                      />
                    </div>
                  </div>
                </div>
                <Spacer size={10} />
              </Form>
            </div>
          ))}
        </Form>
      </div>
    );
  };

export { RemittanceModalBodyWithTransactions };
