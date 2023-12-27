import React, { useEffect, useState } from "react";

import {
  Search as Searcher,
  RadioCurrency,
  RadioGroup,
  Tag,
  Icon,
  Spin,
  Button
} from "@payconstruct/design-system";

import { useDebounce } from "../../../../../customHooks/useDebounce";
import { useGetClientBySearchQuery } from "../../../../../services/ControlCenter/endpoints/entitiesEndpoint";
import {
  getClientDetailResponse,
  CompanyDetailResponse
} from "../../../../../services/clientManagement";
import levenshtein from "fast-levenshtein";
import {
  useAppSelector,
  useAppDispatch
} from "../../../../../redux/hooks/store";
import { Spacer } from "../../../../../components/Spacer/Spacer";

import style from "../payerSelection.module.css";
import { capitalize } from "../../../../../utilities/transformers";

import { Pagination } from "../../../../../components/Pagination/Pagination";

import {
  selectPayerAction,
  selectedPayer as selectedPayerReducer,
  searchQuery as searchQueryReducer,
  updateSearchedData,
  searchedData,
  updateSearchQuery
} from "../payerSelectionSlice";
import { RadioChangeEvent, Empty } from "antd";
import { selectClientAction } from "../../../../Components/ClientSelection/ClientSelectionSlice";

interface SearchProps {
  onUserSearch?: (flag: boolean) => void;
  nextStepHandler?: () => void;
}
interface searchPayloadProps {
  query: string;
  kycStatus: string;
}

/**
 *
 * @component Search
 *
 * @props SearchProps
 *
 *
 * Search bar in payer selection
 *
 *
 */

const Search: React.FC<SearchProps> = ({ onUserSearch, nextStepHandler }) => {
  const dispatch = useAppDispatch();

  /* Api call payload */
  const [searchPayload, setSearchPayload] = useState<searchPayloadProps>({
    query: "",
    kycStatus: "pass"
  });

  const [searchValue, setSearchValue] = useState<string>("");

  const [clientList, setClientList] = useState<
    getClientDetailResponse["data"][]
  >([]);

  const [companyList, setCompanyList] = useState<
    CompanyDetailResponse["data"][]
  >([]);

  const [isUserSearching, setUserSearching] = useState<boolean>(false);

  const [currentList, setCurrentList] = useState<
    getClientDetailResponse["data"][] | CompanyDetailResponse["data"][]
  >([]);

  /* state to preventing the useEffect calling when component remounts */
  const [isDataPreserved, setIfDataPreserved] = useState<boolean>(false);

  /* Global State */
  const { companies } = useAppSelector((state) => state.general);
  const searchQuery = useAppSelector(searchQueryReducer);
  const selectedPayer = useAppSelector(selectedPayerReducer);
  const allList = useAppSelector(searchedData);

  /* Api call for user searching */
  const { clientsListResponse, isLoading, isFetching } =
    useGetClientBySearchQuery(searchPayload, {
      selectFromResult: ({ data, isLoading, isFetching }) => {
        return { clientsListResponse: data?.data, isLoading, isFetching };
      },
      skip: searchPayload.query === "" || isDataPreserved
    });

  /* when user starts searching, we trigger a function in parent component to hide */
  useEffect(() => {
    if (searchValue.length > 1 && !isUserSearching) {
      onUserSearch && onUserSearch(true);
      setUserSearching(true);
    } else if (searchValue.length < 1) {
      onUserSearch && onUserSearch(false);
      setUserSearching(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  /* setting the fetched clients data  */
  /* setting selected payer as default one after coming back in the process */
  useEffect(() => {
    const selectedPayerAsArr = selectedPayer && [selectedPayer];
    setClientList(clientsListResponse ?? selectedPayerAsArr);
  }, [clientsListResponse, selectedPayer]);

  /* updating both clients and company data */
  useEffect(() => {
    if (!isDataPreserved) {
      dispatch(updateSearchedData([...clientList, ...companyList]));
      setCurrentList([...clientList, ...companyList]?.slice(0, 10));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientList, companyList]);

  /* shifting the selected account to first, if user selected a account proceed next step and come back. */
  useEffect(() => {
    if (searchQuery !== "" && allList.length !== 0) {
      shiftAccountToFirst();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* when user starts typing adding a delay and update the state */
  useDebounce(
    () => {
      if (searchValue) {
        setSearchPayload({
          query: searchValue,
          kycStatus: "pass"
        });
        setCompanyList(searchByRegisteredName(searchValue));
        dispatch(updateSearchQuery(searchValue));
      }
    },
    350,
    [searchValue]
  );

  /* It will push the selected account to first, say if user selected a account in 3rd page and proceed to next step, when user come back we can't preserve the pagination where user left off, soo we can push the selected account to first instead */
  const shiftAccountToFirst = () => {
    const startIndex: number =
      allList?.findIndex((clients: getClientDetailResponse["data"]) => {
        return clients?.id === selectedPayer?.id;
      }) ?? -1;
    if (startIndex !== -1 && allList) {
      const shiftedAccount = [
        allList[startIndex],
        ...allList?.slice(0, startIndex),
        ...allList?.slice(startIndex + 1, allList.length)
      ];
      dispatch(updateSearchedData(shiftedAccount));
      setCurrentList(shiftedAccount?.slice(0, 10));
    }
    setUserSearching(true);
    setIfDataPreserved(true);
  };

  /* Search company accounts */
  const searchByRegisteredName = (value: string) => {
    return companies?.filter((company: CompanyDetailResponse["data"]) => {
      //Typed string
      const matcher = String(value).toUpperCase();
      const tradingName =
        company?.genericInformation?.tradingName?.toUpperCase() ?? "";
      const registeredCompanyName =
        company?.genericInformation?.registeredCompanyName?.toUpperCase() ?? "";

      if (levenshtein.get(tradingName, matcher) < 2) return true;
      if (tradingName.includes(matcher)) return true;

      if (levenshtein.get(registeredCompanyName, matcher) < 2) return true;
      if (registeredCompanyName.includes(matcher)) return true;

      return false;
    });
  };

  /* When users selects a card, we update in state */
  const handleRadioGrpChange = (evt: RadioChangeEvent) => {
    const client = currentList.find(
      (
        client: getClientDetailResponse["data"] | CompanyDetailResponse["data"]
      ) => client.id === evt.target.value
    );

    dispatch(selectPayerAction(client));
    dispatch(selectClientAction(client));
  };

  /* setting state of query which user typed */
  const handleOnType = ({
    target: { value }
  }: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(updateSearchQuery(value));
    setSearchValue(value);
  };
  return (
    <>
      <Searcher
        defaultValue={searchQuery}
        bordered={true}
        style={{ height: "auto" }}
        onChange={handleOnType}
        onClear={() => {}}
      />
      <Spacer size={20} />
      {isUserSearching || selectedPayer ? (
        <Spin loading={isLoading || isFetching}>
          <div className={style["payer-selection"]}>
            {currentList?.length > 0 || selectedPayer ? (
              <RadioGroup
                direction="horizontal"
                value={selectedPayer?.id} // Selected Client
                onChange={handleRadioGrpChange}
              >
                {currentList?.map(
                  (
                    client:
                      | getClientDetailResponse["data"]
                      | CompanyDetailResponse["data"],
                    index: number
                  ) => {
                    const { id, genericInformation, type } = client;

                    return (
                      <RadioCurrency
                        key={id ?? `client_${index}`}
                        title={
                          genericInformation?.registeredCompanyName ??
                          "Registered Company Name"
                        }
                        description={
                          <div className={style["payer-selection--radioDesp"]}>
                            <div>
                              {genericInformation?.tradingName ??
                                "Trading Name"}
                            </div>
                            <div
                              className={style["payer-selection--radioText"]}
                            >
                              <Tag
                                isPrefix
                                label={capitalize(type)}
                                prefix={
                                  <Icon
                                    name={
                                      type === "client" ? "user" : "business"
                                    }
                                    size="extraSmall"
                                  />
                                }
                              />
                            </div>
                          </div>
                        }
                        showTooltip
                        checked={id === selectedPayer?.id}
                        defaultChecked={id === selectedPayer?.id}
                        value={id}
                      />
                    );
                  }
                )}
              </RadioGroup>
            ) : (
              <Empty
                description={
                  <span>
                    No results found for <strong>{searchValue}</strong>
                  </span>
                }
                image={Empty.PRESENTED_IMAGE_DEFAULT}
              />
            )}
          </div>
          <Spacer size={40} />
          <Pagination
            list={allList ?? []}
            pageSize={10}
            onChange={(
              list:
                | getClientDetailResponse["data"][]
                | CompanyDetailResponse["data"][]
            ) => {
              setCurrentList(list);
              isDataPreserved && setIfDataPreserved(false);
            }}
          />
          <Spacer size={40} />
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            {/* <Button
              onClick={previousStepHandler}
              type="secondary"
              label="Previous"
              icon={{
                name: "leftArrow",
                position: "left"
              }}
            /> */}
            <Button
              disabled={!Boolean(selectedPayer?.id)}
              onClick={() => {
                nextStepHandler && nextStepHandler();
              }}
              type="primary"
              label="Continue"
              icon={{
                name: "rightArrow",
                position: "right"
              }}
            />
          </div>
        </Spin>
      ) : (
        <Empty
          description={<span>Please search the client / company</span>}
          image={Empty.PRESENTED_IMAGE_DEFAULT}
        />
      )}
    </>
  );
};

export default Search;
