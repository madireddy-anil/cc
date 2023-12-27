import { Text } from "@payconstruct/design-system";
import { EFXOrder } from "@payconstruct/pp-types";
import { useGetAccountQuery } from "../../../../services/accountService";
import { useGetBeneficiaryIdQuery } from "../../../../services/beneficiaryService";
import { Card } from "../../Components/Card/Card";
import { useAppSelector } from "../../../../redux/hooks/store";
import { selectCompanies } from "../../../../config/general/generalSlice";
import styles from "../tradeOffer.module.css";
import { Spinner } from "../../../../components";

interface BeneficiaryDetailsProps {
  trade: EFXOrder;
}

const BeneficiaryDetails: React.FC<BeneficiaryDetailsProps> = ({ trade }) => {
  const companies = useAppSelector(selectCompanies);

  const { isLoading, beneficiaryData } = useGetBeneficiaryIdQuery(
    { id: trade?.beneficiaryId ?? "" },
    {
      skip: trade?.beneficiaryId === undefined,
      refetchOnMountOrArgChange: true,
      selectFromResult: ({ data, isLoading }) => ({
        beneficiaryData: data?.beneficiary,
        isLoading
      })
    }
  );

  const { data: internalAccountData } = useGetAccountQuery(
    {
      accountId: trade.sellAccountId ?? ""
    },
    {
      refetchOnMountOrArgChange: true,
      skip: trade?.sellAccountId === undefined
    }
  );

  // Get IssuerEntity
  const getIssuer = companies?.find(
    (record: any) => record?.id === internalAccountData?.data?.issuerEntityId
  );

  const companyName = getIssuer?.genericInformation?.registeredCompanyName;

  //TODO: Refactor this.
  const accountNumber = beneficiaryData
    ? beneficiaryData?.accountDetails?.accountNumber
    : internalAccountData?.data.accountIdentification?.accountNumber;

  const accountName = beneficiaryData
    ? beneficiaryData?.accountDetails?.nameOnAccount
    : internalAccountData?.data?.accountName;

  const accountDetail = `${accountNumber && accountName ? accountNumber : ""}`;

  const bankName = beneficiaryData
    ? beneficiaryData?.accountDetails?.bankName
    : companyName;

  const bankAddress = beneficiaryData
    ? beneficiaryData?.beneficiaryDetails?.address
    : undefined;
  // @ts-ignore

  return (
    <Card style={{ height: "100%" }}>
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <p className={styles["trade-offer-card__title"]}>
            Beneficiary Details
          </p>
          <div className={styles["trade-offer-card__detail"]}>
            <span className={styles["trade-offer-card__detail-text"]}>
              {accountName}
            </span>
          </div>
          <div className={styles["trade-offer-card__detail"]}>
            <Text
              size="small"
              label={`${accountDetail.length > 1 ? accountNumber : "N/A"}`}
              weight="lighter"
            />
          </div>
          <ul className={styles["trade-offer-card__list"]}>
            {bankName && (
              <li className={styles["trade-offer-card__list-item"]}>
                <p className={styles["trade-offer-card__list-item-title"]}>
                  Account Provider
                </p>
                <p
                  className={styles["trade-offer-card__list-item-description"]}
                >
                  {bankName}
                </p>
              </li>
            )}
            {Boolean(bankAddress && bankAddress.country) && (
              <li className={styles["trade-offer-card__list-item"]}>
                <p className={styles["trade-offer-card__list-item-title"]}>
                  Address
                </p>
                <p
                  className={styles["trade-offer-card__list-item-description"]}
                >
                  {bankAddress?.buildingNumber} {bankAddress?.street}{" "}
                  {bankAddress?.stateOrProvince} {bankAddress?.zipOrPostalCode}{" "}
                  {bankAddress?.country}
                </p>
              </li>
            )}
          </ul>
        </>
      )}
    </Card>
  );
};

export { BeneficiaryDetails };
