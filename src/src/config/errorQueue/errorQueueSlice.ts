import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../redux/store";
import { errorQueueApi } from "../../services/errorQueueService";
import { validationOnData } from "../transformer";
import { userLogoutAction } from "../general/actions";
import { ErrorRowType } from "../../pages/ErrorQueue/ErrorQueueList/components/errorQueueTypes";

// A "slice" is a collection of Redux reducer logic and
// actions for a single feature in your app

type SliceState = {
  // rows: ErrorRowType[];
  selectedRow: object;
};

const initialState: SliceState = {
  // rows: [],
  selectedRow: {}
};

const errorQueueSlice = createSlice({
  name: "errorQueues",
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(userLogoutAction, () => {
        return initialState;
      })
      .addMatcher(
        errorQueueApi.endpoints.getErrorDetail.matchFulfilled,
        (state, { payload }) => {
          const response: any = validationOnData(payload.data, "object");
          state.selectedRow = response;
        }
      );
  }
});

// export const selectErrorQueues = (state: RootState) => state.errorQueue.rows;
export const selectedError = (state: RootState) => state.errorQueue.selectedRow;

export default errorQueueSlice.reducer;
