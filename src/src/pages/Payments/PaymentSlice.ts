import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../redux/store";
import { paymentApi } from "../../services/paymentService";

import { Notification } from "@payconstruct/design-system";

export type SliceState = {
  step: number;
  beneStep: number;
  showModal: boolean;
  paymentDetails: Record<any, any>;
  isLoading: boolean;
};

const initialState: SliceState = {
  step: 0,
  beneStep: 0,
  showModal: false,
  paymentDetails: {
    creditAmount: null,
    pricingInfo: {},
    fxInfo: {}
  },
  isLoading: false
};

const PaymentSlice = createSlice({
  name: "payments",
  initialState: initialState,
  reducers: {
    nextStepAction: (state) => {
      return {
        ...state,
        step: state.step + 1
      };
    },
    previousStepAction: (state) => {
      return {
        ...state,
        step: state.step - 1
      };
    },
    nextBeneStepAction: (state) => {
      return {
        ...state,
        beneStep: state.beneStep + 1
      };
    },
    previousBeneStepAction: (state) => {
      return {
        ...state,
        beneStep: state.beneStep - 1
      };
    },
    updateShowModal: (state, action) => {
      return {
        ...state,
        showModal: action.payload
      };
    },
    setToInitialStep: (state) => {
      return {
        ...state,
        step: 0,
        beneStep: 0,
        paymentDetails: initialState.paymentDetails
      };
    },
    setToInitialPaymentDetails: (state) => {
      return {
        ...state,
        paymentDetails: initialState.paymentDetails
      };
    },
    updatePaymentDetails: (state, action) => {
      return {
        ...state,
        paymentDetails: action.payload
      };
    }
  },
  extraReducers: (builder) => {
    /* When Payment Rate Fetched Successfully, we notify user with success message */
    builder.addMatcher(
      paymentApi.endpoints.getPaymentDetails.matchFulfilled,
      (state, { payload }: any) => {
        Notification({
          type: "success",
          message: payload?.message
        });
      }
    );
    /* When Payment Rate Fetch Fail, we notify user with failure message */
    builder.addMatcher(
      paymentApi.endpoints.getPaymentDetails.matchRejected,
      (state, { payload }: any) => {
        // if (payload) {
        //   Notification({
        //     type: "error",
        //     message: payload?.data?.data?.title
        //   });
        // }
      }
    );
  }
});
export const selectPayment = (state: RootState) => state.payment;

export const {
  nextStepAction,
  previousStepAction,
  nextBeneStepAction,
  previousBeneStepAction,
  updateShowModal,
  setToInitialStep,
  setToInitialPaymentDetails,
  updatePaymentDetails
} = PaymentSlice.actions;
export default PaymentSlice.reducer;
