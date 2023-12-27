import { useEffect, useState } from "react";

import {
  Form,
  Button,
  Table,
  Spin,
  Pagination
} from "@payconstruct/design-system";
import { useNavigate } from "react-router-dom";
import {
  Header,
  HeaderContent,
  PageWrapper,
  Spacer,
  TableWrapper
} from "../../components";
import Filter from "./components/clientsFilter";
import { useGetClientsQuery } from "../../services/clientManagement";
import { useAppDispatch, useAppSelector } from "../../redux/hooks/store";
import {
  selectClientsFilterProps,
  updateClientFilterData,
  updateUsersPaginationProps
} from "../../config/ClientMangement/ClientManagementSlice";
import { capitalize } from "../../utilities/transformers";
import { AddNewClient } from "./Modal/AddNewClient";

import Styles from "./Clients.module.css";

const Clients = () => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const clientsFilterProps = useAppSelector(selectClientsFilterProps);

  const [showFilter, setToggleFilter] = useState<boolean>(false);
  const [listOfClients, setListOfClients] = useState<any[]>([]);
  const [isClientsFetching, setClientsFetching] = useState<boolean>(false);
  const [addNewClientShow, setAddNewClientShow] = useState<boolean>(false);
  const { allClients } = useAppSelector((state) => state.general);
  const noData = <p style={{ textAlign: "center" }}>---</p>;

  /* Client Api Query */
  const {
    refetch: getClients,
    response,
    totalListLength,
    isLoading,
    isFetching
  } = useGetClientsQuery(clientsFilterProps, {
    refetchOnMountOrArgChange: true,
    skip: clientsFilterProps?.current === 0,
    selectFromResult: ({
      data,
      isLoading,
      isSuccess,
      isError,
      isFetching
    }) => ({
      response: data?.data?.entities,
      totalListLength: data?.data?.total,
      isLoading,
      isSuccess,
      isError,
      isFetching
    })
  });

  useEffect(() => {
    dispatch(updateUsersPaginationProps({ current: 1, pageSize: 10 }));
    // eslint-disable-next-line
  }, []);

  /* Setting data to state, when data fetched successfully...  */
  useEffect(() => {
    setListOfClients(response);
    setClientsFetching(false);
    setToggleFilter(false);
    // eslint-disable-next-line
  }, [response]);

  /* Table Columns */
  const columns = [
    {
      key: "registeredCompanyName",
      title: "Registered Company Name",
      dataIndex: "genericInformation",
      render: (data: any) => {
        return data.registeredCompanyName ? (
          <Button label={data.registeredCompanyName} type="link" />
        ) : (
          noData
        );
      }
    },
    {
      key: "tradingName",
      title: "Trading Name",
      dataIndex: "genericInformation",
      render: (data: any) => {
        return data.tradingName ?? noData;
      }
    },
    {
      key: "riskCategory",
      title: "Risk Category",
      dataIndex: "riskCategory",
      render: (data: any) => {
        return getRiskCategoryLabel(data) ?? noData;
      }
    },
    {
      key: "KycStatus",
      title: "KYC Status",
      dataIndex: "kycInformation",
      render: (data: any) => {
        return data?.kycStatus !== "review_required"
          ? capitalize(data?.kycStatus)
          : "Review Required";
      }
    }
    // {
    //   key: "onboardingProgress",
    //   title: "Onboarding Progress",
    //   dataIndex: "companyStatus",
    //   render: (data: any) => {
    //     return capitalize(data);
    //   }
    // },
    // {
    //   key: "onboardingStatus",
    //   title: "Onboarding Status",
    //   dataIndex: "progressLogs",
    //   render: (data: any) => {
    //     const summary = getStatusSummary(data);
    //     return (
    //       <div style={{ display: "flex", alignItems: "center" }}>
    //         <Icon
    //           name={
    //             summary === "Not Yet Started." ? "warningAmber" : "checkCircle"
    //           }
    //           color={summary === "Not Yet Started." ? "#F6B217" : "green"}
    //           size="small"
    //         />
    //         {summary}
    //       </div>
    //     );
    //   }
    // },
    // {
    //   title: "Action",
    //   dataIndex: "icon",
    //   key: "action",
    //   render: () => {
    //     return <Icon name="settings" size="small" />;
    //   }
    // }
  ];

  const getRiskCategoryLabel = (
    category: string | undefined
  ): string | undefined => {
    if (category) {
      switch (category) {
        case "high_risk_one":
          return "High Risk One";
        case "high_risk_two":
          return "High Risk Two";
        case "high_risk_three":
          return "High Risk Three";
        case "medium":
          return "Medium";
        case "low":
          return "Low";
        default:
          return "";
      }
    }
    return undefined;
  };

  // /* Function will return shrinken label of onboarding status */
  // const getStatusSummary = (data: any) => {
  //   const progressList = [
  //     "isCompanyInformationDone",
  //     "isCompanyRequirementsDone",
  //     "isOperationInformationDone",
  //     "isRegulatoryInformationDone",
  //     "isDocumentsUploadedDone",
  //     "isCompanyStakeholdersAddedDone"
  //   ];
  //   /*
  //     Pre-check If user done full progress.
  //   */
  //   if (data[progressList[progressList.length - 1]]) {
  //     return "Company Stake Added.";
  //   }

  //   /*
  //     We Loop through the progress log and
  //     say if user done till operation info, next field reg info will be false,
  //     we minus the index from current one which is reg info and we return the corresponding that label.
  //   */
  //   for (let i = 0; i < progressList.length; i++) {
  //     if (data[progressList[i]] === false) {
  //       switch (i - 1) {
  //         case 0:
  //           return "Company Info.";
  //         case 1:
  //           return "Company Req.";
  //         case 2:
  //           return "Op. Info";
  //         case 3:
  //           return "Reg. Info";
  //         case 4:
  //           return "Doc Upload Done.";
  //         case 5:
  //           return "Company Stake Added.";
  //         default:
  //           return "Not Yet Started.";
  //       }
  //     }
  //   }
  // };

  /* On Pagination changes */
  const handlePaginationChange = (current: any, pageSize: any) => {
    dispatch(updateUsersPaginationProps({ current, pageSize }));
  };

  const handleFilterOnSubmit = (values: any) => {
    setClientsFetching(true);
    const companyName = allClients
      ?.filter((list: any) => values.companyName === list._id)
      .map((data: any) => {
        return data?.genericInformation?.registeredCompanyName;
      });
    const tradingName = allClients
      ?.filter((list: any) => values.tradingName === list._id)
      .map((data: any) => {
        return data?.genericInformation?.tradingName;
      });
    values.companyName = companyName;
    values.tradingName = tradingName;
    dispatch(updateClientFilterData(values));
    dispatch(
      updateUsersPaginationProps({ current: 1, pageSize: 10, ...values })
    );
    // setToggleFilter(false);
  };

  const handleOnFilterClose = () => setToggleFilter(false);

  return (
    <>
      <PageWrapper>
        <Header>
          <HeaderContent.LeftSide>
            <HeaderContent.Title>Clients List</HeaderContent.Title>
            <Button
              label="Add New Client"
              icon={{
                name: "add",
                position: "left"
              }}
              onClick={() => {
                form.resetFields();
                setAddNewClientShow(true);
              }}
              size="medium"
              type="primary"
              style={{ marginTop: "-4px" }}
            />
          </HeaderContent.LeftSide>
          <HeaderContent.RightSide>
            <Button
              label="Filters"
              onClick={() => setToggleFilter(true)}
              size="medium"
              type="tertiary"
              icon={{
                name: "filter",
                position: "left"
              }}
              style={{ marginTop: "-25px" }}
            />
          </HeaderContent.RightSide>
        </Header>
        <div className={Styles["test"]}></div>
        <Filter
          loading={isClientsFetching}
          toggleDrawer={showFilter}
          onClose={handleOnFilterClose}
          onSubmit={handleFilterOnSubmit}
        />
        <AddNewClient
          show={addNewClientShow}
          title={"Add New Client"}
          onCancelText={"Cancel"}
          onOkText={"Add Client"}
          toggleShow={(value) => setAddNewClientShow(value)}
          onClickCancel={() => {
            setAddNewClientShow(false);
            form.resetFields();
          }}
          onClickOk={() => {
            // !isCompanyInfoLoader && setShowCompanyInfoModal(false);
          }}
          refetchGetClients={getClients}
        />
        <Spin
          loading={
            clientsFilterProps.current === 1
              ? isLoading
              : isFetching || isLoading
          }
        >
          <TableWrapper>
            <Table
              rowKey={(record) => record?.id + record?.updatedAt}
              scroll={{ x: true }}
              dataSource={listOfClients}
              tableColumns={columns}
              pagination={false}
              tableSize="medium"
              rowClassName="trade-row--clickable"
              onRow={({ id }, rowIndex) => {
                return {
                  onClick: () => {
                    navigate(`/client/${id}`);
                  }
                };
              }}
            />
          </TableWrapper>
          <Spacer size={24} />
          <Pagination
            className={Styles["CP-pagination"]}
            {...clientsFilterProps}
            showSizeChanger
            pageSizeOptions={["10", "25", "50", "100"]}
            total={totalListLength}
            showTotal={(total: number, range: any) =>
              `${range[0]}-${range[1]} of ${total} items`
            }
            onChange={handlePaginationChange}
          />
        </Spin>
      </PageWrapper>
    </>
  );
};

export default Clients;
