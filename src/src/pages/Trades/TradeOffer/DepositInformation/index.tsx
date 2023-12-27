import {
  Col,
  Row,
  Accordions,
  Status,
  Button,
  Modal,
  Colors,
  Icon
} from "@payconstruct/design-system";
import React, { CSSProperties, useMemo, useState } from "react";
import { FormattedNumber, useIntl } from "react-intl";
import { ReceiptModal } from "../../Components/Modal/Receipt/ReceiptModal";
import { RemittanceModal } from "../../Components/Modal/Remittance/RemittanceModal";
import { Spacer } from "../../../../components/Spacer/Spacer";
import { EFXOrder } from "@payconstruct/pp-types";
import { Spin } from "antd";
import { useParams } from "react-router";
import { useGetBeneficiaryIdQuery } from "../../../../services/beneficiaryService";
import {
  Account,
  useGetAccountQuery
} from "../../../../services/accountService";
import { setNotification } from "../../Helpers/currencyTag";
import { generatePresignedDownload } from "../../Helpers/imageUploader";
import { useAuth } from "../../../../redux/hooks/useAuth";
import { Spinner } from "../../../../components/Spinner/Spinner";
import { useOvernight } from "../../../../customHooks/useOvernight";
import { DepositAccordion } from "./Deposits/DepositAccordion";

import {
  DepositDetailsForm,
  NewVendorAccount
} from "../../Components/Modal/NewVendorAccount/NewVendorAccount";
import {
  OrderDepositDetails,
  VendorDetailsResponse
} from "../../../../services/ExoticFX/Finance/financeService";
import {
  useConfirmDepositMutation,
  useConfirmRemittanceMutation
} from "../../../../services/ExoticFX/Finance/endpoints/depositEndpoints";
import { useAppSelector, useAppDispatch } from "../../../../redux/hooks/store";
import {
  setAccordion,
  selectAccordion
} from "../../../../config/general/generalSlice";

interface DepositInformationProps {
  depositList?: VendorDetailsResponse;
  depositLoadingOrFetching: boolean;
  trade: EFXOrder;
  account?: Account;
  style?: CSSProperties;
  userData: any;
}
const DepositInformation: React.FC<DepositInformationProps> = ({
  depositList,
  depositLoadingOrFetching,
  trade,
  style
}) => {
  let { id } = useParams<{ id: string }>();
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isRemittanceModalOpen, setIsRemittanceModalOpen] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState<OrderDepositDetails>();
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<string[]>([]);
  const [image, setImage] = useState("");
  const [imageParams, setImageParams] = useState({
    orderId: "",
    vendorId: "",
    accountId: "",
    fileName: "",
    type: ""
  });
  const [imageModal, setImageModal] = useState(false);
  const dispatch = useAppDispatch();
  const accordion = useAppSelector(selectAccordion);

  const { auth } = useAuth();
  const intl = useIntl();
  const [confirmDeposit] = useConfirmDepositMutation();
  const [confirmRemittance] = useConfirmRemittanceMutation();
  //@ts-ignore
  const { isDay1 } = useOvernight(id);

  useGetAccountQuery(
    {
      accountId: trade?.sellAccountId ?? ""
    },
    { skip: trade?.sellAccountId === undefined }
  );

  let { data: beneficiaryData } = useGetBeneficiaryIdQuery(
    {
      id: trade?.beneficiaryId ?? ""
    },
    { skip: trade?.beneficiaryId === undefined }
  );

  if (Array.isArray(beneficiaryData)) {
    beneficiaryData = undefined;
  }

  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositDetail, setDepositDetail] = useState<DepositDetailsForm>();

  const handleImagePreview = async (
    record: any,
    text: string,
    type: string
  ) => {
    // console.log("Text Available:", text);

    setImageModal(true);
    setLoading(true);
    const res = await generatePresignedDownload(
      `orderId=${record.orderId}&vendorId=${record.vendorId}&accountId=${record.accountId}&fileName=${text}&type=${type}`,
      auth.token
    );
    setImageParams({
      orderId: record.orderId,
      vendorId: record.vendorId,
      accountId: record.accountId,
      fileName: text,
      type
    });

    setImage(res);
    setLoading(false);
  };

  const download = async () => {
    var element = document.createElement("a");
    const res = await generatePresignedDownload(
      `orderId=${imageParams.orderId}&vendorId=${imageParams.vendorId}&accountId=${imageParams.accountId}&fileName=${imageParams.fileName}&type=${imageParams.type}`,
      auth.token
    );
    element.href = res;
    element.download = imageParams.fileName;
    element.click();
  };

  const columns = [
    {
      key: "expected",
      title: "Expected Deposit Amount",
      dataIndex: "expected",
      render: (value: number, record: OrderDepositDetails) => {
        return (
          <FormattedNumber
            value={value}
            // eslint-disable-next-line
            style="currency"
            currency={record.currency}
          />
        );
      }
    },
    {
      key: "remitted",
      title: "Remitted Amount",
      dataIndex: "remitted",
      render: (value: number, record: OrderDepositDetails) => {
        return (
          <FormattedNumber
            value={value}
            // eslint-disable-next-line
            style="currency"
            currency={record.currency}
          />
        );
      }
    },
    {
      key: "accountNumber",
      title: "Account Number",
      dataIndex: "accountNumber",
      textWrap: "word-break",
      ellipsis: true
    },
    {
      key: "notes",
      title: "Deposit Information",
      textWrap: "word-break",
      ellipsis: true,
      dataIndex: "notes",
      render: (text: string, record: OrderDepositDetails) => {
        const vendorName =
          depositList?.deposits?.filter(
            (vendor) => vendor.vendorId === record.vendorId
          )[0].name || "";

        return (
          <Button
            type="link"
            label={"See more"}
            onClick={() => {
              setShowDepositModal(true);
              setDepositDetail({
                accountNumber: record.accountNumber,
                instructions: record.instructions,
                notes: record.notes,
                remitted: record.remitted,
                expected: record.expected,
                deposited: record.deposited,
                maxAmount: record.maxAmount,
                minAmount: record.minAmount,
                leg: "exchange",
                vendorName,
                vendorId: record.vendorId,
                currency: record.currency,
                orderId: record.orderId,
                time: record.time,
                timeZone: record.timeZone
              });
            }}
          />
        );
      }
    },
    {
      key: "depositDocument",
      title: "Receipt",
      width: 300,
      textWrap: "word-break",
      ellipsis: true,
      dataIndex: "depositDocument",
      render: (listOfImages: string[], record: OrderDepositDetails) => {
        const locked =
          depositList &&
          depositList?.deposits?.length > 0 &&
          depositList?.deposits?.filter((item) => item.leg === record.type)[0]
            ?.locked;

        if (typeof listOfImages === "string") listOfImages = [listOfImages];

        const list = showListOfImages(listOfImages ?? [], record);

        return (
          <>
            {record.status === "pending_deposit" && (
              <Button
                label="Confirm Receipt"
                onClick={() => {
                  setIsReceiptModalOpen(true);
                  setSelectedDeposit(record);
                }}
                size="small"
                type="primary"
                disabled={!locked || trade?.status === "cancelled"}
              />
            )}
            {list}
          </>
        );
      }
    },
    {
      key: "remittanceDocument",
      title: "Remittance",
      dataIndex: "remittanceDocument",
      width: 300,
      textWrap: "word-break",
      ellipsis: true,
      render: (listOfImages: string[], record: any, index: any) => {
        const locked = depositList?.deposits?.filter(
          (item) => item.leg === record.type
        )[0]?.locked;
        const exchangeLocked = depositList?.deposits?.filter(
          (item) => item.leg === "exchange"
        )[0]?.locked;

        if (
          record.status === "pending_deposit" ||
          record.status === "pending_remittance"
        ) {
          return (
            <Button
              disabled={
                record.status === "pending_deposit" ||
                locked === false ||
                trade?.status === "cancelled" ||
                (trade?.depositType === "overnight" &&
                  (!isDay1 || trade?.financials?.status !== "approved")) ||
                (record.type === "local" && !exchangeLocked)
              }
              label="Confirm Remittance"
              onClick={() => {
                setIsRemittanceModalOpen(true);
                setSelectedDeposit(record);
              }}
              size="small"
              type="primary"
            />
          );
        }
        if (typeof listOfImages === "string") listOfImages = [listOfImages];
        return showListOfImages(listOfImages ?? [], record);
      }
    },
    {
      key: "status",
      title: "Status",
      dataIndex: "status",
      fixed: "right",
      render: (text: string) => {
        if (text === "complete")
          return <Status type="approved" tooltipText={text} />;

        return <Status type="pending" tooltipText={text} />;
      }
    }
  ];

  const showListOfImages = (listOfImages: string[], tableRecord: any) => {
    return listOfImages.map((img) => {
      return (
        <div
          style={{
            display: "flex",
            color: Colors.blue.blue900,
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          <Icon name="eyeOpened" color={Colors.blue.blue900} />
          <p
            style={{ marginBottom: "0px" }}
            onClick={() => handleImagePreview(tableRecord, img, "deposit")}
          >
            {img}
          </p>
        </div>
      );
    });
  };

  const handleClickConfirmReceipt = async (data: any) => {
    setLoading(true);
    const currentImageList = selectedDeposit?.depositDocument ?? [];

    try {
      await confirmDeposit({
        amount: parseFloat(data.amount),
        orderId: trade?.id,
        key: selectedDeposit?.key,
        document: [...documents, ...currentImageList]
      }).unwrap();

      setNotification(
        intl.formatMessage({ id: "Receipt Confirmed" }),
        intl.formatMessage({ id: "Receipt confirmed successfully" }),
        "success"
      );

      setIsReceiptModalOpen(false);
    } catch (err: any) {
      setNotification(
        intl.formatMessage({ id: "Confirm Receipt Failed" }),
        "",
        // intl.formatMessage({ id: err.data.error }),
        "error"
      );
    }
    setDocuments([]);
    setLoading(false);
  };

  const handleClickConfirmRemittance = async (data: {
    deposits: OrderDepositDetails[];
    amount: string;
  }) => {
    let body = {};
    if (data.deposits.length) {
      body = {
        batch: data.deposits?.map((deposit: OrderDepositDetails) => {
          return {
            key: deposit.SK, //SK is the key of the deposit
            orderId: deposit.orderId
          };
        }),
        amount: parseFloat(data.amount),

        // amount: data.deposits
        //   ?.map((deposit: OrderDepositDetails) => parseFloat(deposit.expected))
        //   .reduce((a: any, b: any) => a + b, 0),

        document: documents
      };
    } else {
      body = {
        batch: [
          {
            key: selectedDeposit?.key,
            orderId: selectedDeposit?.orderId
          }
        ],
        amount: parseFloat(data.amount),
        document: documents
      };
    }

    try {
      setLoading(true);
      const res = await confirmRemittance(body).unwrap();

      setIsRemittanceModalOpen(false);
      if (res) {
        setNotification(
          intl.formatMessage({ id: "Remittance Confirmed" }),
          intl.formatMessage({ id: "Remittance confirmed successfully" }),
          "success"
        );
      }
    } catch (err) {
      setNotification(
        intl.formatMessage({ id: "Confirm Remittance failed" }),
        "",
        // intl.formatMessage({ id: error.data.error }),
        "error"
      );
    }
    setDocuments([]);
    setLoading(false);
  };

  // Each Leg must be locked
  // Each leg must be completed
  const depositStatus = useMemo(() => {
    const flatDeposits =
      depositList?.deposits?.map((leg) => leg.deposits).flat() || [];

    if (flatDeposits.length === 0) {
      return "rejected";
    }

    return depositList?.deposits
      ?.map((leg) => {
        if (leg.locked === false) return false;
        return leg.deposits.filter((deposit) => {
          return deposit.status !== "complete";
        });
      })
      .flat().length === 0
      ? "approved"
      : "pending";
  }, [depositList]);

  const handleCancelModal = () => {
    setIsReceiptModalOpen(false);
    setIsRemittanceModalOpen(false);
    setDocuments([]);
  };

  const handleAccordionChange = (key: string, uncollapse: boolean) => {
    const obj = { ...accordion, [key]: uncollapse };
    dispatch(setAccordion(obj));
  };

  return (
    <Col xs={24} sm={24} md={24} lg={24} xl={24} style={style}>
      <Row gutter={15}>
        <Col span={24}>
          <Accordions
            onChange={(e) =>
              handleAccordionChange(
                "unCollapseDepositInformation",
                Boolean(e.length)
              )
            }
            unCollapse={accordion?.unCollapseDepositInformation}
            accordionType="simple"
            header="Deposit Information"
            headerRight={
              <Status
                tooltipText={
                  depositStatus === "approved"
                    ? "Deposits completed"
                    : depositStatus === "pending"
                    ? "Deposits incomplete"
                    : "No deposits yet"
                }
                type={depositStatus}
              />
            }
            text={
              <>
                {depositLoadingOrFetching ? (
                  <Spinner />
                ) : (
                  <>
                    <DepositAccordion
                      tableColumns={columns}
                      filterByLegType="local"
                      deposits={depositList?.deposits}
                      orderStatus={trade?.status}
                    />
                    <Spacer size={15} />
                    <DepositAccordion
                      tableColumns={columns}
                      filterByLegType="exchange"
                      deposits={depositList?.deposits}
                      orderStatus={trade?.status}
                    />
                  </>
                )}
              </>
            }
          />
        </Col>
      </Row>
      {depositDetail && (
        <NewVendorAccount
          viewOnly={true}
          vendor={depositDetail}
          show={showDepositModal}
          onClickOk={() => {
            setShowDepositModal(false);
          }}
          onClickCancel={() => {
            setShowDepositModal(false);
          }}
        />
      )}
      {isReceiptModalOpen && (
        <ReceiptModal
          documents={documents}
          loading={loading}
          onClickOk={handleClickConfirmReceipt}
          onClickCancel={handleCancelModal}
          setDocuments={setDocuments}
          deposit={selectedDeposit}
        />
      )}
      {isRemittanceModalOpen && selectedDeposit && (
        <RemittanceModal
          loading={loading}
          setLoading={setLoading}
          deposit={selectedDeposit}
          setDocuments={setDocuments}
          documents={documents}
          trade={trade}
          onClickOk={handleClickConfirmRemittance}
          onClickCancel={handleCancelModal}
        />
      )}
      <Modal
        modalView={imageModal}
        title={"Image Preview"}
        onCancelText={"Cancel"}
        onOkText={"Download"}
        buttonOkDisabled={loading}
        onClickCancel={() => {
          setImageModal(false);
          setImage("");
          setImageParams({
            orderId: "",
            vendorId: "",
            accountId: "",
            fileName: "",
            type: ""
          });
        }}
        onClickOk={download}
        description={
          <div
            style={{
              textAlign: "center"
            }}
          >
            {loading ? (
              <Spin />
            ) : (
              <img
                alt="preview"
                src={image}
                style={{
                  maxWidth: "90%",
                  maxHeight: "300px"
                }}
              />
            )}
          </div>
        }
      />
    </Col>
  );
};

export { DepositInformation };
