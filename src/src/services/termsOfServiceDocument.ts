import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../redux/store";
import { termsOfServiceDocumentsUrl } from "../config/variables";

export interface GetPreSignedURLReq {
  data: any;
  file: any;
}
export interface GetPreSignedURLRes {
  filePreSignedData: string;
  updatedFileName: string;
}
export interface GetPreSignedDownloadURLReq {
  fileName: string;
}
export interface GetPreSignedDownloadURLRes {
  filePreSignedData: string;
}
export interface FileDeleteReq {
  fileName: string;
  documentId: string;
}
export interface FileDeleteRes {
  message: string;
}

export const termsOfServiceDocumentsApi = createApi({
  reducerPath: "termsOfServiceDocumentsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: termsOfServiceDocumentsUrl,
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
    getPresignedURL: builder.mutation<GetPreSignedURLRes, GetPreSignedURLReq>({
      query: (args) => {
        return {
          url: `presignedurl`,
          method: "POST",
          body: args
        };
      }
    }),
    getPresignedURLForDownload: builder.mutation<
      GetPreSignedDownloadURLRes,
      GetPreSignedDownloadURLReq
    >({
      query: (args) => {
        return {
          url: `download-presignedurl`,
          method: "POST",
          body: args
        };
      }
    }),
    deleteDocumentFile: builder.mutation<FileDeleteRes, FileDeleteReq>({
      query: (args) => {
        return {
          url: `document`,
          method: "DELETE",
          body: args
        };
      }
    })
  })
});

export const {
  useGetPresignedURLMutation,
  useGetPresignedURLForDownloadMutation,
  useDeleteDocumentFileMutation
} = termsOfServiceDocumentsApi;
