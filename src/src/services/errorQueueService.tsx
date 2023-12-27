import { bmsApi } from "./bmsService";
import { ErrorRowType } from "../pages/ErrorQueue/ErrorQueueList/components/errorQueueTypes";

interface ErrorQueueResponse {
  data: {
    payments: Array<ErrorRowType>;
  };
  status: string;
  message: string;
}

interface ErrorDetailResponse {
  data: {
    errorPayment: ErrorRowType;
  };
  status: string;
  message: string;
}

type TErrorDetailPayload = {
  approveStatus: string;
  processFlow: string;
  remarks: string;
};

interface ErrorDetailRequest {
  errorId: string;
  payload: TErrorDetailPayload;
}

export const errorQueueApi = bmsApi.injectEndpoints({
  endpoints: (instance) => ({
    getErrorQueues: instance.query<ErrorQueueResponse, any>({
      query: () => {
        return {
          url: "payments/error-queue?limit=0",
          method: "GET"
        };
      }
    }),
    getErrorDetail: instance.query<ErrorDetailResponse, { errorId: string }>({
      query: ({ errorId }) => {
        return {
          url: `payments/error-queue/${errorId}`,
          method: "GET"
        };
      }
    }),
    actionError: instance.mutation<ErrorDetailResponse, ErrorDetailRequest>({
      query: ({ errorId, payload }) => {
        return {
          url: `payments/error-queue/${errorId}`,
          method: "PUT",
          body: payload
        };
      }
    })
  })
});

export const {
  useGetErrorQueuesQuery,
  useGetErrorDetailQuery,
  useActionErrorMutation
} = errorQueueApi;
