import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface FileProgressStatusProps {
  percent?: number;
  status?: "exception" | "active" | "success" | "normal" | undefined;
}

export const documentUploadApi = createApi({
  reducerPath: "documentUploadApi",
  baseQuery: fetchBaseQuery({ baseUrl: "" }),
  endpoints: (builder) => ({
    addDocumentFile: builder.mutation<any, any>({
      query: (arg) => {
        return {
          url: `${arg?.filePreSignedData}`,
          header: {
            "content-type": arg.type
          },
          body: arg,
          method: "PUT"
        };
      }
    })
  })
});

export const { useAddDocumentFileMutation } = documentUploadApi;
