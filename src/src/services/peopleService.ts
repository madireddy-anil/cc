import { gppApi as apiUrl } from "./gppService";
export interface IdvVerificationRequest {
  data: {
    email: string;
    firstName: string;
    lastName: string;
  };
}
export interface IdvVerificationResponse {
  data: {
    message: string;
  };
}

export const peopleApi = apiUrl.injectEndpoints({
  endpoints: (builder) => ({
    invitePeople: builder.mutation<
      IdvVerificationResponse,
      IdvVerificationRequest
    >({
      query: ({ data }) => {
        return {
          url: `send-idv-verification-link`,
          method: "post",
          body: data
        };
      }
    })
  })
});

export const { useInvitePeopleMutation } = peopleApi;
