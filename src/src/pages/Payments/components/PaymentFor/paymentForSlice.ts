import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../../../redux/store";
import { IconProps } from "@payconstruct/design-system";

export interface paymentForProps {
  id: string;
  name: string;
  tag: string;
  icon: IconProps["name"];
}

type SliceState = {
  selectedPayForOption?: paymentForProps;
};

const initialState: SliceState = {
  selectedPayForOption: undefined
};

const paymentForSlice = createSlice({
  name: "paymentForSlice",
  initialState: initialState,
  reducers: {
    selectPaymentForAction: (state, action: PayloadAction<any>) => {
      state.selectedPayForOption = action.payload;
    },
    setToInitialState: (state) => {
      state.selectedPayForOption = undefined;
    }
  }
});

export const selectedPayFor = (state: RootState) =>
  state.paymentForSelection.selectedPayForOption;

export const { selectPaymentForAction, setToInitialState } =
  paymentForSlice.actions;

export default paymentForSlice.reducer;
