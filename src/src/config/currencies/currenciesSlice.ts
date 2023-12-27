import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { currenciesApi, Currency } from "../../services/currencies";
import { RootState } from "../../redux/store";

type SliceState = {
  currencyList: Currency[];
};

const initialState: SliceState = {
  currencyList: []
};

const currenciesSlice = createSlice({
  name: "currencies",
  initialState: initialState,
  reducers: {
    setCurrencies(state, action: PayloadAction<any>) {
      return {
        ...state,
        currencyList: action.payload?.currency
      };
    }
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      currenciesApi.endpoints.getCurrencies.matchFulfilled,
      (state, { payload }) => {
        state.currencyList = payload.data.currency;
      }
    );
  }
});

export const { setCurrencies } = currenciesSlice.actions;

export const selectCurrencies = (state: RootState) =>
  state.currencies.currencyList;
export default currenciesSlice.reducer;
