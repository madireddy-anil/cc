import {
  Button,
  SwitchName,
  Colors,
  Notification,
  Spin
} from "@payconstruct/design-system";
import { Row, Col } from "antd";
import React, { useEffect, useState } from "react";
import {
  Header,
  HeaderContent
} from "../../../../components/PageHeader/Header";
import { Spacer } from "../../../../components/Spacer/Spacer";
import {
  BeneficiaryResponse,
  useGetBeneficiaryByClientIdQuery
} from "../../../../services/beneficiaryService";
import { useAppDispatch, useAppSelector } from "../../../../redux/hooks/store";
import {
  showModalAction,
  showFormModalAction,
  setSubmitting,
  changeSettlementType,
  setInternalAccountAction,
  selectNewBeneficiary,
  setToInitialBeneficiary
} from "../../../Components/Beneficiary/BeneficiarySlice";
import { Beneficiaries } from "../../../Components/Beneficiary/ExternalBeneficiaries/Beneficiaries";
import { AccountRadioGroup } from "../../../Components/AccountSelection/AccountRadioGroup/AccountRadioGroup";
import { selectDepositAmount } from "../../../Components/DepositAmount/DepositAmountSlice";
import NewBeneficiaryForm from "../../../../components/Modals/NewBeneficiary";
import { setLoading } from "../../../../config/general/generalSlice";
import { useCreateBeneficiaryMutation } from "../../../../services/beneficiaryService";
import { setBeneficiaryAction } from "../../../Components/Beneficiary/BeneficiarySlice";
import { useGetAccountByEntityIdQuery } from "../../../../services/accountService";
import { selectClient } from "../../../Components/ClientSelection/ClientSelectionSlice";
import { ProductGroup, ProductGroupMap } from "../../../../products/Products";
import { useGetAllProductsQuery } from "../../../../services/ControlCenter/endpoints/optionsEndpoint";

//TODO Rename this File to Recipient. (Internal Account / Beneficiary) are distinct.
interface BeneficiaryProps {
  ConfirmModal?: React.FunctionComponent<any>;
  confirmBtnLabel?: string;
  nextStepHandler?: () => void;
  previousStepHandler: () => void;
  filterByProductGroup?: ProductGroup;
}

const Beneficiary: React.FC<BeneficiaryProps> = (props) => {
  const {
    ConfirmModal,
    confirmBtnLabel,
    nextStepHandler,
    previousStepHandler,
    filterByProductGroup
  } = props;
  const dispatch = useAppDispatch();
  const {
    showModal,
    showFormModal,
    submittingBeneficiary,
    settlementType,
    beneficiaryId
  } = useAppSelector((state) => state.beneficiary);
  const selectedClient = useAppSelector(selectClient);

  const {
    form: { sellCurrency, mainSellCurrency }
  } = useAppSelector(selectDepositAmount);

  const { clientAccountData = [] } = useGetAccountByEntityIdQuery(
    {
      accountType: "client",
      entityId: selectedClient?.id ?? ""
    },
    {
      refetchOnMountOrArgChange: 10,
      selectFromResult: ({ data, isLoading, isFetching }) => ({
        clientAccountData: data?.data.accounts,
        isLoadingClient: isLoading,
        isFetchingClient: isFetching
      }),
      skip: !selectedClient?.id
    }
  );

  const { companyAccountData = [] } = useGetAccountByEntityIdQuery(
    {
      accountType: "company",
      entityId: selectedClient?.id ?? ""
    },
    {
      refetchOnMountOrArgChange: 10,
      selectFromResult: ({ data, isLoading, isFetching }) => ({
        companyAccountData: data?.data.accounts,
        isLoadingCompany: isLoading,
        isFetchingCompany: isFetching
      }),
      skip: !selectedClient?.id
    }
  );

  const { productIds } = useGetAllProductsQuery("Products", {
    selectFromResult: ({ data, isLoading }) => ({
      productIds: data?.data?.products
        ?.filter((product: any) => {
          if (
            ProductGroup.GlobalPayments &&
            ProductGroupMap[ProductGroup.GlobalPayments].includes(
              product.productCode
            )
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

  const [newBeneficiary, { isLoading }] = useCreateBeneficiaryMutation();
  const [counter, setCounter] = useState<number>(0);

  const entityId: string = selectedClient ? selectedClient.id : "";
  const {
    refetch,
    isLoading: isLoadingBeneficiariesList,
    data: beneficiaryList,
    isFetching
  } = useGetBeneficiaryByClientIdQuery({ entityId });

  useEffect(() => {
    refetch();
  }, [refetch]);

  type settlementTypeOptionsType = {
    label: string;
    value: typeof settlementType;
  }[];

  const settlementTypeOptions: settlementTypeOptionsType = [
    { label: "Pay Perform Accounts", value: "internal" },
    { label: "External Beneficiaries", value: "external" }
  ];

  const onChangeSettlementType = (result: any) => {
    dispatch(changeSettlementType(result.settlementType));
  };

  const onChangeAccountSelection = (accountId: string) => {
    const [account] = [...clientAccountData, ...companyAccountData].filter(
      (item: any) => item.id === accountId
    );
    dispatch(setInternalAccountAction(account));
  };

  useEffect(() => {
    if (isLoading) {
      dispatch(setLoading(true));
    } else {
      dispatch(setLoading(false));
    }
  }, [dispatch, isLoading]);

  const beneficiary = useAppSelector(selectNewBeneficiary);

  useEffect(() => {
    if (counter > 0) {
      dispatch(setBeneficiaryAction(beneficiary));
    }
  }, [dispatch, counter, beneficiary]);

  const submitNewBeneficiary = async (formData: any) => {
    const {
      requestedAccountType,
      currency,
      mainCurrency,
      nameOnAccount,
      bic,
      branchCode,
      iban,
      accountNumber,
      country,
      buildingNumber,
      zipOrPostalCode,
      stateOrProvince,
      city,
      street
    } = formData;
    const newBeneficiaryPayload = {
      entityId: selectedClient?.id,
      beneficiaryDetails: {
        type: requestedAccountType,
        nameOnAccount,
        address: {
          country,
          buildingNumber,
          zipOrPostalCode,
          stateOrProvince,
          city,
          street
        }
      },
      currency,
      mainCurrency,
      status: "new",
      accountDetails: {
        branchCode,
        nameOnAccount,
        accountNumber,
        bic,
        iban
      },
      isDeleted: false
    };
    dispatch(setSubmitting(true));
    try {
      await newBeneficiary(newBeneficiaryPayload).unwrap();
      dispatch(setLoading(false));
      dispatch(setSubmitting(false));
      Notification({
        message: "New Beneficiary",
        description: "New Beneficiary Created Successfully!",
        type: "success"
      });
      refetch();
      setCounter(counter + 1);
      dispatch(showModalAction(true));
      return true;
    } catch (err: any) {
      console.log("Beneficiary result Error: ", err);
      dispatch(setLoading(false));
      dispatch(setSubmitting(false));
      Notification({
        message: "New Beneficiary Rejected",
        description: err?.data?.message ?? "Create new beneficiary error",
        type: "error"
      });
      return false;
    }
  };

  const cancelNewBeneficiary = () => {
    dispatch(showFormModalAction(false));
  };

  return (
    <>
      <section>
        <Header>
          <HeaderContent.Title subtitle={`Select an account to be credited.`}>
            Beneficiary Selection
          </HeaderContent.Title>
        </Header>
        <Row gutter={15}>
          <Col className="gutter-row" span={18}>
            <SwitchName
              selectedOption={settlementType === "internal" ? 0 : 1}
              name="settlementType"
              onChange={onChangeSettlementType}
              options={settlementTypeOptions}
            />
          </Col>
          <Col className="gutter-row" span={6}>
            {/* {settlementType === "internal" && (
              <Link label="+ New Account" url="/newAccount" size="small" />
            )} */}
            {settlementType === "external" && (
              <span
                style={{
                  display: "inline-block",
                  color: Colors.blue.blue500,
                  fontSize: "1.2rem",
                  cursor: "pointer",
                  userSelect: "none"
                }}
                onClick={() => dispatch(showFormModalAction(true))}
              >
                + New Beneficiary
              </span>
            )}
          </Col>
        </Row>
        <Spacer size={15} />
        <Row gutter={15}>
          <Col className="gutter-row" span={24}>
            {settlementType === "internal" && (
              <AccountRadioGroup
                defaultValue={beneficiaryId}
                filterByCurrency={sellCurrency}
                filterByMainCurrency={mainSellCurrency}
                hideUnavailableBalance={false}
                filterByProductGroup={ProductGroup.GlobalPayments}
                onChange={onChangeAccountSelection}
                accountsData={clientAccountData || companyAccountData}
                productIds={productIds}
              />
            )}
            {settlementType === "external" && (
              <div>
                {isLoadingBeneficiariesList ||
                  (isFetching ? (
                    <div style={{ textAlign: "center", margin: "50px 0px" }}>
                      <Spin label="loading..." loading={true} />
                    </div>
                  ) : (
                    <Beneficiaries
                      filterBeneByCurrency
                      filterMainCurrency={mainSellCurrency}
                      product="efx"
                      beneficiaryList={
                        (beneficiaryList?.response ||
                          []) as BeneficiaryResponse["response"]
                      }
                    />
                  ))}
              </div>
            )}
          </Col>
        </Row>
        <Spacer size={25} />
        <Row gutter={15}>
          <Col span={18}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Button
                onClick={() => {
                  dispatch(setToInitialBeneficiary());
                  previousStepHandler();
                }}
                type="secondary"
                label="Previous"
                icon={{
                  name: "leftArrow",
                  position: "left"
                }}
              />
              {ConfirmModal ? (
                <Button
                  disabled={beneficiaryId ? false : true}
                  type="primary"
                  label={confirmBtnLabel}
                  icon={{
                    name: "rightArrow",
                    position: "right"
                  }}
                  onClick={() => dispatch(showModalAction(true))}
                />
              ) : (
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
              )}
            </div>
          </Col>
        </Row>
        {ConfirmModal && <ConfirmModal show={showModal} />}
      </section>
      <NewBeneficiaryForm
        visible={showFormModal}
        hideModal={cancelNewBeneficiary}
        handleSubmit={submitNewBeneficiary}
        submitting={submittingBeneficiary}
        selectedCurrency={sellCurrency}
        mainCurrency={mainSellCurrency}
        product="efx"
      />
    </>
  );
};

export default Beneficiary;
