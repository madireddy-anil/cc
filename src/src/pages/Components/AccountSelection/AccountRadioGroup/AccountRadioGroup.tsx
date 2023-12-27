import React, { useEffect, useState } from "react";
import {
  RadioGroup,
  RadioCurrency,
  CurrencyTag,
  Text,
  Tag,
  Icon,
  Tooltip
} from "@payconstruct/design-system";
import { Spacer } from "../../../../components/Spacer/Spacer";
import { isCurrencyPresent } from "../../Helpers/currencyTag";
import { Account } from "../../../../services/accountService";
import { capitalize, fractionFormat } from "../../../../utilities/transformers";
import { Empty } from "antd";
import { ProductGroup } from "../../../../products/Products";
import { useGetCurrencyPairQuery } from "../../../../services/paymentService";
import { Pagination } from "../../../Components/Pagination/Pagination";

import style from "./AccountRadioGroup.module.css";

interface AccountRadioGroupProps {
  accountsData: any;
  defaultValue?: string;
  filterByCurrency?: string;
  filterByMainCurrency?: string;
  filterByAccount?: string;
  filterByProductGroup?: ProductGroup;
  hideUnavailableBalance: boolean;
  onChange: (accountId: string) => void;
  isLoading?: boolean;
  productIds?: any;
  paginationSize?: number;
  selectedAccount?: Account;
  pageFrom?: string;
}
interface BeneAccount {
  buyCurrency: string;
  mainCurrency: string;
  restrictInCc: boolean;
  restrictInCp: boolean;
}

const AccountRadioGroup: React.FC<AccountRadioGroupProps> = ({
  accountsData,
  defaultValue,
  filterByCurrency,
  filterByMainCurrency,
  filterByAccount,
  hideUnavailableBalance,
  filterByProductGroup,
  onChange,
  isLoading = false,
  productIds,
  paginationSize = 10,
  selectedAccount,
  pageFrom
}) => {
  const [filteredAccounts, setFilteredAccounts] = useState([]);

  useEffect(() => {
    setFilteredAccounts(getFilteredAccounts().slice(0, paginationSize));
  }, [accountsData]);

  const hasNoBalance = (account: Account) => {
    if (
      hideUnavailableBalance &&
      Number(account?.balance?.availableBalance) <= 0
    )
      return true;
  };

  const { beneAccountsData = [] } = useGetCurrencyPairQuery(
    {
      currency: selectedAccount?.currency,
      mainCurrency: selectedAccount?.mainCurrency
    },
    {
      refetchOnMountOrArgChange: 5,
      selectFromResult: ({ data, isLoading, isFetching }) => ({
        beneAccountsData: data?.buyCurrencies,
        isLoading,
        isFetching
      }),
      skip:
        pageFrom === "accountSelection" ||
        selectedAccount?.currency === undefined
    }
  );

  const filteredBeneAccounts = accountsData?.filter((account: Account) => {
    return beneAccountsData.some((bAccount: BeneAccount) => {
      if (!bAccount?.restrictInCc) {
        if (bAccount?.mainCurrency) {
          return (
            account?.currency === bAccount?.buyCurrency &&
            account?.mainCurrency === bAccount?.mainCurrency
          );
        }
        return account?.currency === bAccount?.buyCurrency;
      }
      return false;
    });
  });

  const getFilteredAccounts = () => {
    return (
      pageFrom === "beneficiary" ? filteredBeneAccounts : accountsData
    ).filter((accounts: Account) => {
      if (
        accounts.accountType === "client" &&
        filterByProductGroup &&
        !productIds?.includes(accounts.productId)
      ) {
        return false;
      }

      if (
        hideUnavailableBalance &&
        Number(accounts?.balance?.availableBalance) <= 0
      )
        return false;

      if (
        accounts?.accountStatus === "inactive" ||
        accounts?.accountStatus === "closed"
      )
        return false;

      if (filterByCurrency && filterByCurrency !== accounts.currency)
        return false;

      if (
        filterByMainCurrency &&
        filterByMainCurrency !== accounts.mainCurrency
      )
        return false;

      if (filterByAccount && filterByAccount === accounts.id) return false;
      return true;
    });
  };

  const onPaginationChangeHandler = (filtrAccounts: any) => {
    setFilteredAccounts(filtrAccounts);
  };

  const getAccountNumber = (account: any) => {
    if (account.accountIdentification?.accountNumber) {
      return account.accountIdentification.accountNumber;
    } else if (account.accountIdentification?.IBAN) {
      return account.accountIdentification?.IBAN;
    }
    return "Account Number Not Available";
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
  if (!filteredAccounts || filteredAccounts?.length < 1 || isLoading)
    return (
      <div
        style={{ display: "flex", padding: "25px", justifyContent: "center" }}
      >
        <Empty
          description={
            <p>
              No Accounts{" "}
              {filterByCurrency ? (
                <>
                  found for <b>{filterByCurrency}</b>
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
    <>
      <RadioGroup
        direction="horizontal"
        value={defaultValue}
        onChange={(e) => {
          onChange(e.target.value);
        }}
      >
        {filteredAccounts?.map((account: Account) => {
          return (
            <RadioCurrency
              key={account.id}
              disabled={hasNoBalance(account)}
              title={
                <Tooltip
                  text={fractionFormat(account.balance.availableBalance)}
                >
                  {fractionFormat(account.balance.availableBalance)}
                </Tooltip>
              }
              description={
                <>
                  <Text label={account?.accountName ?? "N/A"} weight="bold" />
                  <Spacer size={5}></Spacer>
                  <Tooltip text={getAccountNumber(account)}>
                    <Text label={getAccountNumber(account)} />
                    {filterByProductGroup === "GlobalPayments" && (
                      <div className={style["accountRadioGrp--radioText"]}>
                        <Tag
                          isPrefix
                          label={capitalize(account?.accountType)}
                          prefix={
                            <Icon
                              name={
                                account?.accountType === "client"
                                  ? "user"
                                  : "business"
                              }
                              size="extraSmall"
                            />
                          }
                        />
                      </div>
                    )}
                  </Tooltip>
                </>
              }
              checked={defaultValue === account.id}
              defaultChecked={defaultValue === account.id}
              currencyTag={
                <CurrencyTag
                  currency={currencyWithMainCurrencyName(
                    account?.currency,
                    account?.mainCurrency
                  )}
                  prefix={currencyName(account?.currency)}
                />
              }
              value={account.id}
            />
          );
        })}
      </RadioGroup>
      <Spacer size={40} />
      <Pagination
        list={getFilteredAccounts() ?? []}
        pageSize={paginationSize}
        onChange={(list: any) => {
          onPaginationChangeHandler(list);
        }}
      />
    </>
  );
};

export { AccountRadioGroup };
