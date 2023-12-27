import { EFXOrder } from "@payconstruct/pp-types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../../redux/store";
import { Account } from "../../../services/accountService";
import {
  beneficiaryApi,
  BeneficiaryResponse,
  newBeneficiaryDocument
} from "../../../services/beneficiaryService";
import {
  getClientDetailResponse,
  CompanyDetailResponse
} from "../../../services/clientManagement";
import { resetAction as depositRestAction } from "../../Trades/Deposit/DepositActions";

export type BeneficiaryState = {
  // beneficiaryList: BeneficiaryResponse["response"] | [];
  allBeneficiaries: any;
  settlementType: EFXOrder["settlementType"];
  selectedBeneficiary?: newBeneficiaryDocument | any;
  newBeneficiary?: any;
  selectedInternalAccount?: Account;
  beneficiaryId: string;
  beneficiaryName: string;
  showModal: boolean;
  showFormModal: boolean;
  submittingBeneficiary: boolean;

  beneficiaryClientOrCompany?:
    | getClientDetailResponse["data"]
    | CompanyDetailResponse["data"];
};

const initialState: BeneficiaryState = {
  settlementType: "external",
  //beneficiaryList: [],
  allBeneficiaries: [],
  selectedBeneficiary: undefined,
  newBeneficiary: undefined,
  selectedInternalAccount: undefined,
  beneficiaryId: "",
  beneficiaryName: "",
  showModal: false,
  showFormModal: false,
  submittingBeneficiary: false,

  beneficiaryClientOrCompany: {}
};

const beneficiarySlice = createSlice({
  name: "beneficiary",
  initialState: initialState,
  reducers: {
    showModalAction: (state, action: PayloadAction<boolean>) => {
      return {
        ...state,
        showModal: action.payload
      };
    },
    showFormModalAction: (state, action: PayloadAction<boolean>) => {
      return {
        ...state,
        showFormModal: action.payload
      };
    },
    setSubmitting: (state, action: PayloadAction<boolean>) => {
      return {
        ...state,
        submittingBeneficiary: action.payload
      };
    },
    changeSettlementType: (
      state,
      action: PayloadAction<BeneficiaryState["settlementType"]>
    ) => {
      return {
        ...state,
        settlementType: action.payload
      };
    },
    setMoveFundsTo: (state, action: PayloadAction<string | undefined>) => {
      return {
        ...state,
        moveFundsTo: action.payload
      };
    },
    setBeneficiaryClientOrCompany: (
      state,
      action: PayloadAction<any | undefined>
    ) => {
      return {
        ...state,
        beneficiaryClientOrCompany: action.payload
      };
    },
    setBeneficiaryAction: (state, action: PayloadAction<any | undefined>) => {
      return {
        ...state,
        selectedBeneficiary: action.payload,
        beneficiaryId: action.payload?.id ?? "",
        beneficiaryName: action.payload?.accountDetails?.nameOnAccount ?? ""
      };
    },
    setInternalAccountAction: (
      state,
      action: PayloadAction<Account | undefined>
    ) => {
      return {
        ...state,
        selectedInternalAccount: action.payload,
        beneficiaryId: action.payload?.id ?? "",
        beneficiaryName: action.payload?.accountName ?? ""
      };
    },
    setToInitialBeneficiary: (state) => {
      return {
        ...state,
        settlementType: "external",
        selectedInternalAccount: undefined,
        selectedBeneficiary: undefined,
        beneficiaryId: "",
        beneficiaryName: "",
        beneficiaryClientOrCompany: {}
      };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(depositRestAction, () => {
        return initialState;
      })
      // .addMatcher(
      //   beneficiaryApi.endpoints.getBeneficiaryByClientId.matchFulfilled,
      //   (state, { payload }) => {
      //    state.beneficiaryList = payload.response;
      //   }
      // )
      .addMatcher(
        beneficiaryApi.endpoints.getAllBeneficiary.matchFulfilled,
        (state, { payload }) => {
          state.allBeneficiaries = payload.response;
        }
      )
      .addMatcher(
        beneficiaryApi.endpoints.createBeneficiary.matchFulfilled,
        (state, { payload }) => {
          state.newBeneficiary = payload;
        }
      );
  }
});

export const selectBeneficiaryClientOrCompany = (state: RootState) =>
  state?.beneficiary?.beneficiaryClientOrCompany;
export const selectedBeneficiary = (state: RootState) =>
  state?.beneficiary?.selectedBeneficiary;
export const selectBeneficiary = (state: RootState) => state?.beneficiary;
export const settlementType = (state: RootState) =>
  state?.beneficiary?.settlementType;
export const selectNewBeneficiary = (state: RootState) =>
  state.beneficiary?.newBeneficiary?.beneficiary;
export const selectInternalAccount = (state: RootState) =>
  state.beneficiary?.selectedInternalAccount;

export const {
  showModalAction,
  showFormModalAction,
  setSubmitting,
  changeSettlementType,
  setBeneficiaryAction,
  setInternalAccountAction,
  setToInitialBeneficiary,
  setMoveFundsTo,
  setBeneficiaryClientOrCompany
} = beneficiarySlice.actions;
export default beneficiarySlice.reducer;
