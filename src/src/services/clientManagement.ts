import { api as ccServiceApi } from "./ControlCenter/ccService";

export interface GetClientsRequest {
  key: number;
  current: number;
  pageSize: number;
  companyName?: string;
  tradingName?: string;
  kycStatus?: string;
  riskCategory?: string;
}

export interface getClientDetailResponse {
  data: { [key: string]: any };
  status: string;
  message: string;
}

export interface Industry {
  industryType: string;
  subType: string[];
  comment: string;
}
export interface AddNewClientRequest {
  genericInformation: {
    registeredCompanyName: string;
    companyType: string;
    companyNumber: string | number;
    tradingName: string;
    addresses: any[];
    industries: Industry[];
    // websiteAddress: string[];
  };
}
export interface UsersResponseByClientId {
  status: string;
  data: { users: any[] };
  message: string;
}

export interface GroupResponseByClientId {
  status: string;
  data: { [key: string]: any };
  message: string;
}

export interface UserRequestByClientId {
  uniqueName?: string;
  entityId: string;
}
export interface GroupRequestByClientId {
  uniqueName?: string;
  groupId: string;
}
export interface CompanyDetailResponse {
  status: string;
  data: { [key: string]: any };
  message: string;
}

export interface GetPreSignedURLReq {
  data: any;
  file: any;
}
export interface GetPreSignedURLRes {
  fileName: string;
  url: string;
}

export interface DocumentQusRes {
  data: any[];
  status: string;
  message: string;
}

export interface FileDeleteReq {
  fileName: string;
  documentType: string;
  entityId?: string;
}

export interface FileDeleteRes {
  message: string;
}

export interface GetUsersRequest {
  current: number;
  pageSize: number;
}

export interface getUserResponse {
  status: string;
  data: {
    user: any[];
    total: number;
  };
  message: string;
}

export interface UserOnSearchResponse {
  data: {
    users: any[];
    total: number;
  };
}

export interface UserOnSearchRequest {
  query: string;
}

export interface GroupOnSearchResponse {
  data: {
    groups: any[];
    total: number;
  };
}

export interface GroupOnSearchRequest {
  query: string;
}

export interface UpdateLinkUserRequest {
  entityId: string;
  data: any;
}

export interface UpdateGroupIdRequest {
  groupId: string;
  data: any;
}

export interface GetGroupsRequest {
  current: number;
  pageSize: number;
}

export interface AddNewUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  entityId?: string;
  roleId: string;
}

export interface AddShareholderRequest {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  entityId?: string;
  phoneNumber: string;
  phoneNumberCountryCode: string;
  isIdvScreeningRequired: string;
  isAuthorisedToAcceptTerms: string;
  percentageOfShares: string;
}
export interface AssigneesResponse {
  data: {
    assignees: [
      {
        id?: string;
        firstName?: string;
        lastName?: string;
        type?: string;
        email?: string;
        skypeId?: string;
        phoneNumber?: string;
        phoneNumberPrefix?: string;
        timeZone?: string;
        meetingLink?: string;
      }
    ];
  };
}

export type RolesResponse = {
  data: {
    role: Roles[];
  };
};

export type Roles = {
  id: string;
  createdAt: string;
  updatedAt: string;
  description: string;
  isDefault: boolean;
  isInternal: boolean;
  name: string;
  permissions: string[];
};

export type UpdateUserRoleRequest = {
  entityId: string;
  userId?: string;
  data: {
    roleId: string;
  };
};

export const clientManagementApi = ccServiceApi.injectEndpoints({
  endpoints: (builder) => ({
    getClients: builder.query<any, GetClientsRequest>({
      query: (args) => {
        const {
          current,
          pageSize,
          companyName,
          tradingName: tName,
          kycStatus: status,
          riskCategory: category
        } = args;
        const page = current ? `page=${current}&` : ``;
        const limit = pageSize ? `limit=${pageSize}` : ``;
        const regCompanyName = companyName
          ? `&genericInformation.registeredCompanyName=${companyName}`
          : ``;
        const tradingName = tName
          ? `&genericInformation.tradingName=${tName}`
          : ``;
        const kycStatus = status ? `&kycInformation.kycStatus=${status}` : ``;
        const riskCategory = category ? `&riskCategory=${category}` : ``;
        return {
          url: `entities/clients?${page}${limit}${regCompanyName}${tradingName}${kycStatus}${riskCategory}`,
          method: "GET"
        };
      }
    }),
    getRoles: builder.query<RolesResponse, string>({
      query: () => {
        return {
          url: `/roles`,
          method: "GET"
        };
      }
    }),
    getClientDetail: builder.query<any, any>({
      query: ({ clientId }) => {
        return {
          url: `entities/clients/${clientId}`,
          method: "GET"
        };
      },
      providesTags: ["Unlink_Group_Get_Client_Detail"]
    }),
    addNewClient: builder.mutation<void, AddNewClientRequest>({
      query: (data) => {
        return {
          url: `clients`,
          method: "POST",
          body: data
        };
      }
    }),
    addNewUser: builder.mutation<void, AddNewUserRequest>({
      query: (data) => {
        return {
          url: `cms-users`,
          method: "POST",
          body: data
        };
      },
      invalidatesTags: ["Get_Users_Upon_New_User_Post"]
    }),
    addShareholder: builder.mutation<void, AddShareholderRequest>({
      query: (data) => {
        return {
          url: `people`,
          method: "POST",
          body: data
        };
      },
      invalidatesTags: ["Get_People_Upon_New_People_Post"]
    }),
    updateClientDetail: builder.mutation<any, any>({
      query: (args) => {
        const { clientId, ...arg } = args;
        return {
          url: `entities/clients/${clientId}`,
          body: arg,
          method: "PUT"
        };
      }
    }),
    getUsersByClientId: builder.query<
      UsersResponseByClientId,
      UserRequestByClientId
    >({
      query: ({ entityId }) => {
        return {
          url: `/users/entity/${entityId}?page=1&limit=0`,
          method: "GET"
        };
      },
      providesTags: ["Get_Users_Upon_New_User_Post"]
    }),
    getGroupsById: builder.query<
      GroupResponseByClientId,
      GroupRequestByClientId
    >({
      query: ({ groupId }) => {
        return {
          url: `entity-groups/${groupId}`,
          method: "GET"
        };
      }
    }),
    unlinkEntityFromGroup: builder.mutation<any, any>({
      query: (entityId) => {
        return {
          url: `entities/${entityId}/groups`,
          method: "DELETE"
        };
      },
      invalidatesTags: ["Unlink_Group_Get_Client_Detail"]
    }),
    getCompanyDetailByClientId: builder.query<
      CompanyDetailResponse,
      { accountType: "linkedCompany"; entityId: string }
    >({
      query: ({ entityId }) => {
        return {
          url: `entities/${entityId}/linked-entities`,
          method: "GET"
        };
      }
    }),
    getDocumentFilesByClientId: builder.query<any, any>({
      query: (arg) => {
        return {
          url: `documents?limit=0&entityId=${arg?.entityId}`,
          method: "GET"
        };
      }
    }),
    getDocumentQuestions: builder.query<DocumentQusRes, any>({
      query: () => {
        return {
          url: `required-documents`,
          method: "GET"
        };
      }
    }),
    getDocumentCriteria: builder.query<any, any>({
      query: () => {
        return {
          url: `document-criteria`,
          method: "GET"
        };
      }
    }),
    getPresignedURL: builder.mutation<GetPreSignedURLRes, any>({
      query: (arg) => {
        const { entityId, ...data } = arg;
        return {
          url: `file-upload?entityId=${entityId}`,
          method: "POST",
          body: data
        };
      }
    }),
    deleteDocumentFile: builder.mutation<FileDeleteRes, FileDeleteReq>({
      query: (arg) => {
        const { entityId, ...data } = arg;
        return {
          url: `file-delete?entityId=${entityId}`,
          method: "POST",
          body: data
        };
      }
    }),
    getPresignedURLForDownload: builder.mutation<any, any>({
      query: (args) => {
        const { payload, entityId } = args;
        return {
          url: `view-file?entityId=${entityId}`,
          method: "POST",
          body: payload
        };
      }
    }),
    getStakeHoldersByClientId: builder.query<any, any>({
      query: (args) => {
        const { entityId } = args;
        return {
          url: `people?entityId=${entityId}`,
          method: "GET"
        };
      },
      providesTags: ["Get_People_Upon_New_People_Post"]
    }),
    updateDocumentStatus: builder.mutation<any, any>({
      query: (arg) => {
        const { file, data } = arg;
        return {
          url: `documents/name/${file}`,
          body: data,
          method: "PUT"
        };
      }
    }),
    deleteUnlinkUser: builder.mutation<any, any>({
      query: (args) => {
        const { userId, entityId } = args;
        return {
          url: `users/${userId}/unlink-entities/${entityId}`,
          method: "DELETE"
        };
      }
    }),
    getUsers: builder.query<getUserResponse, GetUsersRequest>({
      query: ({ current, pageSize }) => {
        // const { current, pageSize } = args;
        const page = current ? `page=${current}&` : ``;
        const limit = pageSize ? `limit=${pageSize}` : ``;
        return {
          url: `users?portal=cms&${page}${limit}`,
          method: "GET"
        };
      }
    }),
    getAllUsers: builder.query<any, any>({
      query: () => {
        return {
          url: `users`,
          method: "GET"
        };
      }
    }),
    getGroups: builder.query<any, GetGroupsRequest>({
      query: (args) => {
        const { current, pageSize } = args;
        const page = current ? `page=${current}&` : ``;
        const limit = pageSize ? `limit=${pageSize}` : ``;
        return {
          url: `entity-groups?${page}${limit}`,
          method: "GET"
        };
      }
    }),
    updateGroupsById: builder.mutation<any, UpdateGroupIdRequest>({
      query: ({ groupId, data }) => {
        return {
          url: `entities/groups/${groupId}`,
          method: "PUT",
          body: data
        };
      }
    }),
    getUsersOnSearch: builder.query<UserOnSearchResponse, UserOnSearchRequest>({
      query: (searchKey) => {
        return {
          url: `users/search/${searchKey.query}?portal=cms&page=1&limit=0`,
          method: "GET"
        };
      }
    }),
    updateLinkUsers: builder.mutation<any, UpdateLinkUserRequest>({
      query: ({ entityId, data }) => {
        return {
          url: `entities/clients/${entityId}/users`,
          body: data,
          method: "PUT"
        };
      }
    }),
    updateUserRole: builder.mutation<void, UpdateUserRoleRequest>({
      query: ({ entityId, userId, data }) => {
        return {
          url: `entities/clients/${entityId}/users/${userId}/roles`,
          method: "PUT",
          body: data
        };
      }
    }),
    getGroupsOnSearch: builder.query<
      GroupOnSearchResponse,
      GroupOnSearchRequest
    >({
      query: (searchKey) => {
        return {
          url: `entity-groups/search/${searchKey.query}?page=1&limit=0`,
          method: "GET"
        };
      }
    }),
    getAssignee: builder.query<AssigneesResponse, any>({
      query: () => {
        return {
          url: `assignees`,
          method: "GET"
        };
      }
    })
  })
});

export const {
  useGetClientsQuery,
  useGetClientDetailQuery,
  useGetRolesQuery,
  useAddNewUserMutation,
  useAddShareholderMutation,
  useUpdateClientDetailMutation,
  useGetUsersByClientIdQuery,
  useAddNewClientMutation,
  useGetCompanyDetailByClientIdQuery,
  useGetGroupsByIdQuery,
  useGetDocumentFilesByClientIdQuery,
  useGetDocumentQuestionsQuery,
  useGetDocumentCriteriaQuery,
  useUpdateDocumentStatusMutation,
  useGetPresignedURLMutation,
  useDeleteDocumentFileMutation,
  useGetPresignedURLForDownloadMutation,
  useGetStakeHoldersByClientIdQuery,
  useDeleteUnlinkUserMutation,
  useUnlinkEntityFromGroupMutation,
  useGetUsersQuery,
  useGetAllUsersQuery,

  useGetGroupsQuery,
  useUpdateGroupsByIdMutation,
  useUpdateLinkUsersMutation,
  useUpdateUserRoleMutation,
  useGetUsersOnSearchQuery,
  useGetAssigneeQuery,
  useGetGroupsOnSearchQuery
} = clientManagementApi;
