import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../redux/store";
import { rateApi } from "../../services/ratesService";
import { userLogoutAction } from "../general/actions";
import { Rate } from "@payconstruct/pp-types";

export type RateState = {
  vendorRates?: Rate[];
};

const initialState: RateState = {
  vendorRates: undefined
};

const rateSlice = createSlice({
  name: "rate",
  initialState: initialState,
  reducers: {
    setVendorRates(state, action: PayloadAction<Rate[] | undefined>) {
      return {
        ...state,
        vendorRates: action.payload
      };
    }
  },
  extraReducers: (builder) => {
    builder.addCase(userLogoutAction, () => {
      return initialState;
    });
  }
});

export const { setVendorRates } = rateSlice.actions;
export const selectVendorRates = (state: RootState) => state.rates.vendorRates;

export default rateSlice.reducer;
