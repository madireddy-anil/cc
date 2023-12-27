import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Space } from "antd";
import {
  Text,
  Button,
  Colors,
  Modal,
  Input,
  Notification,
  Alert
} from "@payconstruct/design-system";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks/store";
import { PageWrapper, Spacer } from "../../../components";
import { amountFormatter } from "../../../config/transformer";
import { selectTimezone } from "../../../config/general/generalSlice";
import { formatDateAndTime } from "../../../utilities/transformers";
import {
  selectClients,
  selectCompanies
  // selectVendors
} from "../../../config/general/generalSlice";
import {
  DateTime,
  ListCard,
  AccountCard,
  AccordionAddress,
  Table as DataTable
} from "./components";
import {
  useGetErrorDetailQuery,
  useActionErrorMutation
} from "../../../services/errorQueueService";
import { selectedError } from "../../../config/errorQueue/errorQueueSlice";
import { setLoading } from "../../../config/general/generalSlice";
import css from "./ErrorQueueView.module.css";
import lodash from "lodash";

export const ErrorQueueView = () => {
  const { id: errorId }: any = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [openRows, setOpenRows] = useState<Array<number>>([]);
  const [actionModal, showActionModal] = useState<boolean>(false);
  const [actionName, setActionName] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [okClicked, setOkClicked] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const [approveReject, { isLoading }] = useActionErrorMutation();
  const timeZone: string = useAppSelector(selectTimezone);

  const { isFetching } = useGetErrorDetailQuery(
    { errorId },
    { refetchOnMountOrArgChange: true }
  );
  const error: any = useAppSelector(selectedError);
  const client: any = useAppSelector(selectClients);
  const vendors = location?.state || [];
  const companies: any = useAppSelector(selectCompanies);

  const handleApprove = () => {
    setActionName("Approve");
    showActionModal(true);
  };

  const handleReject = () => {
    setActionName("Reject");
    showActionModal(true);
  };

  const handleSubmit = async () => {
    setOkClicked(true);
    if (reason) {
      try {
        const payload = {
          errorId,
          payload: {
            approveStatus: actionName.toLowerCase(),
            processFlow: error?.errorPayment?.processFlow,
            remarks: reason
          }
        };
        await approveReject(payload).unwrap();
        dispatch(setLoading(false));
        navigate("/error-queue");
        Notification({
          message: `Payment ${actionName}${
            actionName === "Approve" ? "d" : "ed"
          }!`,
          type: "success"
        });
      } catch (err: any) {
        dispatch(setLoading(false));
        Notification({
          message: err?.data?.message,
          type: "error"
        });
      }
    }
  };

  const handleCancel = () => {
    setOkClicked(false);
    showActionModal(false);
  };

  const setOpen = (row: number) => {
    let set = new Set(openRows);
    if (openRows.indexOf(row) > -1) {
      set.delete(row);
    } else {
      set.add(row);
    }
    const rows = Array.from(set);
    setOpenRows(rows);
  };

  const handleChange = (e: any) => {
    const { value } = e.target;
    setReason(value);
  };

  const getOwner = (ownerEntityId: any) => {
    const ownerEntity = [...client, ...vendors, ...companies]?.find(
      (rec: any) => rec?.id === ownerEntityId
    );
    return ownerEntity?.genericInformation?.registeredCompanyName ?? "---";
  };

  const getExceptionMessage = (data: any) => {
    switch (data.exitStatusCode) {
      case "C1":
        return "Screening Rejected";
      case "P100":
        return "Manual Review";
      default:
        return lodash.startCase(data.messageValidationResult);
    }
  };

  return (
    <main>
      <PageWrapper>
        {isFetching || !("errorPayment" in error) ? (
          <p>Loading...</p>
        ) : (
          <>
            <DateTime
              data={formatDateAndTime(error?.errorPayment?.createdAt, timeZone)}
            />
            <div className={css["header"]}>
              <div className={css["error-name"]}>
                <Text
                  label={error?.errorPayment?.transactionReference}
                  size="xlarge"
                  weight="bolder"
                  color={Colors.grey.neutral700}
                />
                <span
                  className={css["badge"]}
                  style={{
                    backgroundColor: Colors.red.red500
                  }}
                >
                  <Text
                    label={error?.errorPayment?.messageValidationResult}
                    size="xsmall"
                    color={Colors.white.primary}
                  />
                </span>
              </div>
              <Space size={15}>
                <Button
                  type="primary"
                  label="Approve"
                  className={css["approve-button"]}
                  icon={{
                    name: "checkCircleOutline"
                  }}
                  onClick={handleApprove}
                />
                <Button
                  type="secondary"
                  label="Reject"
                  className={css["reject-button"]}
                  icon={{
                    name: "close"
                  }}
                  onClick={handleReject}
                />
              </Space>
            </div>
            <Spacer size={20} />
            {error.errorPayment.exitStatusCode === "P100" ? (
              <ListCard
                data={[
                  {
                    label: "Date Executed/Received",
                    value:
                      formatDateAndTime(
                        error?.errorPayment?.createdAt,
                        timeZone
                      ) ?? "---",
                    show: true
                  },
                  {
                    label: "Value Date",
                    value:
                      formatDateAndTime(
                        error?.errorPayment?.valueDate,
                        timeZone
                      ) ?? "---",
                    show: true
                  },
                  {
                    label: "End To End Reference",
                    value: error?.errorPayment?.endToEndReference ?? "---",
                    show: true
                  },
                  {
                    label: "Transaction Type",
                    value: error?.errorPayment?.isOutbound ? "Debit" : "Credit",
                    show: true
                  },
                  {
                    label: "Amount instructed",
                    value:
                      `${amountFormatter(error?.errorPayment?.debitAmount)} ${
                        error?.errorPayment?.debitCurrency
                      }` ?? "---",
                    show:
                      error?.errorPayment?.processFlow !==
                      "manual_credit_adjustment"
                  },
                  {
                    label: "Fees",
                    value:
                      `${error?.errorPayment?.fees?.liftingFeeAmount} ${error?.errorPayment?.fees?.liftingFeeCurrency}` ??
                      "---",
                    show:
                      error?.errorPayment?.processFlow !==
                      "manual_credit_adjustment"
                  },
                  {
                    label: "Amount Received",
                    value:
                      `${amountFormatter(error?.errorPayment?.creditAmount)} ${
                        error?.errorPayment?.creditCurrency
                      }` ?? "---",
                    show:
                      error?.errorPayment?.processFlow !==
                      "manual_credit_adjustment"
                  },
                  {
                    label: "Remittance Information",
                    value: error?.errorPayment?.remittanceInformation ?? "---",
                    show: true
                  },
                  {
                    label: "Payment Routing Channel",
                    value: error?.errorPayment?.paymentRoutingChannel ?? "---",
                    show: true
                  },
                  {
                    label: "Payment Settlement Channel",
                    value: error?.errorPayment?.settlementChannel ?? "---",
                    show: true
                  },
                  {
                    label: "Exchange Rate",
                    value:
                      error?.errorPayment?.foreignExchange?.allInRate ?? "---",
                    show: true
                  }
                ]}
              />
            ) : (
              <ListCard
                data={[
                  {
                    label: "Created On",
                    value: error?.errorPayment?.createdAt ?? "---",
                    show: true
                  },
                  {
                    label: "Client",
                    value:
                      getOwner(error?.errorPayment?.ownerEntityId) ?? "---",
                    show: true
                  },
                  {
                    label: "Payment Reference",
                    value: error?.errorPayment?.transactionReference ?? "---",
                    show: true
                  },
                  {
                    label: "Exception Status",
                    value: getExceptionMessage(error?.errorPayment),
                    show: true
                  },
                  {
                    label: "Process Flow",
                    value: lodash.startCase(error?.errorPayment?.processFlow),
                    show: true
                  },
                  {
                    label: "Payment Type",
                    value: error?.errorPayment?.isOutbound ? "Debit" : "Credit",
                    show: true
                  },
                  {
                    label: "Amount",
                    value: error?.errorPayment?.isOutbound
                      ? amountFormatter(error?.errorPayment?.debitAmount)
                      : amountFormatter(error?.errorPayment?.creditAmount),
                    show:
                      error?.errorPayment?.processFlow !==
                        "manual_credit_adjustment" ||
                      error?.errorPayment?.processFlow !==
                        "manual_debit_adjustment"
                  },
                  {
                    label: "Fee",
                    value: error?.errorPayment?.isOutbound
                      ? error?.errorPayment?.debitCurrency
                      : error?.errorPayment?.creditCurrency,
                    show:
                      error?.errorPayment?.processFlow !==
                        "manual_credit_adjustment" ||
                      error?.errorPayment?.processFlow !==
                        "manual_debit_adjustment"
                  },
                  {
                    label: "Remittance Information",
                    value: error?.errorPayment?.remittanceInformation ?? "---",
                    show: true
                  }
                ]}
              />
            )}
            {/* <ListCard
              data={[
                {
                  label: "Client",
                  value: error?.errorPayment?.debtor?.debtorName ?? "---"
                },
                {
                  label: "Process Flow",
                  value: (
                    <div style={{ wordBreak: "break-word" }}>
                      {error?.errorPayment?.processFlow ?? "---"}
                    </div>
                  )
                },
                {
                  label: "Payment Type",
                  value: error?.errorPayment?.isOutbound ? "Debit" : "Credit"
                },
                {
                  label: "Remittance Information",
                  value: (
                    <div style={{ wordBreak: "break-word" }}>
                      {error?.errorPayment?.remittanceInformation ?? "---"}
                    </div>
                  )
                }
              ]}
            /> */}
            <Spacer size={15} />
            <div className={css["card-wrap"]}>
              <div className={css["custom-accordion"]}>
                <AccountCard
                  account={{
                    name: error?.errorPayment?.debtor?.debtorName ?? "---",
                    accountNumber: error?.errorPayment?.debtorAccount,
                    reference: `${
                      error?.errorPayment?.debtorAgent?.debtorAgentCountry ??
                      "---"
                    } ${
                      error?.errorPayment?.debtorAgent?.debtorAgentId ?? "---"
                    }`,
                    currency: error?.errorPayment?.debitCurrency ?? "---",
                    amount: (
                      error?.errorPayment?.debitAmount || "---"
                    ).toString(),
                    type: error?.errorPayment?.debtorAccountType ?? "---"
                  }}
                />
                <AccordionAddress
                  address={{
                    ...error?.errorPayment?.debtor?.debtorAddress,
                    country:
                      error?.errorPayment?.debtorAgent?.debtorAgentCountry ??
                      "---"
                  }}
                />
              </div>
              <div className={css["custom-accordion"]}>
                <AccountCard
                  account={{
                    name: error?.errorPayment?.creditor?.creditorName ?? "---",
                    accountNumber: error?.errorPayment?.creditorAccount,
                    reference: `${
                      error?.errorPayment?.creditorAgent
                        ?.creditorAgentCountry ?? "---"
                    } ${
                      error?.errorPayment?.creditorAgent?.creditorAgentId ??
                      "---"
                    }`,
                    currency: error?.errorPayment?.creditCurrency ?? "---",
                    amount: (
                      error?.errorPayment?.creditAmount || "---"
                    ).toString(),
                    type: error?.errorPayment?.creditorAccountType ?? "---"
                  }}
                  beneficiary
                />
                <AccordionAddress
                  address={{
                    ...error?.errorPayment?.creditor?.creditorAddress,
                    country:
                      error?.errorPayment?.creditorAgent
                        ?.creditorAgentCountry ?? "---"
                  }}
                />
              </div>
            </div>
            <Spacer size={15} />
            {/* <DataTable
                tableRows={error?.reference}
                openRows={openRows}
                setOpen={setOpen}
              /> */}

            {error.errorPayment.exitStatusCode === "E1" ? (
              <DataTable
                tableRows={error?.reference}
                openRows={openRows}
                setOpen={setOpen}
              />
            ) : (
              <></>
            )}
          </>
        )}
      </PageWrapper>
      <Modal
        title={`Reason to ${actionName}`}
        description={
          <>
            {reason === "" && okClicked ? (
              <>
                <Alert message="Please enter reason" type="error" showIcon />
                <Spacer size={13} />
              </>
            ) : (
              ""
            )}
            <Input type="textarea" label="Reason" onChange={handleChange} />
          </>
        }
        onOkText="Confirm"
        onCancelText="Cancel"
        onClickCancel={handleCancel}
        onClickOk={handleSubmit}
        onCancelBtn={!isLoading}
        buttonOkDisabled={isLoading}
        modalView={actionModal}
        modalWidth={600}
      />
    </main>
  );
};

export { ErrorQueueView as default };
