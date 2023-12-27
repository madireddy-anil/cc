import React, { useEffect, useState } from "react";

import { Button } from "@payconstruct/design-system";
import { Spacer } from "../../../../../components/Spacer/Spacer";

import {
  useAppDispatch,
  useAppSelector
} from "../../../../../redux/hooks/store";

import {
  Account,
  useGetAllAccountsQuery
} from "../../../../../services/accountService";
import { Spinner } from "../../../../../components/Spinner/Spinner";

import { selectedPayer } from "../moveBetweenAccountSlice";
import {
  setInternalAccountAction,
  selectInternalAccount
} from "../../../../Components/Beneficiary/BeneficiarySlice";

import { selectAccountSelection } from "../../../../Components/AccountSelection/AccountSelectionSlice";
import { AccountRadioGroup } from "../../../../Components/AccountSelection/AccountRadioGroup/AccountRadioGroup";

interface BeneSearchProps {
  nextStepHandler?: () => void;
  previousStepHandler?: () => void;
}

const BeneSelection: React.FC<BeneSearchProps> = ({
  nextStepHandler,
  previousStepHandler
}) => {
  const dispatch = useAppDispatch();
  const { beneficiaryId } = useAppSelector((state) => state.beneficiary);
  const selectedAccount = useAppSelector(selectAccountSelection);
  const selectedInternalAccount = useAppSelector(selectInternalAccount);
  const selectedBeneficiary = useAppSelector(selectedPayer);
  const [allAccountsList, setAllAccountsList] = useState<any>([]);

  const {
    allAccountsData = [],
    isLoadingAccounts,
    isFetchingAccounts
  } = useGetAllAccountsQuery(
    {
      entityId: selectedBeneficiary?.id ?? ""
    },
    {
      refetchOnMountOrArgChange: 10,
      selectFromResult: ({ data, isLoading, isFetching }) => ({
        allAccountsData: data?.data.accounts,
        isLoadingAccounts: isLoading,
        isFetchingAccounts: isFetching
      }),
      skip: !selectedBeneficiary?.id
    }
  );

  useEffect(() => {
    const filteredAccounts = allAccountsData
      ?.filter((account: Account) => account?.accountType !== "vendor_pl")
      ?.filter((account: Account) => account?.accountType !== "vendor_client");
    setAllAccountsList(filteredAccounts);
  }, [isLoadingAccounts, isFetchingAccounts]);

  // const filteredAccounts = useMemo(() => {
  //   return allAccountsData
  //     ?.filter((account: Account) => account?.accountType !== "vendor_pl")
  //     ?.filter((account: Account) => account?.accountType !== "vendor_client");
  // }, [allAccountsData]);

  const onChangeAccountSelection = (accountId: string) => {
    const [account] = allAccountsList.filter(
      (item: any) => item.id === accountId
    );
    shiftAccountToFirst(allAccountsList, accountId);
    dispatch(setInternalAccountAction(account));
  };

  const shiftAccountToFirst = (allAccounts: any, accountId: string) => {
    const startIndex: number =
      allAccounts?.findIndex((account: Account) => {
        return account?.id === accountId;
      }) ?? -1;
    if (startIndex !== -1 && allAccounts) {
      const shiftedAccount = [
        allAccounts[startIndex],
        ...allAccounts?.slice(0, startIndex),
        ...allAccounts?.slice(startIndex + 1, allAccounts.length)
      ];
      setAllAccountsList(shiftedAccount);
    }
  };

  return (
    <section style={{ paddingTop: "10px" }}>
      {isLoadingAccounts ? (
        <Spinner />
      ) : (
        <AccountRadioGroup
          defaultValue={beneficiaryId}
          filterByAccount={selectedAccount?.id}
          hideUnavailableBalance={false}
          onChange={onChangeAccountSelection}
          accountsData={allAccountsList}
          isLoading={isLoadingAccounts}
          paginationSize={25}
          selectedAccount={selectedAccount}
          pageFrom="beneficiary"
        />
      )}
      <Spacer size={40} />
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Button
          onClick={previousStepHandler}
          type="secondary"
          label="Previous"
          icon={{
            name: "leftArrow",
            position: "left"
          }}
        />
        <Button
          disabled={beneficiaryId ? false : true}
          onClick={nextStepHandler}
          type="primary"
          label="Continue"
          icon={{
            name: "rightArrow",
            position: "right"
          }}
        />
      </div>
    </section>
  );
};

export { BeneSelection as default };
