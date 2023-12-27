import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../redux/store";
import { revokeTokenUrl } from "../config/variables";

export const revokeTokenApi = createApi({
  reducerPath: "revokeTokenApi",
  baseQuery: fetchBaseQuery({
    baseUrl: revokeTokenUrl,
    prepareHeaders: (headers, { getState }) => {
      // By default, if we have a token in the store, let's use that for authenticated requests
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    }
  }),
  endpoints: (builder) => ({
    revokeToken: builder.mutation<void, void>({
      query: () => {
        return {
          url: `/revoke`,
          body: {},
          method: "POST"
        };
      }
    })
  })
});

export const { useRevokeTokenMutation } = revokeTokenApi;
