import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../../redux/store";

type rememberState = {
  email: string | null;
  rememberMe: boolean;
};

const initialState = {
  email: null,
  rememberMe: false
} as rememberState;

const rememberMeSlice = createSlice({
  name: "remember",
  initialState: initialState,
  reducers: {
    emailUpdateAction(state, action) {
      return {
        ...state,
        email: action.payload
      };
    },
    rememberMeUpdateAction(state, action) {
      return {
        ...state,
        rememberMe: action.payload
      };
    }
  }
});
// Pull Actions and Reducer from RememberMeSlice
const { actions, reducer } = rememberMeSlice;

// Export All the actions
export const { emailUpdateAction, rememberMeUpdateAction } = actions;

// Export default the reducer
export default reducer;

// //Export select to get specific data from the store
export const selectRemember = (state: RootState) => state.remember;
