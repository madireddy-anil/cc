import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../redux/store";
import defaultLanguage from "./locales/en-US.json";
import { LOCALE } from "./locales";

// A "slice" is a collection of Redux reducer logic and
// actions for a single feature in your app

type SliceState = {
  lang: LOCALE.ENGLISH | LOCALE.FRENCH | LOCALE.GERMAN;
  translations: { [key: string]: string };
};

const initialState: SliceState = {
  lang: LOCALE.ENGLISH,
  translations: { ...defaultLanguage }
};

const localeSlice = createSlice({
  name: "locale",
  initialState: initialState,
  reducers: {
    load: (state, action) => {
      state.translations = { ...action.payload };
    },
    changeLanguage: (state, action) => {
      state.lang = { ...action.payload };
    }
  }
});

export const { load, changeLanguage } = localeSlice.actions;

export const selectLocale = (state: RootState) => state.locale.translations;
export const selectLang = (state: RootState) => state.locale.lang;

export default localeSlice.reducer;
