import {
  Accordions,
  Button,
  Col,
  Row,
  Status,
  Table,
  Notification,
  Modal
} from "@payconstruct/design-system";
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Spacer } from "../../../../../components/Spacer/Spacer";
import { useSaveLegMutation } from "../../../../../services/ExoticFX/Finance/endpoints/depositEndpoints";
import { OrderLegVendorDetails } from "../../../../../services/ExoticFX/Finance/financeService";
import { DepositDetailModal } from "../../../Components/Modal/DepositDetail/DepositDetail";
import {
  DepositDetailsForm,
  NewVendorAccount
} from "../../../Components/Modal/NewVendorAccount/NewVendorAccount";
import {
  useAppSelector,
  useAppDispatch
} from "../../../../../redux/hooks/store";
import {
  setAccordion,
  selectAccordion
} from "../../../../../config/general/generalSlice";

import { VendorHeader } from "./VendorHeader";

interface DepositAccordionProps {
  deposits?: OrderLegVendorDetails[];
  filterByLegType: "exchange" | "local";
  tableColumns: any; // TODO Temporary
  orderStatus: string;
}

const DepositAccordion: React.FC<DepositAccordionProps> = ({
  tableColumns,
  deposits,
  filterByLegType,
  orderStatus
}) => {
  let { id: orderId = "" } = useParams<{ id: string }>();
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [tempData, setTempData] = useState({ currency: "", vendorId: "" });
  const [refetchCounter, setCounter] = useState<number>(0);
  const [AccordionTitle] = useState(
    filterByLegType[0].toUpperCase() + filterByLegType.slice(1).toLowerCase()
  );
  const dispatch = useAppDispatch();
  const accordion = useAppSelector(selectAccordion);

  const [vendorDetails, setVendorDetails] = useState<DepositDetailsForm>({
    orderId,
    leg: filterByLegType,
    currency: "",
    vendorName: "",
    vendorId: ""
  });

  const [depositDetails, setDepositDetails] = useState({
    orderId,
    leg: filterByLegType,
    currency: "",
    vendorName: "",
    vendorId: ""
  });

  const [saveLeg, { isLoading: SavingLegDetails }] = useSaveLegMutation();

  const saveLegDetails = async (vendorDetails: {
    currency: string;
    vendorId: string;
  }) => {
    const form = {
      orderId,
      leg: filterByLegType,
      ...vendorDetails
    };

    try {
      await saveLeg(form).unwrap();
      Notification({
        message: "Success",
        description: "Leg saved successfully",
        type: "success"
      });
      setShowWarning(false);
    } catch (err: any) {
      Notification({
        message: "Error",
        description: "An error has occurred",
        type: "error"
      });
      console.log("# Error: ", err);
    }
  };

  const leg = deposits?.filter((deposit) => {
    return deposit.leg === filterByLegType;
  });

  const legStatus = useMemo(() => {
    if (!leg || leg[0]?.deposits?.length === 0) {
      return "rejected";
    }

    return leg[0]?.deposits.filter((deposit) => {
      return deposit.status !== "complete";
    }).length === 0
      ? "approved"
      : "pending";
  }, [leg]);

  const handleAccordionChange = (key: string, uncollapse: boolean) => {
    const obj = { ...accordion, [key]: uncollapse };
    dispatch(setAccordion(obj));
  };

  const getDeposites = (deposits: any, locked: boolean) => {
    if (deposits.length > 0) {
      const newDeposits = deposits.map((obj: any) => ({
        ...obj,
        locked
      }));
      return newDeposits;
    }
    return [];
  };

  if (!leg || leg?.length < 1)
    return (
      <Accordions
        accordionType="simple"
        disabled
        header={`${AccordionTitle} not available`}
        text={<div>No data to display</div>}
      />
    );
  return (
    <Accordions
      // collapsible="header"
      onChange={(e) =>
        handleAccordionChange(
          `unCollapseDepositInformation${AccordionTitle}`,
          Boolean(e.length)
        )
      }
      unCollapse={
        AccordionTitle === "Local"
          ? accordion?.unCollapseDepositInformationLocal
          : accordion?.unCollapseDepositInformationExchange
      }
      accordionType="simple"
      header={AccordionTitle}
      headerRight={
        <Status
          tooltipText={
            legStatus === "approved"
              ? `${AccordionTitle} leg complete`
              : legStatus === "pending"
              ? `${AccordionTitle} leg incomplete`
              : `${AccordionTitle} leg has no deposits`
          }
          type={legStatus}
        />
      }
      text={
        <>
          {leg.map(
            ({
              name = "",
              currency,
              deposits,
              expected,
              unassigned,
              vendorId,
              locked
            }) => {
              const newDeposites = getDeposites(deposits, locked);

              return (
                <div key={`wrapper_${vendorId}`}>
                  <VendorHeader
                    currency={currency}
                    name={name ?? ""}
                    sellAmount={expected}
                    subAmount={String(unassigned)}
                  />
                  <Spacer size={10} />

                  <Table
                    key={vendorId}
                    dataSource={newDeposites ?? []}
                    tableColumns={tableColumns}
                    tableSize="medium"
                    pagination={false}
                    scroll={{ x: true }}
                    rowKey={"accountNumber"}
                  />

                  <Spacer size={10} />

                  <Row gutter={15}>
                    <Col>
                      <Button
                        type="primary"
                        label="Add Deposit Details"
                        size="small"
                        disabled={
                          locked ||
                          unassigned === 0 ||
                          orderStatus === "cancelled"
                        }
                        onClick={() => {
                          setVendorDetails({
                            ...depositDetails,
                            vendorName: name,
                            currency: currency,
                            vendorId: vendorId
                          });
                          setDepositDetails({
                            ...depositDetails,
                            vendorName: name,
                            currency: currency,
                            vendorId: vendorId
                          });
                          setShowDepositModal(true);
                        }}
                      />
                    </Col>
                    <Col>
                      <Button
                        type="primary"
                        label="Save Leg Details"
                        size="small"
                        loading={SavingLegDetails}
                        onClick={() => {
                          if (unassigned > 0) {
                            setTempData({ currency, vendorId });
                            setShowWarning(true);
                          } else {
                            saveLegDetails({ currency, vendorId });
                          }
                        }}
                        disabled={
                          unassigned === Number(expected) ||
                          orderStatus === "cancelled" ||
                          newDeposites.filter((d: any) => d.locked).length ===
                            newDeposites.length
                        }
                      />
                    </Col>
                  </Row>
                  <Spacer size={30} />
                </div>
              );
            }
          )}
          <NewVendorAccount
            vendor={vendorDetails}
            show={showAccountModal}
            onClickOk={() => {
              setShowAccountModal(false);
              setShowDepositModal(true);
            }}
            onClickCancel={() => {
              setShowAccountModal(false);
              setShowDepositModal(true);
            }}
            setCounter={setCounter}
          />
          <DepositDetailModal
            deposit={depositDetails}
            show={showDepositModal}
            newAccountAction={() => {
              setShowDepositModal(false);
              setShowAccountModal(true);
            }}
            onClickOk={() => {
              setShowDepositModal(false);
            }}
            onClickCancel={() => {
              setShowDepositModal(false);
            }}
            refetchCounter={refetchCounter}
          />
          <Modal
            modalView={showWarning}
            title={
              "Total deposit and order amount are not equal. Do you want to continue ?"
            }
            onCancelText={"Cancel"}
            onOkText={"Confirm"}
            onClickCancel={() => {
              setShowWarning(false);
            }}
            onClickOk={() => {
              saveLegDetails(tempData);
            }}
          />
        </>
      }
    />
  );
};

export { DepositAccordion };
