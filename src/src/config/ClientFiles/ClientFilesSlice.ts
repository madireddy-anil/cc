import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../redux/store";
import { userLogoutAction } from "../general/actions";
import { ClientFilesFilterReq } from "../../services/clientFileService";

type SliceState = {
  clientFilesFilterProps: ClientFilesFilterReq;
};

const initialState: SliceState = {
  clientFilesFilterProps: {
    key: 0,
    current: 0,
    pageSize: 0,
    entityId: "",
    fromToDate: []
  }
};

const clientFilesSlice = createSlice({
  name: "clientFiles",
  initialState: initialState,
  reducers: {
    updateClientFilesFilterProps: (state, action) => {
      return {
        ...state,
        clientFilesFilterProps: {
          key:
            state.clientFilesFilterProps.current !== action.payload.current
              ? state.clientFilesFilterProps.key + 1
              : state.clientFilesFilterProps.key,
          current: action.payload.current,
          pageSize: action.payload.pageSize,
          ...action.payload
        }
      };
    }
  },

  extraReducers: (builder) => {
    builder.addCase(userLogoutAction, () => {
      return initialState;
    });
  }
});

export const selectClientFilesFilterProps = (state: RootState) =>
  state.clientFiles.clientFilesFilterProps;

export const { updateClientFilesFilterProps } = clientFilesSlice.actions;

export default clientFilesSlice.reducer;
