import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { LINES_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const LineMasterApi = createApi({
  reducerPath: "LineMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["line"],
  endpoints: (builder) => ({
    getLine: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: LINES_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: LINES_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["Line"],
    }),
    getLineById: builder.query({
      query: (id) => {
        return {
          url: `${LINES_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["Line"],
    }),
    addLine: builder.mutation({
      query: (payload) => ({
        url: LINES_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["Line"],
    }),
    updateLine: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${LINES_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["Line"],
    }),
    deleteLine: builder.mutation({
      query: (id) => ({
        url: `${LINES_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Line"],
    }),
  }),
});

export const {
  useGetLineQuery,
  useGetLineByIdQuery,
  useAddLineMutation,
  useUpdateLineMutation,
  useDeleteLineMutation,
} = LineMasterApi;

export default LineMasterApi;
