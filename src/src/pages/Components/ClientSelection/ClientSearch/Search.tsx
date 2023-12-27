import { Search } from "@payconstruct/design-system";
import { useEffect, useState } from "react";
import { useDebounce } from "../../../../customHooks/useDebounce";
import levenshtein from "fast-levenshtein";
import { useAppDispatch, useAppSelector } from "../../../../redux/hooks/store";
import { setFilteredClients, resetPagination } from "../ClientSelectionSlice";

// Todo make this a Generic component that search and return searched values
interface ClientSearchProps {
  searchData?: any[];
}

const ClientSearch: React.FC<ClientSearchProps> = ({ searchData }) => {
  const dispatch = useAppDispatch();
  const [searchValue, setSearchValue] = useState<string>();

  const { selectedClient } = useAppSelector((state) => state.client);

  useEffect(() => {
    if (!searchValue) {
      dispatch(resetPagination(false));
      const startIndex: number =
        searchData?.findIndex((clients) => {
          return clients?.id === selectedClient?.id;
        }) ?? 0;
      let arr: any = searchData;
      if (startIndex > 0 && searchData) {
        arr = [
          searchData[startIndex],
          ...searchData?.slice(0, startIndex),
          ...searchData?.slice(startIndex + 1, searchData.length)
        ];
      }
      dispatch(setFilteredClients(arr));
    }
    // eslint-disable-next-line
  }, []);

  useDebounce(
    () => {
      if (searchValue) {
        const client = searchByTradingName(searchValue) ?? [];
        dispatch(resetPagination(true));
        dispatch(setFilteredClients(client));
        return;
      }

      dispatch(resetPagination(false));
      dispatch(setFilteredClients(searchData));
    },
    350,
    [searchValue]
  );

  const searchByTradingName = (value: any) => {
    return searchData?.filter((client) => {
      //Typed string
      const matcher = String(value).toUpperCase();
      const tradingName =
        client?.genericInformation?.tradingName?.toUpperCase() ?? "";
      const registeredCompanyName =
        client?.genericInformation?.registeredCompanyName?.toUpperCase() ?? "";

      if (levenshtein.get(tradingName, matcher) < 2) return true;
      if (tradingName.includes(matcher)) return true;

      if (levenshtein.get(registeredCompanyName, matcher) < 2) return true;
      if (registeredCompanyName.includes(matcher)) return true;

      return false;
    });
  };

  const filter = ({
    target: { value }
  }: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(value);
  };

  // console.log("searchValue", searchValue);
  return (
    <Search
      defaultValue={searchValue}
      bordered={true}
      style={{ height: "auto" }}
      onChange={filter}
      onClear={() => {}}
    />
  );
};
export { ClientSearch };
