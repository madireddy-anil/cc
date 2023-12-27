import React, { CSSProperties, useEffect, useState } from "react";
import {
  Col,
  Row,
  Accordions,
  Status,
  Notification,
  Tag,
  Icon,
  Text,
  Colors
} from "@payconstruct/design-system";
import { useNavigate } from "react-router-dom";
import { Button, PageHeader } from "antd";
import { EFXOrder } from "@payconstruct/pp-types";
import { useParams } from "react-router";
import { HeaderContent } from "../../../../components/PageHeader/Header";

import { Spacer } from "../../../../components/Spacer/Spacer";
import { AccountDetails } from "../Components/AccountDetails";
import { BeneficiaryDetails } from "../Components/BeneficiaryDetails";
import { PaymentDetails } from "../Components/PaymentDetails";
import { ClientDetails } from "../Components/ClientDetails";
import { useGetBeneficiaryIdQuery } from "../../../../services/beneficiaryService";
import {
  Account,
  useGetAccountQuery
} from "../../../../services/accountService";

import RouteOptions from "../RouteOptions";
import { PriceCalculationAccordion } from "../Components/PriceCalculationAccordion";

import css from "../Components/RouteOptions.module.css";
import {
  useGetCalculatedRoutesQuery,
  useGetFinancialsQuery
} from "../../../../services/routesService";
import {
  fieldCurrencyFormatter,
  formatDate,
  getOrderStatusWithCamelCase
} from "../../../../utilities/transformers";
import { useAppSelector, useAppDispatch } from "../../../../redux/hooks/store";
import {
  selectTimezone,
  setAccordion,
  selectAccordion,
  setLoading
} from "../../../../config/general/generalSlice";
import { camelize } from "../../../../config/transformer";
import { useCancelOrderMutation } from "../../../../services/tradesService";
import Wrapper from "../../Components/Wrapper";

interface AcceptOfferProps {
  depositList: any;
  refetch: () => void;
  refetchDeposits: () => void;
  trade: EFXOrder;
  account?: Account;
  style?: CSSProperties;
  userData: any;
}

//* Should be Container Component
const AcceptedOffer: React.FC<AcceptOfferProps> = ({
  depositList,
  trade,
  account,
  style,
  userData,
  refetch: refetchOrder,
  refetchDeposits
}) => {
  const { Title } = HeaderContent;
  const timezone: string = useAppSelector(selectTimezone);
  let { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cancelOrder] = useCancelOrderMutation();
  const dispatch = useAppDispatch();
  const accordion = useAppSelector(selectAccordion);
  const [disabled, setDisabled] = useState(false);

  useGetAccountQuery(
    { accountId: trade?.sellAccountId ?? "" },
    { skip: trade?.sellAccountId === undefined }
  );

  let { data: beneficiaryData } = useGetBeneficiaryIdQuery(
    { id: trade?.beneficiaryId ?? "" },
    { skip: trade?.beneficiaryId === undefined }
  );

  //Portal can be: bms | cms;
  const company =
    trade.createdBy.portal === "bms" ? "Orbital" : `${trade.clientName}`;

  const createdBy = `${trade.createdBy.firstName} - ${company}`;

  if (Array.isArray(beneficiaryData)) {
    beneficiaryData = undefined;
  }

  const {
    data: routeData,
    refetch: refetchRoutes,
    isFetching: isFetchingCalcRoutes
  } = useGetCalculatedRoutesQuery({ id }, { refetchOnMountOrArgChange: true });

  const hasSelectedRoute =
    routeData?.routes.length === 1 && !!routeData?.routes[0]?.selected;

  const noRouteSelected =
    (routeData?.routes && routeData?.routes.length < 0) ||
    !routeData?.routes[0]?.selected;

  const hasRoutes = !!routeData?.routes && routeData?.routes.length > 0;

  const {
    refetch: fetchFinancials,
    data: financials,
    isLoading: isLoadingFinancials
  } = useGetFinancialsQuery(
    {
      id
    },
    { skip: noRouteSelected, refetchOnMountOrArgChange: true }
  );

  const [isPriceConfirmed, setPriceConfirmed] = useState(
    financials?.status === "approved" ||
      financials?.status === "overnight_approved"
  );

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    setPriceConfirmed(
      financials?.status === "approved" ||
        financials?.status === "overnight_approved"
    );

    if (financials?.status === "pending") {
      timeout = setTimeout(() => {
        fetchFinancials();
        refetchOrder();
      }, 2000);
    }

    return () => clearTimeout(timeout);
  }, [financials?.status, refetchOrder, fetchFinancials]);

  const handleClickCancelOrder = async () => {
    setDisabled(true);
    await cancelOrder({ id: trade?.id }).unwrap();
    Notification({
      message: "Success",
      description: "Order cancelled successfully!",
      type: "success"
    });
    navigate("/trades");
  };

  const pageHeaderDesign = {
    topPadding: { paddingTop: `20px` },
    title: { paddingBottom: `12px` },
    titleLast: { paddingBottom: `25px` }
  };

  const handleAccordionChange = (key: string, uncollapse: boolean) => {
    const obj = { ...accordion, [key]: uncollapse };
    dispatch(setAccordion(obj));
  };

  const enabledCancelButton = (status: string) => {
    if (
      status === "new_client_order" ||
      status === "warehouse" ||
      status === "deposit_pending_approval" ||
      status === "pending_approval_client" ||
      status === "accepted_by_client" ||
      status === "deposit_accepted_by_client"
    )
      return false;
    return true;
  };
  const hasDepositItemInorder = () => {
    const deposits = depositList?.deposits;
    const hasDeposite = (deposits || []).find(
      (deposit: any) => deposit.deposits.length > 0
    );
    return hasDeposite;
  };
  return (
    <Col xs={24} sm={24} md={24} lg={24} xl={24} style={style}>
      <div style={pageHeaderDesign.topPadding}>
        <PageHeader
          title={`Order Id - ${trade?.orderReference}`}
          className="site-page-header"
          style={{ padding: "0px 0px 0px 0px" }}
          tags={
            <>
              {trade?.status !== "cancelled" && (
                <Button
                  disabled={
                    enabledCancelButton(trade?.status) ||
                    disabled ||
                    hasDepositItemInorder()
                  }
                  danger
                  shape="round"
                  onClick={handleClickCancelOrder}
                >
                  Cancel Order
                </Button>
              )}
            </>
          }
        />
        <Spacer size={15} />
        <Wrapper>
          <div className={css["summary-content"]}>
            <div className={css["summary-element"]}>
              <p>
                <Text
                  label="Execution Date"
                  size="small"
                  color={Colors.grey.neutral500}
                />
              </p>
              <Text
                label={formatDate(trade?.executionDate, timezone)}
                color={Colors.grey.neutral700}
                weight="bold"
              />
            </div>
            <div className={css["summary-element"]}>
              <p>
                <Text
                  label="Status"
                  size="small"
                  color={Colors.grey.neutral500}
                />
              </p>
              <Text
                label={getOrderStatusWithCamelCase(trade?.status)}
                color={Colors.grey.neutral700}
                weight="bold"
              />
            </div>
            <div className={css["summary-element"]}>
              <p>
                <Text
                  label="Currency Pair"
                  size="small"
                  color={Colors.grey.neutral500}
                />
              </p>
              <Text
                label={`${trade.buyCurrency}.${trade.sellCurrency} (${
                  trade.mainSellCurrency ? trade.mainSellCurrency : "ETH"
                })`}
                color={Colors.grey.neutral700}
                weight="bold"
              />
            </div>
          </div>
        </Wrapper>
        <Spacer size={15} />
      </div>
      <Accordions
        onChange={(e) =>
          handleAccordionChange("unCollapseOrderInformation", Boolean(e.length))
        }
        unCollapse={accordion?.unCollapseOrderInformation}
        accordionType="simple"
        header="Order Information"
        headerRight={<Status type="approved" />}
        text={
          <>
            <Row gutter={[15, 15]} style={{ marginBottom: "15px" }}>
              <Col xs={24}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "left",
                    alignItems: "center"
                  }}
                >
                  <span
                    style={{ display: "inline-block", marginRight: "10px" }}
                  >
                    Created by:
                  </span>
                  <Tag
                    hasEffect={false}
                    label={createdBy}
                    isPrefix={true}
                    prefix={<Icon name="user" />}
                  />
                </div>
              </Col>
            </Row>
            <Row gutter={[15, 15]} style={{ marginBottom: "15px" }}>
              <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                <AccountDetails trade={trade} account={account} />
                <Spacer size={15} />
                <ClientDetails trade={trade} userData={userData} />
              </Col>
              <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                <BeneficiaryDetails trade={trade} />
              </Col>
            </Row>
            <Row gutter={[15, 15]}>
              <Col span={24}>
                <PaymentDetails
                  trade={trade}
                  refetchRoutes={refetchRoutes}
                  hasRoutes={hasSelectedRoute}
                />
              </Col>
            </Row>
          </>
        }
      />
      {/* <PaymentDetailsTab trade={trade} account={account} /> */}
      <RouteOptions
        order={trade}
        routeData={routeData}
        isFetchingCalcRoutes={isFetchingCalcRoutes}
        refetchRoutes={refetchRoutes}
        refetchOrder={refetchOrder}
        fetchFinancials={fetchFinancials}
        hasSelectedRoute={hasSelectedRoute}
        noRouteSelected={noRouteSelected}
        hasRoutes={hasRoutes}
        isPriceConfirmed={isPriceConfirmed}
      />
      <Spacer size={15} />
      <Row gutter={15}>
        <Col span={24} className={css["price-calculation-wrapper"]}>
          <PriceCalculationAccordion
            key={id}
            orderId={id}
            order={trade}
            financials={financials}
            refetchOrder={refetchOrder}
            fetchFinancials={fetchFinancials}
            refetchDeposits={refetchDeposits}
            hasSelectedRoute={hasSelectedRoute}
            isLoadingFinancials={isLoadingFinancials}
            isPriceConfirmed={isPriceConfirmed}
            setPriceConfirmed={setPriceConfirmed}
          />
        </Col>
      </Row>

      <Spacer size={15} />
    </Col>
  );
};

export { AcceptedOffer };
