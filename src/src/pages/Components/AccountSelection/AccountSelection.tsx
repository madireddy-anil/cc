import React, { useEffect } from "react";
import { Button } from "@payconstruct/design-system";
import { Header, HeaderContent } from "../../../components/PageHeader/Header";
import { Spacer } from "../../../components/Spacer/Spacer";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks/store";
import { selectClient } from "../ClientSelection/ClientSelectionSlice";
import {
  useGetAccountByEntityIdQuery,
  useGetAllAccountsQuery
} from "../../../services/accountService";
import { AccountRadioGroup } from "./AccountRadioGroup/AccountRadioGroup";
import {
  selectAccountSelection,
  selectAccountCurrency,
  selectAccountAction,
  setToInitialAccount
} from "./AccountSelectionSlice";
import { useGetExitCurrencyQuery } from "../../../services/routesService";
import { updateFormValue } from "../DepositAmount/DepositAmountSlice";

import { setToInitialPaymentDetails } from "../../Payments/PaymentSlice";
import { Spinner } from "../../../components/Spinner/Spinner";
import { changeSettlementType } from "../Beneficiary/BeneficiarySlice";
import { ProductGroup, ProductGroupMap } from "../../../products/Products";
import { useGetAllProductsQuery } from "../../../services/ControlCenter/endpoints/optionsEndpoint";

interface AccountSelectionProps {
  nextStepHandler?: () => void;
  previousStepHandler?: () => void;
  hideUnavailableBalance?: boolean;
  filterByProductGroup?: ProductGroup;
}

const AccountSelection: React.FC<AccountSelectionProps> = (props) => {
  const {
    nextStepHandler,
    previousStepHandler,
    hideUnavailableBalance = true,
    filterByProductGroup
  } = props;
  const dispatch = useAppDispatch();

  const selectedAccount = useAppSelector(selectAccountSelection);
  const selectCurrency = useAppSelector(selectAccountCurrency);
  const selectedClient = useAppSelector(selectClient);
  const isGlobalAccounts = filterByProductGroup === ProductGroup.GlobalPayments;

  // get products
  const { productIds, isLoadingProducts } = useGetAllProductsQuery("Products", {
    selectFromResult: ({ data, isLoading }) => ({
      productIds: data?.data?.products
        ?.filter((product: any) => {
          if (
            filterByProductGroup &&
            ProductGroupMap[filterByProductGroup].includes(product.productCode)
          ) {
            return true;
          }
          return false;
        })
        ?.map((product: any) => product?.id),

      isLoadingProducts: isLoading
    }),
    skip: !filterByProductGroup,
    refetchOnMountOrArgChange: 5
  });

  // console.log("selectedClient", selectedClient);
  const {
    clientAccountData = [],
    isFetchingClients,
    isLoadingClients
  } = useGetAccountByEntityIdQuery(
    {
      accountType: "client",
      entityId: selectedClient?.id ?? ""
    },
    {
      refetchOnMountOrArgChange: 10,
      selectFromResult: ({ data, isLoading, isFetching }) => ({
        clientAccountData: data?.data.accounts,
        isLoadingClients: isLoading,
        isFetchingClients: isFetching
      }),
      skip: !selectedClient?.id || isGlobalAccounts
    }
  );

  // console.log("clientAccountData", selectedClient?.id);

  const {
    companyAccountData = [],
    isFetchingCompanies,
    isLoadingCompanies
  } = useGetAccountByEntityIdQuery(
    {
      accountType: "company",
      entityId: selectedClient?.id ?? ""
    },
    {
      refetchOnMountOrArgChange: 10,
      selectFromResult: ({ data, isLoading, isFetching }) => ({
        companyAccountData: data?.data.accounts,
        isLoadingCompanies: isLoading,
        isFetchingCompanies: isFetching
      }),
      skip: !selectedClient?.id || isGlobalAccounts
    }
  );

  const {
    allAccountsData = [],
    isFetchingAccounts,
    isLoadingAccounts
  } = useGetAllAccountsQuery(
    { entityId: selectedClient?.id },
    {
      selectFromResult: ({ data, isLoading, isFetching }) => ({
        allAccountsData: data?.data.accounts
          ?.filter((item: any) => item?.accountType !== "vendor_client")
          ?.filter((item: any) => item?.accountType !== "vendor_pl"),
        isLoadingAccounts: isLoading,
        isFetchingAccounts: isFetching
      }),
      refetchOnMountOrArgChange: true,
      skip: !isGlobalAccounts
    }
  );

  useEffect(() => {
    if (selectCurrency) {
      dispatch(
        updateFormValue({
          buyCurrency: selectCurrency
        })
      );
    }
  }, [dispatch, selectCurrency]);

  useGetExitCurrencyQuery(
    {
      currency: selectCurrency ?? ""
    },
    {
      skip: !selectCurrency || isGlobalAccounts,
      refetchOnMountOrArgChange: !isGlobalAccounts
    }
  );

  const onChangeHandler = (accountId: string) => {
    const [account] = [
      ...clientAccountData,
      ...companyAccountData,
      ...allAccountsData
    ].filter((item) => item.id === accountId);
    dispatch(selectAccountAction(account));
    !isGlobalAccounts && dispatch(setToInitialPaymentDetails());
  };

  /* When Uncomponent we reset switch  */
  useEffect(() => {
    return () => {
      dispatch(changeSettlementType("external"));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section>
      <Header>
        <HeaderContent.Title subtitle="Select your account preference">
          Account Selection
        </HeaderContent.Title>
      </Header>
      <>
        {isFetchingCompanies ||
        isLoadingCompanies ||
        isFetchingClients ||
        isLoadingClients ||
        isFetchingAccounts ||
        isLoadingAccounts ||
        isLoadingProducts ? (
          <Spinner />
        ) : (
          <AccountRadioGroup
            defaultValue={selectedAccount?.id}
            hideUnavailableBalance={hideUnavailableBalance}
            onChange={onChangeHandler}
            filterByProductGroup={filterByProductGroup}
            accountsData={[
              ...clientAccountData,
              ...companyAccountData,
              ...allAccountsData
            ]}
            isLoading={
              isFetchingCompanies ||
              isLoadingCompanies ||
              isFetchingClients ||
              isLoadingClients ||
              isLoadingProducts
            }
            productIds={productIds}
            pageFrom="accountSelection"
          />
        )}
        <Spacer size={20} />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Button
            onClick={() => {
              dispatch(setToInitialAccount());
              if (previousStepHandler) previousStepHandler();
            }}
            type="secondary"
            label="Previous"
            icon={{
              name: "leftArrow",
              position: "left"
            }}
          />
          <Spacer size={20} />
          <Button
            disabled={selectedAccount?.id ? false : true}
            onClick={nextStepHandler}
            type="primary"
            label="Continue"
            style={{ marginLeft: "20px" }}
            icon={{
              name: "rightArrow",
              position: "right"
            }}
          />
        </div>
      </>
    </section>
  );
};

export default AccountSelection;
