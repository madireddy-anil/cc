import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../redux/store";
import { uploadFilesApiUrl } from "../config/variables";
import { Moment } from "moment-timezone";

export interface StatePaginationProps {
  current: number;
  pageSize: number;
  files: Files[];
}
export interface Files {
  clientId: string;
  userId: string;
  fileName: string;
  friendlyName: string;
  clientName: string;
  filePath: string;
  type?: string;
  id: string;
  percent?: number;
  status?: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface ClientFilesFilterResp {
  data: Files[];
}

export interface ClientFilesFilterReq {
  key: number;
  current: number;
  pageSize: number;
  entityId: string;
  fromToDate: Moment[];
}

export interface APIReq {
  id: string | undefined;
}

export interface APIResp {
  url: string;
}

export const filesApi = createApi({
  reducerPath: "filesApi",
  baseQuery: fetchBaseQuery({
    baseUrl: uploadFilesApiUrl,
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
    getClientFiles: builder.query<ClientFilesFilterResp, ClientFilesFilterReq>({
      query: (args) => {
        const { entityId, fromToDate } = args;
        // const page = current ? `?page=${current}&` : ``;
        // const limit = pageSize ? `limit=${pageSize}` : ``;
        const entity = entityId
          ? `${fromToDate?.length ? "&" : "?"}entityId=${entityId}`
          : ``;
        // const date = fromToDate?.length
        //   ? `${entityId ? "&" : "?"}fromDate=${moment(fromToDate[0]).format(
        //       "x"
        //     )}&toDate=${moment(fromToDate[1]).format("x")}`
        //   : ``;

        return {
          url: `files${entity}`,
          method: "GET"
        };
      }
    }),
    deleteFile: builder.mutation<void, APIReq>({
      query: ({ id }) => ({
        url: `files/${id}`,
        method: "DELETE"
      })
    }),
    downloadFile: builder.query<APIResp, APIReq>({
      query: ({ id }) => ({
        url: `signed-url/${id}?isDownload=true`,
        method: "GET"
      })
    })
  })
});

export const {
  useGetClientFilesQuery,
  useDeleteFileMutation,
  useDownloadFileQuery
} = filesApi;
