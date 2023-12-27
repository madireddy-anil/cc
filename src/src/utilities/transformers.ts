import moment from "moment-timezone";
import { Currency } from "../services/currencies";
import { store } from "../redux/store";
import { getCamelCase } from "../config/transformer";
import { EntityClient } from "../services/ControlCenter/endpoints/entitiesEndpoint";

/**
 * @function capitalize
 *
 * @props text
 *
 * @returns Capitalized Text
 *
 *
 */
export const capitalize = (text: string) => {
  if (typeof text !== "string") return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const capitalizeString = (string: string) => {
  const sentence = typeof string === "string" ? string : "";
  const words = sentence.split(" ");
  return words
    .map((word) => {
      return word[0]?.toUpperCase() + word?.substring(1);
    })
    .join(" ");
};

export const camelize = (str: string) => {
  if (str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  return "";
};

export const getFormattedAddress = (itemsObject: any): any => {
  const sortingArr = [
    "buildingName",
    "floor",
    "room",
    "buildingNumber",
    "street",
    "city",
    "state",
    "country",
    "postCode",
    "postalCode",
    "postBox",
    "countryCode"
  ];
  let str = "";
  if (itemsObject !== null) {
    for (let i = 0; i < sortingArr.length; i++) {
      if (sortingArr[i]) {
        if (itemsObject[sortingArr[i]]) {
          if (i === 0) {
            str += itemsObject[sortingArr[i]];
          } else {
            str += ", " + itemsObject[sortingArr[i]];
          }
        }
      }
    }
  }

  return str.charAt(0) === "," ? str.slice(1) : str;
};

/**
 *
 * @function getCurrencyType
 *
 * @param currency string
 *
 * @returns Currency Type either fiat or crypto
 *
 */
export const getCurrencyType = (
  currenciesList: Currency[],
  currency: string
): string => {
  const selectedCurrency: any = currenciesList?.find(
    (currencyItem: any) => currencyItem.code === currency
  );
  return selectedCurrency?.type;
};

/**
 *
 * @function getRandomString
 *
 * @param length number
 *
 * @returns Random string
 *
 */
export const getRandomString = (length?: number): string => {
  return Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, "")
    .substr(0, length ?? 5);
};

export const fractionFormat = (amount: any, maxDecimals?: number) => {
  const formatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals ?? 6
  });
  return formatter.format(amount);
};

export const rateFormat = (amount: string) => {
  // TUI-643 - 8 significant digits after non zero value
  amount = parseFloat(amount).toFixed(15);
  const formatLength = 8;
  let returnValue = "";

  let [whole, decimal] = (amount || "").toString().split(".");
  let wholeLength = whole.length;

  const formatNumber = (value: any, limit: number) => {
    const formatter = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: limit
    });
    let [wholeNumber, decimalNumber] = formatter.format(value).split(".");
    decimalNumber = decimalNumber.padEnd(limit, "0");
    return [wholeNumber, decimalNumber].join(".");
  };

  if (parseInt(whole) > 0) {
    const decimalLength =
      wholeLength >= formatLength - 2 ? 2 : formatLength - wholeLength;
    returnValue = formatNumber(amount, decimalLength);
  } else {
    const decimalList = (decimal || "").toString().split("");
    let count = 0;
    let afterNoneZero = 0;
    let noneZero = false;
    let decimalValues = [];

    for (const x in decimalList) {
      count++;
      if (parseInt(decimalList[x]) > 0 && noneZero === false) noneZero = true;
      if (noneZero) {
        afterNoneZero++;
      }
      if (afterNoneZero > formatLength) {
        if (parseInt(decimalList[x]) >= 5) {
          decimalValues.push(decimalList[x]);
          returnValue = `0.${decimalValues.join("")}`;
          returnValue = parseFloat(returnValue).toFixed(count - 1);
        } else {
          returnValue = `0.${decimalValues.join("")}`;
        }
        break;
      }
      decimalValues.push(decimalList[x]);
    }
  }
  return returnValue;
};

export const getLegsCount = (legs: object) => {
  const legsKeys = Object.keys(legs);
  let legsCount = 0;
  if (legsKeys.indexOf("exchange") > -1) legsCount++;
  if (legsKeys.indexOf("local") > -1) legsCount++;
  return legsCount;
};

export const formatCountriesListForOptionSet = (countries: any) => {
  return (countries || []).map((item: any) => {
    return [item.alpha2Code, item.name];
  });
};

export const formatCurrenciesListForOptionSet = (currencies: any) => {
  return (currencies || []).map((item: any) => {
    return [item.code, item.code];
  });
};

export const formatEntitiesForOptionSet = (lists: EntityClient[]) => {
  return (lists || []).map((item: EntityClient) => {
    return [item.id, item.genericInformation.registeredCompanyName];
  });
};

export const formatDateAndTime = (date: any, tz: string) => {
  const dateTime = moment(date);
  const formattedDateTime = dateTime.tz(tz).format("DD/MM/YYYY hh:mm:ss A");
  return formattedDateTime;
};

export const formatTimeAndDate = (date: any, tz: string) => {
  const dateTime = moment(date);
  const formattedTimeDate = dateTime.tz(tz).format("hh:mm - DD/MM/YYYY");
  return formattedTimeDate;
};

export const formatDate = (date: any, tz: string) => {
  const dateTime = moment(date);
  const formatedDate = dateTime.tz(tz).format("DD/MM/YYYY");
  return formatedDate;
};

export const formatToZoneDate = (date: any, tz: any) => {
  const dateTime = moment(date);
  const formattedDateTime = dateTime.tz(tz).format("HH:mm - DD/MM/YY");
  return formattedDateTime;
};

export const formatZoneDate = (date: any, tz: any) => {
  const dateTime = moment(date);
  const formattedDate = dateTime.tz(tz).format("DD/MM/YYYY");
  return formattedDate;
};

export function numberFormat(num: any) {
  //TODO it would be better toFixed function get the decimal from a config based on currency for supporting crypto
  if (num !== undefined) {
    return parseFloat(num)
      .toFixed(2) //Please note that to fixed function don't drop the decimal it round the number to ceil or floor
      .toString()
      .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
  } else {
  }
}

type ValueType = string | number;
export const currencyParser = (
  val: ValueType | undefined,
  locale = "en-US"
): number | string => {
  try {
    // for when the input gets clears
    if (typeof val === "string" && !val.length) {
      val = "0.0";
    }

    // detecting and parsing between comma and dot
    let group = new Intl.NumberFormat(locale).format(1111).replace(/1/g, "");
    let decimal = new Intl.NumberFormat(locale).format(1.1).replace(/1/g, "");
    let reversedVal: string | number = String(val).replace(
      new RegExp("\\" + group, "g"),
      ""
    );

    reversedVal = reversedVal.replace(new RegExp("\\" + decimal, "g"), ".");
    //  => 1232.21 €

    // removing everything except the digits and dot
    reversedVal = reversedVal.replace(/[^0-9.]/g, "");
    //  => 1232.21

    // appending digits properly
    const digitsAfterDecimalCount = (reversedVal.split(".")[1] || []).length;
    const needsDigitsAppended = digitsAfterDecimalCount > 2;

    reversedVal = Number(reversedVal);

    if (needsDigitsAppended) {
      reversedVal = reversedVal * Math.pow(10, digitsAfterDecimalCount - 2);
    }

    return Number.isNaN(reversedVal) ? 0 : reversedVal;
  } catch (error) {
    console.error(error);
    return "0";
  }
};

export const fieldCurrencyFormatter = (
  value: ValueType | undefined,
  currency: string
) => {
  const { getState } = store;
  const state = getState();

  // Adding a cache subscription
  // const initiate = dispatch(
  //   currenciesApi.endpoints.getCurrencies.initiate("Currencies")
  // );
  // console.log("initiate", initiate);

  // Removing the corresponding cache subscription
  // result.unsubscribe();

  // Accessing cached data & request status
  // const result = currenciesApi.endpoints.getCurrencies.select(3)(state);
  // const { data, status, error } = result;

  const valueFormatted = Number(value);
  const currencyList = state?.currencies?.currencyList as Currency[];

  const currencyInfo = currencyList?.find((item: Currency) => {
    return item.code === currency;
  });

  if (currencyInfo && currencyInfo.type === "crypto") {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: Number(currencyInfo.decimals)
    }).format(valueFormatted);
  }

  if (currency) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency
    }).format(valueFormatted);
  }

  return new Intl.NumberFormat("en-US").format(valueFormatted);
};

export const getOrderStatusWithCamelCase = (orderStatus: string) => {
  const statusArray = orderStatus.split("_");
  const convertedStatus = getCamelCase(statusArray, statusArray.length);
  return convertedStatus;
};

export const getCurrencyName = (
  mainCurrencyName: string | undefined,
  currencyName: string | undefined,
  currenciesList: any
) => {
  if (mainCurrencyName) {
    const mainCurrencyObj = currenciesList.find(
      (currency: any) => currency.code === mainCurrencyName
    );
    if (mainCurrencyObj?.mainCurrency)
      return `${currencyName && currencyName} (${mainCurrencyObj?.name})`;
  }
  return currencyName;
};
