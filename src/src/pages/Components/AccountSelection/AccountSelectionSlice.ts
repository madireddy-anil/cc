import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../../redux/store";
import { Account } from "../../../services/accountService";
import { resetAction as depositRestAction } from "../../Trades/Deposit/DepositActions";

type SliceState = {
  selectedAccount?: Account;
};
const initialState: SliceState = {
  selectedAccount: undefined
};

const accountSelectionSlice = createSlice({
  name: "beneficiary",
  initialState: initialState,
  reducers: {
    selectAccountAction: (state, action: PayloadAction<any>) => {
      state.selectedAccount = action.payload;
    },
    setToInitialAccount: () => {
      return {
        selectedAccount: undefined
      };
    }
  },
  extraReducers: (builder) => {
    builder.addCase(depositRestAction, () => {
      return initialState;
    });
  }
});

export const selectAccountSelection = (state: RootState) =>
  state.selectAccount.selectedAccount;

export const selectAccountCurrency = (state: RootState) =>
  state.selectAccount.selectedAccount?.currency;

export const { selectAccountAction, setToInitialAccount } =
  accountSelectionSlice.actions;
export default accountSelectionSlice.reducer;
