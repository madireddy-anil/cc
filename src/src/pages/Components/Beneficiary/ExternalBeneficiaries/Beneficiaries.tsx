import React from "react";
import {
  RadioGroup,
  RadioCurrency,
  CurrencyTag
} from "@payconstruct/design-system";
import { useAppDispatch, useAppSelector } from "../../../../redux/hooks/store";
import {
  BeneficiaryResponse,
  newBeneficiaryDocument
} from "../../../../services/beneficiaryService";
import { selectBeneficiary } from "../BeneficiarySlice";
import { isCurrencyPresent } from "../../Helpers/currencyTag";
import { selectDepositAmount } from "../../DepositAmount/DepositAmountSlice";
import { setBeneficiaryAction } from "../BeneficiarySlice";
import { setToInitialPaymentDetails } from "../../../Payments/PaymentSlice";
import { Empty, Space } from "antd";

interface IExternalBeneficiary {
  filterBeneByCurrency: boolean;
  filterCurrency?: string;
  filterMainCurrency?: string;
  product?: string;
  beneficiaryList: BeneficiaryResponse["response"];
}

const Beneficiaries: React.FC<IExternalBeneficiary> = (props) => {
  const {
    filterBeneByCurrency,
    filterCurrency,
    filterMainCurrency,
    beneficiaryList
  } = props;

  const dispatch = useAppDispatch();

  const {
    form: { sellCurrency }
  } = useAppSelector(selectDepositAmount);
  const { beneficiaryId } = useAppSelector(selectBeneficiary);

  // const filteredBeneficiaries = filterBeneByCurrency
  //   ? beneficiaryList?.filter((beneficiary: any) => {
  //       return (
  //         beneficiary.currency ===
  //         (sellCurrency !== "" ? sellCurrency : filterCurrency)
  //       );
  //     })
  //   : beneficiaryList;

  const getFilteredBeneficiaries = () => {
    if (filterBeneByCurrency) {
      return beneficiaryList?.filter((beneficiary: any) => {
        if (beneficiary.mainCurrency || filterMainCurrency !== "ETH") {
          return (
            beneficiary.currency ===
              (sellCurrency !== "" ? sellCurrency : filterCurrency) &&
            beneficiary.mainCurrency === filterMainCurrency
          );
        }
        return (
          beneficiary.currency ===
          (sellCurrency !== "" ? sellCurrency : filterCurrency)
        );
      });
    } else {
      return beneficiaryList;
    }
  };

  const filteredBeneficiaries = getFilteredBeneficiaries();

  const onChangeBeneficiaryHandler = (beneficiaryId: string) => {
    const [selectedBeneficiary] = filteredBeneficiaries?.filter(
      (item: newBeneficiaryDocument) => item.id === beneficiaryId
    );

    dispatch(setBeneficiaryAction(selectedBeneficiary));
    dispatch(setToInitialPaymentDetails());
  };

  const currencyName = (iconName: string | undefined): any => {
    const currency = iconName && isCurrencyPresent(iconName);
    if (currency) return currency;
    return "error";
  };

  const currencyWithMainCurrencyName = (
    iconName: string | undefined,
    mainCurrency: string | undefined
  ): any => {
    const currency = iconName && isCurrencyPresent(iconName);
    if (currency) {
      if (mainCurrency) {
        return `${currency}(${mainCurrency})`;
      }
      return currency;
    }
    return "error";
  };

  //TODO: Move Out and create a sharable component
  if (filteredBeneficiaries?.length < 1)
    return (
      <div
        style={{ display: "flex", padding: "25px", justifyContent: "center" }}
      >
        <Empty
          description={
            <p>
              No beneficiaries{" "}
              {filterBeneByCurrency ? (
                <>
                  for{" "}
                  <b>
                    {sellCurrency !== "" ? sellCurrency : filterCurrency}{" "}
                    {filterMainCurrency ? `(${filterMainCurrency})` : ""}
                  </b>
                </>
              ) : (
                ""
              )}
            </p>
          }
          image={Empty.PRESENTED_IMAGE_DEFAULT}
        />
      </div>
    );
  return (
    <RadioGroup
      direction="horizontal"
      value={beneficiaryId}
      onChange={(e) => {
        onChangeBeneficiaryHandler(e.target.value);
      }}
    >
      {filteredBeneficiaries?.map(
        (beneficiary: newBeneficiaryDocument, i: number) => {
          const {
            id,
            currency,
            mainCurrency,
            // walletDetails,
            accountDetails,
            beneficiaryDetails
          } = beneficiary;

          const description = (
            <>
              <Space>
                <CurrencyTag
                  currency={currencyWithMainCurrencyName(
                    currency,
                    mainCurrency
                  )}
                  prefix={currencyName(currency)}
                />
              </Space>
              <p style={{ paddingTop: "8px" }}>
                {accountDetails?.accountNumber ?? accountDetails?.iban ?? "N/A"}
              </p>
            </>
          );

          const beneficiaryName = beneficiaryDetails?.name
            ? beneficiaryDetails?.name
            : accountDetails?.nameOnAccount;
          return (
            <RadioCurrency
              key={i}
              title={beneficiaryName ?? "No nameOnAccount"}
              checked={id === beneficiaryId}
              description={description}
              showTooltip
              value={id}
            />
          );
        }
      )}
    </RadioGroup>
  );
};

export { Beneficiaries };
