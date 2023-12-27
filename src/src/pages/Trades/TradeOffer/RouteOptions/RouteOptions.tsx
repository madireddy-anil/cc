import { FC, useEffect, useState } from "react";
import {
  Row,
  Col,
  Accordions,
  Button,
  Status,
  Colors,
  Notification
} from "@payconstruct/design-system";
import { Empty } from "antd";
import { useAppSelector } from "../../../../redux/hooks/store";
import { Spacer } from "../../../../components";
import { EFXOrder, Route } from "@payconstruct/pp-types";
import { tempSelectedRoute as tsr } from "../../../../config/trades/tradeSlice";
import { Options, SelectedOption } from "./Components";
import { useParams } from "react-router";
import {
  useSelectRouteMutation,
  useResetRouteSelectionMutation,
  RouteListResponse
} from "../../../../services/routesService";
import css from "./RouteOptions.module.css";
import { Spinner } from "../../../../components/Spinner/Spinner";
import { useOvernight } from "../../../../customHooks/useOvernight";
// import { routeData as financialsMocked } from "./Components/RouteData";

interface RouteOptionsProps {
  order: EFXOrder;
  refetchOrder: () => void;
  fetchFinancials: () => void;
  refetchRoutes: () => void;
  routeData?: RouteListResponse;
  isFetchingCalcRoutes: boolean;
  hasSelectedRoute: boolean;
  noRouteSelected: boolean;
  hasRoutes: boolean;
  isPriceConfirmed: boolean;
}

const RouteOptions: FC<RouteOptionsProps> = ({
  order,
  routeData,
  refetchOrder,
  fetchFinancials,
  refetchRoutes,
  isFetchingCalcRoutes,
  hasSelectedRoute,
  isPriceConfirmed,
  noRouteSelected,
  hasRoutes
}) => {
  const tempSelectedRoute = useAppSelector(tsr);
  const { id = "" } = useParams<{ id: string }>();

  //@ts-ignore
  const { isDay1 } = useOvernight(id);

  const [selectRouteMu, { isLoading: selectingRoute }] =
    useSelectRouteMutation();

  const [resetRouteSelection] = useResetRouteSelectionMutation();

  const [readyToAcceptOrder] = useState(
    order?.status === "deposit_pending_approval" ||
      order?.status === "pending_approval_client"
  );

  // console.log("!isDay1", !isDay1);
  // console.log("readyToAcceptOrder", readyToAcceptOrder);
  // console.log("hasSelectedRoute", hasSelectedRoute);
  // console.log("tempSelectedRoute", tempSelectedRoute);

  useEffect(() => {
    let refetchTimeout: NodeJS.Timeout;
    if (hasSelectedRoute && readyToAcceptOrder === false && !isDay1) {
      refetchTimeout = setTimeout(refetchOrder, 1000);
    }
    return () => clearTimeout(refetchTimeout);
  }, [
    order.status,
    hasSelectedRoute,
    readyToAcceptOrder,
    isDay1,
    refetchOrder
  ]);

  const handleSelectRoute = async () => {
    if (selectingRoute) {
      return;
    }
    const { SK } = tempSelectedRoute as Route;
    try {
      selectRouteMu({
        routeId: SK,
        orderId: id
      })
        .unwrap()
        .then(() => {
          refetchRoutes();
          fetchFinancials();
        });
    } catch (err) {
      Notification({
        message: "Select Route Error",
        description: "Select Route Error Occurred",
        type: "error"
      });
    }
  };

  const handleRecalculate = async () => {
    refetchRoutes();
  };

  const handleResetRoutes = () => {
    resetRouteSelection({ id })
      .unwrap()
      .then(() => {
        refetchRoutes();
        Notification({
          message: "Route Reset",
          description: "You Reset Routes successfully",
          type: "success"
        });
      })
      .catch((error) => {
        Notification({
          message: "Error Resetting Routes",
          description: "Route could not be reset",
          type: "error"
        });
        console.log("%c Error:", "background: red; color: white;", error);
      });
  };

  return (
    <>
      <Spacer size={15} />
      <Row gutter={15}>
        <Col span={24} className={css["route-options-wrapper"]}>
          <Accordions
            // unCollapse
            activeKey={"Route Options"}
            accordionType="simple"
            header="Route Options"
            headerRight={
              hasSelectedRoute ? (
                <Status type="approved" tooltipText="Route selected" />
              ) : hasRoutes ? (
                <Status type="pending" tooltipText="Route not selected yet" />
              ) : (
                <Status
                  type="rejected"
                  tooltipText="No Routes for this order"
                />
              )
            }
            text={
              isFetchingCalcRoutes && noRouteSelected ? (
                <Spinner />
              ) : hasRoutes ? (
                <div className={css["route-options-content"]}>
                  {/* Has a Selected Route */}
                  {hasSelectedRoute ? (
                    <SelectedOption route={routeData?.routes[0]} />
                  ) : (
                    <>
                      {/* No Route Selected yet */}
                      <Options routes={routeData?.routes} />
                      <div className={css["button-wrapper"]}>
                        {hasRoutes && (
                          <Button
                            disabled={
                              tempSelectedRoute === null ||
                              order?.status === "cancelled"
                            }
                            type="primary"
                            label={`${
                              order?.status === "deposit_ready_to_trade"
                                ? "Update"
                                : "Select"
                            } Route & See Pricing`}
                            style={{ marginRight: 15 }}
                            onClick={handleSelectRoute}
                            loading={selectingRoute}
                          />
                        )}
                        <Button
                          type="secondary"
                          label="Recalculate Route Option"
                          onClick={handleRecalculate}
                          disabled={order?.status === "cancelled"}
                        />
                      </div>
                    </>
                  )}

                  {hasSelectedRoute &&
                  !(
                    // @ts-ignore
                    (
                      isPriceConfirmed ||
                      (order?.depositType === "overnight" && !isDay1)
                    )
                  ) ? (
                    <>
                      <Spacer size={15} />
                      <Button
                        type="primary"
                        label="RESET ROUTE SELECTION"
                        disabled={order.status === "cancelled"}
                        onClick={handleResetRoutes}
                        style={{ backgroundColor: Colors.red.red500 }}
                      />
                    </>
                  ) : (
                    (order.status === "accepted_by_client" ||
                      order.status === "deposit_accepted_by_client" ||
                      order.status === "auto_accepted") && (
                      <>
                        <Spacer size={15} />
                        <Button
                          type="primary"
                          label="RESET ROUTE SELECTION"
                          disabled
                        />
                      </>
                    )
                  )}
                </div>
              ) : (
                <Empty
                  description={
                    <span>
                      No Routes found: <b>{id}</b>
                    </span>
                  }
                />
              )
            }
          />
        </Col>
      </Row>
    </>
  );
};

export { RouteOptions };
