import { Search } from "@payconstruct/design-system";
import { useEffect, useState } from "react";
import { useDebounce } from "../../../../customHooks/useDebounce";
import levenshtein from "fast-levenshtein";

import { useAppDispatch } from "../../../../redux/hooks/store";
import { setVendorRates } from "../../../../config/rate/rateSlice";
import { Rate } from "@payconstruct/pp-types";

interface VendorRateSearchProps {
  vendorRates?: Rate[];
}
const VendorRateSearch: React.FC<VendorRateSearchProps> = ({ vendorRates }) => {
  const dispatch = useAppDispatch();
  const [searchValue, setSearchValue] = useState<string>();

  useEffect(() => {
    if (!searchValue) {
      dispatch(setVendorRates(vendorRates ?? []));
    }
  }, [vendorRates, dispatch, searchValue]);

  useDebounce(
    () => {
      if (searchValue) {
        const vendor = vendorByPairAndName(searchValue) ?? [];
        dispatch(setVendorRates(vendor));
        return;
      }
      dispatch(setVendorRates(vendorRates));
    },
    350,
    [searchValue, vendorRates]
  );

  const vendorByPairAndName = (value: string) => {
    return vendorRates?.filter((vendor) => {
      const matcher = value.toUpperCase();
      const pairFormatted = vendor.pair.toUpperCase();
      const pair = vendor.pair.toUpperCase();
      const vendorName = vendor?.vendorName?.toUpperCase();

      // Match By Pairs
      if (levenshtein.get(pair, matcher) < 3) return true;
      if (pair.includes(matcher)) return true;
      if (pairFormatted.includes(matcher)) return true;

      // Match By vendor
      if (vendorName && levenshtein.get(vendorName, matcher) < 3) return true;
      if (!vendorName) return false;
      if (vendorName?.includes(matcher)) return true;
      return false;
    });
  };

  const filter = ({
    target: { value }
  }: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(value);
  };

  return (
    <Search
      bordered={true}
      style={{ height: "auto" }}
      onChange={filter}
      onClear={() => {}}
    />
  );
};
export { VendorRateSearch };
