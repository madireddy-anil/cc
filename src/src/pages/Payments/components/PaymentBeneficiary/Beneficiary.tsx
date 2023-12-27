import {
  Button,
  SwitchName,
  Colors,
  Notification,
  Spin
} from "@payconstruct/design-system";
import { Row, Col } from "antd";
import React, { useEffect } from "react";
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
  showFormModalAction,
  setSubmitting,
  changeSettlementType,
  setBeneficiaryAction
} from "../../../Components/Beneficiary/BeneficiarySlice";
import { Beneficiaries } from "../../../Components/Beneficiary/ExternalBeneficiaries/Beneficiaries";
import NewBeneficiaryForm from "../../../../components/Modals/NewBeneficiary";
import { setLoading } from "../../../../config/general/generalSlice";
import { useCreateBeneficiaryMutation } from "../../../../services/beneficiaryService";
import {
  previousStepAction,
  setToInitialPaymentDetails
} from "../../PaymentSlice";
import { selectClient } from "../../../Components/ClientSelection/ClientSelectionSlice";

import { selectAccountSelection } from "../../../Components/AccountSelection/AccountSelectionSlice";

import MoveBetweenAccounts from "./moveBwAccounts";

interface BeneficiaryProps {
  nextStepHandler?: () => void;
  previousStepHandler: () => void;
}

const Beneficiary: React.FC<BeneficiaryProps> = (props) => {
  const { nextStepHandler, previousStepHandler } = props;
  const dispatch = useAppDispatch();

  const {
    showFormModal,
    submittingBeneficiary,
    settlementType,
    beneficiaryId
  } = useAppSelector((state) => state.beneficiary);

  const { isLoading: isRateFetching } = useAppSelector(
    (state) => state.payment
  );
  const selectedClient = useAppSelector(selectClient);
  const selectedAccount = useAppSelector(selectAccountSelection);

  const [newBeneficiary, { isLoading }] = useCreateBeneficiaryMutation();

  const entityId: string = selectedClient ? selectedClient.id : "";
  const {
    isLoading: isBeneficiaryLoading,
    isFetching: isBeneficiaryFetching,
    data: beneficiaryList,
    refetch
  } = useGetBeneficiaryByClientIdQuery(
    { entityId },
    { refetchOnMountOrArgChange: 10, skip: settlementType === "internal" }
  );

  type settlementTypeOptionsType = {
    label: string;
    value: typeof settlementType;
  }[];

  const settlementTypeOptions: settlementTypeOptionsType = [
    { label: "Move between Accounts", value: "internal" },
    { label: "Beneficiaries", value: "external" }
  ];

  const onChangeSettlementType = (result: any) => {
    dispatch(changeSettlementType(result.settlementType));
  };

  // useEffect(() => {
  //   if (isLoading) {
  //     dispatch(setLoading(true));
  //   } else {
  //     dispatch(setLoading(false));
  //   }
  // }, [dispatch, isLoading]);

  const submitNewBeneficiary = async (formData: any) => {
    const {
      requestedAccountType,
      country,
      bankCountry,
      currency,
      nameOnAccount,
      accountNumber,
      iban,
      bic,
      branchCode,
      buildingNumber,
      zipOrPostalCode,
      city,
      stateOrProvince,
      street,
      bankName,
      intermediaryBank,
      mainCurrency
    } = formData;
    dispatch(setSubmitting(true));
    try {
      const newBeneficiaryPayload = {
        entityId,
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
          bankName,
          nameOnAccount,
          accountNumber,
          bic,
          iban,
          bankCountry,
          intermediaryBank
        },
        isDeleted: false
      };
      await newBeneficiary(newBeneficiaryPayload).unwrap();
      dispatch(setBeneficiaryAction(newBeneficiaryPayload));
      dispatch(setToInitialPaymentDetails());
      // dispatch(setLoading(false));
      dispatch(setSubmitting(false));
      Notification({
        message: "New Beneficiary",
        description: "New Beneficiary Created Successfully!",
        type: "success"
      });
      if (nextStepHandler) nextStepHandler();
      refetch();
      return true;
    } catch (err: any) {
      console.log("Beneficiary result Error: ", err);
      // dispatch(setLoading(false));
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
          <HeaderContent.Title
            subtitle={`Select a Beneficiary for the amount to be settled to.`}
          >
            Beneficiary
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
        <Spacer size={30} />
        <Row gutter={15}>
          <Col className="gutter-row" span={24}>
            {settlementType === "internal" && <MoveBetweenAccounts />}
            {settlementType === "external" && (
              <Spin loading={isBeneficiaryLoading || isBeneficiaryFetching}>
                <Beneficiaries
                  filterBeneByCurrency
                  filterCurrency={selectedAccount?.currency}
                  filterMainCurrency={selectedAccount?.mainCurrency}
                  beneficiaryList={
                    (beneficiaryList?.response ||
                      []) as BeneficiaryResponse["response"]
                  }
                  product="payments"
                />
              </Spin>
            )}
          </Col>
        </Row>
        <Spacer size={25} />
        {settlementType === "external" && (
          <Row gutter={24}>
            <Col span={24}>
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
                  loading={isRateFetching}
                  type="primary"
                  label="Continue"
                  icon={{
                    name: "rightArrow",
                    position: "right"
                  }}
                />
              </div>
            </Col>
          </Row>
        )}
      </section>
      <NewBeneficiaryForm
        visible={showFormModal}
        hideModal={cancelNewBeneficiary}
        handleSubmit={submitNewBeneficiary}
        submitting={submittingBeneficiary}
        selectedCurrency={selectedAccount?.currency}
        mainCurrency={selectedAccount?.mainCurrency}
        product="payments"
      />
    </>
  );
};

export default Beneficiary;
