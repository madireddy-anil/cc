import React from "react";
import { Table, Icon } from "@payconstruct/design-system";
import { Space } from "antd";
import { useNavigate } from "react-router-dom";
import { TableWrapper } from "../../../../components/Wrapper/TableWrapper";
import { PaginationDynamic } from "../../../../components/Pagination/PaginationDynamic";
import { Spacer } from "../../../../components/Spacer/Spacer";

import {
  fractionFormat,
  getCurrencyName
} from "../../../../utilities/transformers";
import { Account } from "../../../../services/accountService";
import {
  selectClients,
  selectCompanies
  // selectVendors
} from "../../../../config/general/generalSlice";
import {
  selectAppliedPagination,
  updateChildPageView
} from "../../../../config/account/accountSlice";

import { useGetBrandsQuery } from "../../../../services/ControlCenter/endpoints/optionsEndpoint";
import { useAppSelector, useAppDispatch } from "../../../../redux/hooks/store";
import { updateSelectedProduct } from "../../../../config/general/generalSlice";
import { selectCurrencies } from "../../../../config/currencies/currenciesSlice";
import { EntitiesResponse } from "../../../../services/ControlCenter/endpoints/entitiesEndpoint";

type AccountType = {
  type: string;
  name: string;
};

type AccountKeyType = keyof AccountType;

interface PropTypes {
  accountsData: Account[];
  handleChangePage: (pageNumber: number, pageSize: number) => void;
  accountsTotal: number;
  isFetching?: boolean;
  vendorsList: EntitiesResponse["data"]["entities"];
  // setChildPage: () => void;
}

const statusIcon = (iconName: keyof typeof icons) => {
  const icons = [
    {
      name: "active",
      icon: "checkCircle"
    },
    {
      name: "inactive",
      icon: "closeCircle"
    },
    {
      name: "closed",
      icon: "closeCircle"
    },
    {
      name: "blocked",
      icon: "exclamationCircleOutline"
    }
  ];
  const icon: any = icons.find((icon) => icon.name === iconName);
  return icon ? icon.icon : "error";
};

const getAccountType = (accountType: AccountKeyType) => {
  const accountTypes: Array<AccountType> = [
    {
      type: "client",
      name: "Client"
    },
    {
      type: "pl",
      name: "P&L"
    },
    {
      type: "vendor_client",
      name: "Vendor Client"
    },
    {
      type: "vendor_pl",
      name: "Vendor P&L"
    },
    {
      type: "suspense",
      name: "Suspense"
    }
  ];
  const type: AccountType | undefined = accountTypes.find(
    (obj) => obj.type === accountType
  );
  return type ? type.name : "";
};

const ListView: React.FC<PropTypes> = ({
  accountsData,
  handleChangePage,
  accountsTotal,
  isFetching = true,
  vendorsList
  // setChildPage
}) => {
  const navigate = useNavigate();
  const currenciesList = useAppSelector(selectCurrencies);
  const dispatch = useAppDispatch();

  // const { appliedPaginationProperty } = useAppSelector(
  //   (state) => state.account
  // );

  const appliedPaginationProperty: any = useAppSelector(
    selectAppliedPagination
  );

  const client: any = useAppSelector(selectClients);
  // const vendor: any = useAppSelector(selectVendors);
  const companies: any = useAppSelector(selectCompanies);

  const getOwner = (ownerEntityId: any) => {
    const ownerEntity = [...client, ...vendorsList, ...companies]?.find(
      (rec: any) => rec?.id === ownerEntityId
    );
    return ownerEntity?.genericInformation?.registeredCompanyName ?? "---";
  };

  //TODO Review Pull Rate and possible API Updates
  const { brandsObj } = useGetBrandsQuery(
    {},
    {
      refetchOnMountOrArgChange: 60,
      selectFromResult: ({ data, isLoading, isFetching }) => {
        let brands: any = [];

        data?.data.brands.forEach((item) => {
          brands[item.id] = item.brand;
        });

        return {
          brandsObj: data?.data?.brands,
          brandsData: brands,
          isLoading,
          isFetching
        };
      }
    }
  );

  return (
    <>
      <TableWrapper>
        <Table
          loading={isFetching}
          rowKey={(record) => record.id}
          scroll={{ x: true }}
          pagination={false}
          onRow={(rec) => {
            return {
              onClick: () => {
                if (brandsObj) {
                  dispatch(
                    updateSelectedProduct(
                      brandsObj[0]?.products?.find(
                        (product: any) => product.id === rec?.productId
                      )?.product
                    )
                  );
                }
                dispatch(updateChildPageView(true));
                navigate(`/account/${rec?.id}`);
              }
            };
          }}
          rowClassName="account-list-view-row"
          // dataSource={currentPage}
          dataSource={accountsData}
          tableColumns={[
            {
              dataIndex: "ownerEntityId",
              key: "ownerEntityId",
              title: "Owner",
              render: (ownerEntityId: any) => {
                return getOwner(ownerEntityId);
              }
            },
            {
              dataIndex: "accountIdentification",
              defaultSortOrder: "descend",
              title: "Account",
              render: (accountIdentification?: {
                accountNumber: string;
                IBAN: string;
              }) => {
                if (accountIdentification?.accountNumber)
                  return accountIdentification?.accountNumber;
                else if (accountIdentification?.IBAN)
                  return accountIdentification?.IBAN;

                return "---";
              }
            },
            {
              dataIndex: "accountName",
              key: "accountName",
              title: "Account Name"
            },
            // TODO: If there is no IBAN on Response we will only use accountNumber
            // {
            //   dataIndex: "accountNumber",
            //   key: "accountNumber",
            //   title: "Account Number",
            //   ellipsis: true
            // },
            {
              dataIndex: "accountType",
              key: "accountType",
              title: "Account Type",
              render: (accountType: AccountKeyType) =>
                getAccountType(accountType)
            },
            {
              dataIndex: "",
              key: "product",
              title: "Product",
              ellipsis: true,
              render: (record: any) => {
                if (brandsObj) {
                  const products: any = brandsObj[0].products;
                  const filteredProduct = products.find(
                    (product: any) => product.id === record?.productId
                  );

                  return filteredProduct?.product ?? "---";
                }
              }
            },
            {
              dataIndex: "",
              key: "currency",
              title: "Currency",
              render: (record: any) =>
                getCurrencyName(
                  record?.mainCurrency,
                  record?.currency,
                  currenciesList
                )
            },
            {
              dataIndex: "balance",
              key: "balance",
              title: "Available Balance",
              render: (balance: Account["balance"]) => {
                return fractionFormat(parseFloat(balance?.availableBalance));
              }
            },
            {
              dataIndex: "balance",
              key: "totalBalance",
              title: "Total Balance",
              render: (balance: any) => {
                return fractionFormat(parseFloat(balance?.balance));
              }
            },
            {
              dataIndex: "accountStatus",
              key: "accountStatus",
              title: "Status",
              render: (status: keyof typeof statusIcon) => {
                return (
                  <Space size={5}>
                    <Icon name={statusIcon(status)} size="medium" />
                    <div style={{ paddingBottom: 5 }} className="uc-first">
                      {status}
                    </div>
                  </Space>
                );
              }
            }
          ]}
          tableSize="medium"
        />
      </TableWrapper>
      <Spacer size={40} />
      <PaginationDynamic
        list={accountsData}
        accountsTotal={accountsTotal}
        onChange={handleChangePage}
        /* Using Reducer state */
        pageSize={appliedPaginationProperty.pageSize}
        pageNumber={appliedPaginationProperty.pageNumber}
        pageOption={["5", "10", "15", "50", "100"]}
      />
    </>
  );
};

export { ListView as default };
