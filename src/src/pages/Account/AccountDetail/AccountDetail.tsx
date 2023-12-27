import { FC, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Notification } from "@payconstruct/design-system";
import { Spacer } from "../../../components/Spacer/Spacer";
import { Spinner } from "../../../components/Spinner/Spinner";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks/store";
import {
  selectAccount,
  updateFilterChange
} from "../../../config/account/accountSlice";
import {
  useGetAccountQuery,
  useGetTransactionsQuery,
  useUpdateAccountMutation
} from "../../../services/accountService";

import PageWrapper from "../../../components/Wrapper/PageWrapper";
import TransactionDetail from "./components/TransactionDetail";
import BalanceDetail from "./components/BalanceDetail";

import { fractionFormat } from "../../../utilities/transformers";

// Custom styling
import "./AccountDetail.css";
import { updateMenuShow } from "../../../config/general/generalSlice";
import { getFormattedAddress } from "../../../utilities/transformers";
import AccountsTab from "./components/Tab/AccountsTab";
import { TableWrapper } from "../../../components";

export const AccountDetail: FC = () => {
  const { id: accountId }: any = useParams();
  const dispatch = useAppDispatch();

  const {
    refetch: refetchAccountById,
    isFetching: isFetchingAccount,
    isError,
    isSuccess: isAccountSuccess
  } = useGetAccountQuery({ accountId }, { refetchOnMountOrArgChange: true });
  const { refetch: transactionRefetch, isFetching: isFetchingTransaction } =
    useGetTransactionsQuery({ accountId }, { refetchOnMountOrArgChange: true });

  const account: any = useAppSelector(selectAccount);

  const [accountDetails, setAccountDetails] = useState({});
  const [accountStatus, setAccountStatus] = useState("");
  const [visibleConfirm, setVisibleConfirm] = useState(false);
  const [isTransactionTabSelected, setIsTransactionTabSelected] =
    useState(true);

  // const currencies: any = useAppSelector(
  //   (state) => state.currencies.currencyList
  // );

  // console.log(
  //   "%c Transactions: ",
  //   "background-color: orange; color: white;",
  //   txn
  // );

  const [updateAccount, { isLoading }] = useUpdateAccountMutation();

  const onConfirmAccountStatus = async () => {
    let accountType = account?.accountType ?? "client";
    accountType = accountType.replace("_", "-");
    const payload = {
      accountId,
      accountType,
      payload: {
        accountStatus
      }
    };
    try {
      await updateAccount(payload).unwrap();
      Notification({
        message: "Update Account Status",
        description: "Account status successfully updated.",
        type: "success"
      });
      setVisibleConfirm(false);
    } catch (err) {
      console.log("Update Account Status: ", err);
      Notification({
        message: "Update Account Status",
        description: "Error occured while updating account status.",
        type: "error"
      });
      setVisibleConfirm(false);
    }
  };

  const onCancelAccountStatus = () => {
    setAccountStatus(accountStatus === "active" ? "closed" : "active");
    setVisibleConfirm(false);
  };

  const changeAccountStatus = (status: boolean) => {
    const accountStatus = status ? "active" : "closed";
    setAccountStatus(accountStatus);
    setVisibleConfirm(true);
  };

  const getAccountNumberDetails = () => {
    if (account?.currencyType === "fiat") {
      if (account?.accountIdentification?.accountNumber)
        return {
          label: "Account Number",
          value: account?.accountIdentification.accountNumber
        };
      else if (account?.accountIdentification?.IBAN)
        return {
          label: "IBAN",
          value: account?.accountIdentification?.IBAN
        };
      return {
        label: "Account Number",
        value: "---"
      };
    } else {
      return {
        label: "Vault Address",
        value: account?.accountIdentification.accountNumber
      };
    }
  };

  useEffect(() => {
    if (isTransactionTabSelected) {
      refetchAccountById();
      transactionRefetch();
    }
  }, [isTransactionTabSelected]);

  useEffect(() => {
    setAccountStatus(account?.accountStatus ?? "");
  }, [account?.accountStatus]);

  useEffect(() => {
    dispatch(updateMenuShow(true));
    dispatch(updateFilterChange(false));
  }, [dispatch]);

  useEffect(() => {
    if (!isFetchingAccount && isAccountSuccess) {
      setAccountDetails({
        account: account,
        accountHolder: account?.accountHolderName,
        accountAddress: account?.accountAddress[0]
          ? getFormattedAddress(account?.accountAddress[0])
          : "---",
        issuerAddress: account?.issuerAddress[0]
          ? getFormattedAddress(account?.issuerAddress[0])
          : "---",
        issuerName: account?.issuerName,
        accountName: account?.accountName,
        currencyCode: account?.currency,
        mainCurrency: account?.mainCurrency,
        balance: account?.balance?.balance,
        IBAN: account?.accountIdentification?.IBAN,
        accountNumberDetails: getAccountNumberDetails()
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFetchingAccount, isAccountSuccess]);

  const onTabChangeHandler = (newActiveKey: string) => {
    if (newActiveKey === "1") {
      setIsTransactionTabSelected(true);
    } else setIsTransactionTabSelected(false);
  };

  return (
    <PageWrapper>
      {(account && !account.id) ||
      isFetchingAccount ||
      isFetchingTransaction ? (
        <Spinner />
      ) : (
        <>
          <TransactionDetail
            accountNumber={account?.accountIdentification?.IBAN ?? "N/A"}
            account={account}
            buttonLabel="+ New Transaction"
            handleButtonClick={() => console.log("New Transaction")}
            accountStatus={accountStatus}
            visibleConfirm={visibleConfirm}
            onCancelStatusChange={onCancelAccountStatus}
            onConfirmStatusChange={
              accountStatus === "closed" && onConfirmAccountStatus
            }
            showPopconfirm={changeAccountStatus}
            // handleAccountStatusChange={changeAccountStatus}
            isLoadingStatusChange={isLoading}
          />
          <Spacer size={40} />
          <BalanceDetail
            total={fractionFormat(account?.balance.balance)}
            available={fractionFormat(account?.balance.availableBalance)}
            currency={account?.currency}
            mainCurrency={account?.mainCurrency}
            accountName={account?.accountName}
            issuerEntityCompanyName={account?.issuerName}
          />
          <Spacer size={10} />
          {isError && (
            <div
              style={{ width: "100%", marginTop: "40px", textAlign: "center" }}
            >
              <b>Account not found</b>
            </div>
          )}
          <TableWrapper>
            <AccountsTab
              accountDetails={accountDetails}
              currentAccountDetails={account}
              onTabChange={onTabChangeHandler}
            />
          </TableWrapper>
        </>
      )}
    </PageWrapper>
  );
};
