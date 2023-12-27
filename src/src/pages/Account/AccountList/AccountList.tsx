import "./component/AccountList.css";
import Wrapper from "./component/Wrapper";
import Options from "./component/Options";
import GridView from "./component/GridView";
import ListView from "./component/ListView";
import NewAccountModalForm, {
  initialPageConfig
} from "./component/NewAccountModalForm/index";
import { Spacer } from "../../../components/Spacer/Spacer";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks/store";
import { Account, useGetAccountsQuery } from "../../../services/accountService";
import {
  selectAccountsListView,
  updateAccountsListView,
  showFilterAction,
  selectShowFilters,
  updatePaginationProperty,
  selectAppliedFilter,
  updateFilterProperty,
  updateCurrencyType,
  updateVendorChange,
  updateFilterChange,
  selectFilterChange,
  selectAppliedPagination,
  updateChildPageView,
  selectChildPageView
} from "../../../config/account/accountSlice";
import { useCallback, useState } from "react";
import { useEffect } from "react";
import { updateMenuShow } from "../../../config/general/generalSlice";
import { FormPageType } from "./component/accountListTypes";
import { Spinner } from "../../../components/Spinner/Spinner";
import FiltersDrawer from "./component/FiltersDrawer";
import { useGetVendorsQuery } from "../../../services/ControlCenter/endpoints/entitiesEndpoint";
// import { useMatch } from "react-router-dom";

export const AccountList = () => {
  const dispatch = useAppDispatch();
  const optionView = useAppSelector(selectAccountsListView);
  const isShowingFilters = useAppSelector(selectShowFilters);
  // const appliedPaginationProperty = useAppSelector(
  //   (state) => state.account.appliedPaginationProperty
  // );
  const appliedPaginationProperty: any = useAppSelector(
    selectAppliedPagination
  );

  const appliedFilterProperty: any = useAppSelector(selectAppliedFilter);
  const filterChange: any = useAppSelector(selectFilterChange);

  const [pageProperty, setPageProperty] = useState(appliedPaginationProperty);
  const [modalVisibility, setModalVisibility] = useState(false);
  const [modalPageConfig, setModalPageConfig] = useState(initialPageConfig);
  const [modalButtonSettings, setModalButtonSettings] = useState({});
  const [modalFormData, setModalFormData] = useState({});
  const [accountParams, setAcctParams] = useState({});
  const [cTime, setCTime] = useState<string>();
  // const [childPageView, setChildPageView] = useState(false);
  const childPageView: any = useAppSelector(selectChildPageView);

  // const match = useMatch("/*");
  const {
    accountsData = [],
    isLoading,
    accountsTotal,
    isFetching,
    refetch
  } = useGetAccountsQuery(
    {
      pageNumber: pageProperty.pageNumber,
      pageSize: pageProperty.pageSize,
      accountParams
    },
    {
      refetchOnMountOrArgChange: 10,
      selectFromResult: ({
        data,
        isLoading,
        isFetching,
        isError,
        isSuccess
      }) => {
        return {
          accountsData: data?.data?.accounts as Account[],
          accountsTotal: data?.data?.total,
          isLoading,
          isFetching,
          isError,
          isSuccess
        };
      }
    }
  );

  const { vendorsList, isVendorEntityLoading } = useGetVendorsQuery(
    `GET_VENDORS_LIST_${cTime}`,
    {
      skip: !cTime,
      selectFromResult: ({ data, isLoading }) => {
        return {
          vendorsList: data?.entities || [],
          isVendorEntityLoading: isLoading
        };
      }
    }
  );

  /* Refetching the accounts when user creates new account and close the modal */
  useEffect(() => {
    if (!modalVisibility) {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalVisibility]);

  useEffect(() => {
    if (filterChange) {
      dispatch(
        updatePaginationProperty({
          pageNumber: 1,
          pageSize: pageProperty.pageSize
        })
      );
    }
  }, [filterChange]);

  useEffect(() => {
    setPageProperty(appliedPaginationProperty);
  }, [appliedPaginationProperty]);

  const setPageCallback = useCallback(
    (pageNumber: number, pageSize: number) => {
      /* updating the pagination property on reducer */
      dispatch(
        updatePaginationProperty({ ...pageProperty, pageNumber, pageSize })
      );
      setPageProperty((state: any) => ({ ...state, pageNumber, pageSize }));
      dispatch(updateFilterChange(false));
    },
    [dispatch, pageProperty]
  );

  useEffect(() => {
    dispatch(updateMenuShow(true));
    dispatch(updateFilterChange(false));
  }, [dispatch]);

  const selectAccountViewType = (accountViewType: string) => {
    dispatch(updateAccountsListView(accountViewType));
  };

  const openModalPage = (pageType: FormPageType) => {
    setModalVisibility(true);
    setModalPageConfig({ ...modalPageConfig, page: "page-1", type: pageType });
    setModalButtonSettings({
      onOkayText: "Proceed to Account Details",
      onCancelText: "Cancel",
      onClickCancel: () => setModalVisibility(false)
    });
    dispatch(updateCurrencyType(false));
    dispatch(updateVendorChange(false));
  };

  const handleShowFilters = () => {
    dispatch(showFilterAction(true));
  };

  const handleCloseFilters = () => {
    dispatch(showFilterAction(false));
  };

  const handleSeeFilterResults = (filters: any) => {
    setAcctParams(filters);
  };

  const handleClearFilters = () => {
    setAcctParams({});
    dispatch(updateFilterProperty({}));
  };

  /* 
   Whenever Component Mounts, we update the applied pagination property.
  */
  useEffect(() => {
    dispatch(updatePaginationProperty(appliedPaginationProperty));
    if (Object.entries(appliedFilterProperty).length !== 0) {
      setAcctParams(appliedFilterProperty);
    }

    setCTime(new Date().toLocaleTimeString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Component Unmount */
  useEffect(() => {
    if (!childPageView) {
      dispatch(
        updatePaginationProperty({
          pageNumber: 1,
          pageSize: pageProperty.pageSize
        })
      );
      // dispatch(updateFilterProperty({}));
    }
    // return () => {
    //   // if (match?.pathname.split("/")[1] !== "accounts")
    //   {
    //     dispatch(
    //       updatePaginationProperty({
    //         pageNumber: 1,
    //         pageSize: 10
    //       })
    //     );
    //     // dispatch(updateFilterProperty({}));
    //   }
    // };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childPageView]);

  return (
    <Wrapper>
      <Options
        selected={optionView}
        clickEvent={selectAccountViewType}
        openModalPage={openModalPage}
        showFilters={handleShowFilters}
      />
      <Spacer size={40} />
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          {optionView === "list" ? (
            <ListView
              accountsData={accountsData}
              handleChangePage={setPageCallback}
              accountsTotal={accountsTotal}
              vendorsList={vendorsList}
              isFetching={isFetching}
              // setChildPage={() => {
              //   // setChildPageView(true)
              // }}
            />
          ) : (
            <GridView
              accountsData={accountsData}
              handleChangePage={setPageCallback}
              accountsTotal={accountsTotal}
              // setChildPage={(value: any) => setChildPageView(value)}
            />
          )}
        </>
      )}
      <Spacer size={40} />
      {modalVisibility && (
        <NewAccountModalForm
          modalVisibility={modalVisibility}
          setModalVisibility={setModalVisibility}
          setModalPageConfig={setModalPageConfig}
          setModalButtonSettings={setModalButtonSettings}
          modalButtonSettings={modalButtonSettings}
          modalPageConfig={modalPageConfig}
          setModalFormData={setModalFormData}
          modalFormData={modalFormData}
        />
      )}
      <FiltersDrawer
        isVendorEntityLoading={isVendorEntityLoading}
        vendorsList={vendorsList}
        showFilters={isShowingFilters}
        onClose={handleCloseFilters}
        seeResults={handleSeeFilterResults}
        clearFilters={handleClearFilters}
      />
    </Wrapper>
  );
};

export { AccountList as default };
