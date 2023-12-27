import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { EFXOrder } from "@payconstruct/pp-types";
import { RootState } from "../../../redux/store";
import { tradeApi } from "../../../services/tradesService";
import { resetAction } from "./DepositActions";
import moment from "moment-timezone";

type SliceState = {
  step: number;
  tradeStatus: {
    status?: "Success" | "Fail";
    orderReference?: EFXOrder["orderReference"];
    id?: string;
    error?: any;
  };
  depositForm: {
    clientId?: EFXOrder["clientId"];
    clientName?: EFXOrder["clientName"];
    channel?: EFXOrder["channel"];
    industries?: string[];
    sellAccountId?: EFXOrder["sellAccountId"];
    beneficiaryName?: EFXOrder["beneficiaryName"];
    beneficiaryId?: EFXOrder["beneficiaryId"];
    createdBy?: EFXOrder["createdBy"];
  };
};

const initialState: SliceState = {
  step: 0,
  tradeStatus: {
    status: undefined,
    orderReference: undefined,
    id: undefined,
    error: undefined
  },
  depositForm: {
    clientId: "",
    clientName: "",
    channel: "client_messenger",
    industries: [],
    createdBy: {
      email: "",
      firstName: "",
      lastName: "",
      userId: "",
      portal: ""
    }
  }
};

const DepositSlice = createSlice({
  name: "deposit",
  initialState: initialState,
  reducers: {
    updateDepositForm: (
      state,
      action: PayloadAction<Partial<SliceState["depositForm"]>>
    ) => {
      state.depositForm = { ...state.depositForm, ...action.payload };
    },
    nextStepAction: (state) => {
      state.step += 1;
    },
    previousStepAction: (state) => {
      if (state.step === 0) return;
      state.step -= 1;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(resetAction, () => {
        return initialState;
      })
      .addMatcher(
        tradeApi.endpoints.createTrade.matchFulfilled,
        (state, { payload }) => {
          return {
            ...state,
            tradeStatus: {
              status: "Success",
              ...payload
            }
          };
        }
      )
      .addMatcher(
        tradeApi.endpoints.createTrade.matchRejected,
        (state, { payload }) => {
          return {
            ...state,
            tradeStatus: {
              status: "Fail",
              ...state.tradeStatus,
              error: payload
            }
          };
        }
      );
  }
});

export const selectDeposit = (state: RootState) => state.trades.deposit;
export const selectTradeStatus = (state: RootState) =>
  state.trades.deposit.tradeStatus;

export const selectDepositForm = (state: RootState) => {
  const { depositForm } = state.trades.deposit;
  const selectedAccountId = state.selectAccount.selectedAccount?.id;
  const selectedClientId = state.client.selectedClient?.id;
  const userId = state.auth?.profile?.id;
  const selectedClientCompanyName =
    state.client.selectedClient?.genericInformation.registeredCompanyName;
  const { settlementType, beneficiaryId, beneficiaryName } = state.beneficiary;

  const selectIndustries =
    state.client.selectedClient?.genericInformation?.industries ?? [];

  const timeZone = state.general.timezone;

  // TODO: Clean Up to differentiate Internal / External(Beneficiary)
  const form = {
    ...depositForm,
    ...state.depositAmount.form,
    clientId: selectedClientId,
    clientName: selectedClientCompanyName,
    createdBy: userId,
    executionDate: moment(state.depositAmount.form.executionDate)
      .tz(timeZone)
      .format("YYYY-MM-DD"),
    industries: selectIndustries.map((el: any) => el?.industryType),
    buyAccountId: selectedAccountId, // Payperform is Buying
    settlementType
  };

  // Currently internal and External are assigned to this var, need to separate this.
  if (settlementType === "internal") form["sellAccountId"] = beneficiaryId;

  //Only if Bene is Selected "External"
  if (settlementType === "external") {
    form["beneficiaryName"] = beneficiaryName;
    form["beneficiaryId"] = beneficiaryId;
  }

  return form;
};

export const { updateDepositForm, nextStepAction, previousStepAction } =
  DepositSlice.actions;
export default DepositSlice.reducer;
