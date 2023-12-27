import React from "react";
import {
  Button,
  RadioCurrency,
  RadioGroup,
  Tag,
  Icon
} from "@payconstruct/design-system";
import { Header, HeaderContent } from "../../../components/PageHeader/Header";
import { Spacer } from "../../../components/Spacer/Spacer";
import {
  useGetAllClientsQuery,
  useGetCompaniesQuery
} from "../../../services/ControlCenter/endpoints/entitiesEndpoint";
import style from "./clientSelection.module.css";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks/store";
import {
  selectClient,
  selectClientAction,
  selectFilteredClientList,
  selectCurrentPageList,
  selectCurrentPage,
  changePageAction,
  shiftSelectedAccount
} from "./ClientSelectionSlice";
import { RadioChangeEvent } from "antd/lib/radio";
import { ClientSearch } from "./ClientSearch/Search";
import { Pagination } from "../../../components/Pagination/Pagination";
import { Spinner } from "../../../components/Spinner/Spinner";
import { capitalize } from "../../../utilities/transformers";

interface ClientSelectionProps {
  nextStepHandler?: () => void;
}

const ClientSelection: React.FC<ClientSelectionProps> = ({
  nextStepHandler
}) => {
  const dispatch = useAppDispatch();

  const selectedClient = useAppSelector(selectClient);
  const selectFilteredList = useAppSelector(selectFilteredClientList);
  const currentPageList = useAppSelector(selectCurrentPageList);
  const resetPagination = useAppSelector(selectCurrentPage);

  const { companiesList, isFetchingCompanies } = useGetCompaniesQuery(
    { limit: 0, page: 1 },
    {
      selectFromResult: ({ data, isLoading, isFetching }) => {
        return {
          companiesList: data?.data?.entities ?? [],
          isLoadingCompanies: isLoading,
          isFetchingCompanies: isFetching
        };
      },
      refetchOnMountOrArgChange: 15
    }
  );

  const { clientList, isFetchingClients } = useGetAllClientsQuery(
    {},
    {
      selectFromResult: ({ data, isLoading, isFetching }) => {
        return {
          clientList: data?.data?.entities ?? [],
          isLoadingClients: isLoading,
          isFetchingClients: isFetching
        };
      },
      refetchOnMountOrArgChange: 15
    }
  );

  const onChange = (e: RadioChangeEvent) => {
    const client = [...clientList, ...companiesList].find(
      (client: any) => client.id === e.target.value
    );

    dispatch(selectClientAction(client));
  };

  return (
    <section>
      <Header>
        <HeaderContent.Title subtitle="Select a payer to start">
          Payer Selection
        </HeaderContent.Title>
      </Header>
      {isFetchingCompanies || isFetchingClients ? (
        <Spinner />
      ) : (
        <>
          <ClientSearch searchData={[...clientList, ...companiesList]} />
          <Spacer size={20} />
          <div className={style["client-selection"]}>
            <RadioGroup
              direction="horizontal"
              value={selectedClient?.id} //Selected Client
              onChange={onChange}
            >
              {currentPageList?.map((client: any, index: number) => {
                const { id, genericInformation, type } = client;

                return (
                  <RadioCurrency
                    key={id ?? `client_${index}`}
                    title={
                      genericInformation?.registeredCompanyName ??
                      "registered Company Name"
                    }
                    description={
                      <div className={style["client-selection--radioDesp"]}>
                        <div>
                          {genericInformation?.tradingName ?? "trading Name"}
                        </div>
                        <div className={style["client-selection--radioText"]}>
                          <Tag
                            isPrefix
                            label={capitalize(type)}
                            prefix={
                              <Icon
                                name={type === "client" ? "user" : "business"}
                                size="extraSmall"
                              />
                            }
                          />
                        </div>
                      </div>
                    }
                    showTooltip
                    checked={id === selectedClient?.id}
                    defaultChecked={id === selectedClient?.id}
                    value={id}
                  />
                );
              })}
            </RadioGroup>
          </div>
          <Spacer size={40} />
          <Pagination
            reset={resetPagination}
            list={selectFilteredList ?? []}
            pageSize={5}
            onChange={(list) => {
              dispatch(changePageAction(list));
            }}
          />
          <Spacer size={40} />
          <Button
            disabled={selectedClient?.id ? false : true}
            onClick={() => {
              nextStepHandler && nextStepHandler();
              dispatch(shiftSelectedAccount());
            }}
            type="primary"
            label="Continue"
            icon={{
              name: "rightArrow",
              position: "right"
            }}
          />
        </>
      )}
    </section>
  );
};

export { ClientSelection as default };
