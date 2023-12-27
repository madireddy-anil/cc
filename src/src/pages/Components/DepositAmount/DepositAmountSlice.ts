import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { EFXOrder } from "@payconstruct/pp-types";
import { RootState } from "../../../redux/store";
import { routesApi } from "../../../services/routesService";
import { resetAction as depositRestAction } from "../../Trades/Deposit/DepositActions";

type SliceState = {
  availableCurrenciesToSell: string[];
  showModal: boolean;
  sendAmount?: number;
  paymentRemarks?: string;
  form: {
    executionDate: EFXOrder["executionDate"];
    buyCurrency: EFXOrder["buyCurrency"];
    buyAmount?: EFXOrder["buyAmount"];
    sellCurrency: EFXOrder["sellCurrency"];
    mainSellCurrency: EFXOrder["mainSellCurrency"];
    sellAmount?: number;
    requestedAccountType: EFXOrder["requestedAccountType"];
    depositType: EFXOrder["depositType"];
    remarks: EFXOrder["remarks"];
  };
};

// Reference for Buy/Sell are in the perspective of PayPerform, so they are inverted here
// We are Buying the client currency
const initialState: SliceState = {
  availableCurrenciesToSell: [],
  showModal: false,
  sendAmount: undefined,
  paymentRemarks: "",
  form: {
    executionDate: "",
    buyCurrency: "",
    buyAmount: undefined,
    sellAmount: undefined,
    sellCurrency: "",
    mainSellCurrency: "",
    requestedAccountType: "personal",
    depositType: "day",
    remarks: ""
  }
};

const DepositSlice = createSlice({
  name: "depositAmount",
  initialState: initialState,
  reducers: {
    showModalAction: (state, action: PayloadAction<boolean>) => {
      return {
        ...state,
        showModal: action.payload
      };
    },
    updateSendAmount: (state, action: PayloadAction<number>) => {
      return {
        ...state,
        sendAmount: action.payload
      };
    },
    updatePaymentRemarks: (state, action: PayloadAction<string>) => {
      return {
        ...state,
        paymentRemarks: action.payload
      };
    },
    updateFormValue: (
      state,
      action: PayloadAction<Partial<SliceState["form"]>>
    ) => {
      return {
        ...state,
        form: {
          ...state.form,
          ...action.payload
        }
      };
    },
    setToInitialFormState: (state) => {
      return {
        ...state,
        sendAmount: undefined,
        paymentRemarks: "",
        form: {
          executionDate: "",
          buyCurrency: "",
          buyAmount: undefined,
          sellAmount: undefined,
          sellCurrency: "",
          mainSellCurrency: "",
          requestedAccountType: "personal",
          depositType: "day",
          remarks: ""
        }
      };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(depositRestAction, () => {
        return initialState;
      })
      .addMatcher(
        routesApi.endpoints.getExitCurrency.matchFulfilled,
        (state, { payload }) => {
          return {
            ...state,
            availableCurrenciesToSell: payload.exitCurrencies
          };
        }
      );
  }
});

export const selectDepositAmount = (state: RootState) => state.depositAmount;

export const selectAvailableCurrencies = (state: RootState) =>
  state.depositAmount.availableCurrenciesToSell;

export const selectPaymentRemarks = (state: RootState) =>
  state.depositAmount.paymentRemarks;

export const {
  updateFormValue,
  showModalAction,
  updateSendAmount,
  updatePaymentRemarks,
  setToInitialFormState
} = DepositSlice.actions;
export default DepositSlice.reducer;
