import React, { useEffect, useRef, useState } from "react";
import { Colors, Col, Row } from "@payconstruct/design-system";
import { useParams } from "react-router-dom";
import { Account, useGetAccountsQuery } from "../../../services/accountService";
import { useGetTradeByIDQuery } from "../../../services/tradesService";
import { Spinner } from "../../../components/Spinner/Spinner";
import { useGetClientQuery } from "../../../services/ControlCenter/ccService";
import useElementSize from "../../../customHooks/useElementSize";
import { TradeQueue } from "../Components/TradeQueue/TradeQueue";
import { Empty } from "antd";
import { AcceptedOffer } from "./AcceptedOffer/AcceptedOffer";
import { DepositInformation } from "./DepositInformation";
import { Spacer } from "../../../components/Spacer/Spacer";
import { AcceptOrDeclineOffer } from "./Actions/AcceptOrDeclineOffer";
import { useGetDepositsQuery } from "../../../services/ExoticFX/Finance/endpoints/depositEndpoints";

const TradeOffer: React.FC = () => {
  let { id = "" } = useParams<{ id: string }>();
  const queueRef = useRef(null);
  const { width } = useElementSize(queueRef);

  const {
    refetch,
    data: selectedTrade,
    isLoading: isLoadingTrade
  } = useGetTradeByIDQuery(
    { id },
    {
      refetchOnMountOrArgChange: true
    }
  );

  let { data: clientData } = useGetClientQuery({
    clientId: selectedTrade?.clientId
  });

  const userData = clientData?.data?.user[0] ?? {};

  const { accountsData = [] } = useGetAccountsQuery("Accounts", {
    refetchOnMountOrArgChange: 10,
    selectFromResult: ({ data, isLoading, isFetching, isError, isSuccess }) => {
      return {
        accountsData: data?.data?.accounts as Account[],
        isLoading,
        isFetching,
        isError,
        isSuccess
      };
    }
  });

  const [polling, setPolling] = useState(2000);
  const [counter, setCounter] = useState(3);

  const {
    data: depositList,
    refetch: refetchDeposits,
    isLoading: isLoadingDeposits
    // isFetching: isFetchingDeposits
  } = useGetDepositsQuery(
    { id },
    {
      skip:
        selectedTrade?.status === "new_client_order" ||
        selectedTrade?.status === "pending_approval_client",
      refetchOnMountOrArgChange: true,
      pollingInterval: polling //* Polling interval in ms for deposits until we have data.
    }
  );

  console.log(depositList);

  useEffect(() => {
    if (
      (depositList?.deposits && depositList?.deposits.length > 0) ||
      counter === 0
    ) {
      setPolling(0);
    }
    setCounter(counter - 1);
  }, [depositList]);

  const selectedAccount = accountsData?.find(
    (account) => account.id === selectedTrade?.buyAccountId
  );

  const customStyles = {
    padding: `0px 40px 0px ${width + 40}px`,
    background: Colors.grey.neutral50,
    minHeight: "calc(100vh - 56px)"
  };

  return (
    <Row gutter={0}>
      {isLoadingTrade && (
        <div style={{ height: "calc(100vh)", width: "100%" }}>
          <Spinner />
        </div>
      )}
      <Col xs={24} sm={24} md={24} lg={24} xl={24}>
        <TradeQueue ref={queueRef} style={{ position: "fixed" }} />

        <main style={customStyles}>
          {!selectedTrade ? (
            <Empty
              description={
                <span>
                  Trade Reference was not found: <b>{id}</b>
                </span>
              }
            />
          ) : (
            <>
              <AcceptedOffer
                userData={userData}
                refetchDeposits={refetchDeposits}
                refetch={refetch}
                trade={selectedTrade}
                account={selectedAccount}
                style={{ marginLeft: "0px" }}
                depositList={depositList}
              />

              <DepositInformation
                depositList={depositList}
                depositLoadingOrFetching={isLoadingDeposits}
                userData={userData}
                trade={selectedTrade}
                account={selectedAccount}
                style={{ marginLeft: "0px" }}
              />

              <Spacer size={15} />

              <AcceptOrDeclineOffer
                onAccept={() => {
                  refetchDeposits();
                }}
              />
            </>
          )}
        </main>
      </Col>
    </Row>
  );
};

export { TradeOffer as default };
