import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { UNIT_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const UnitMasterApi = createApi({
  reducerPath: "UnitMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["unit"],
  endpoints: (builder) => ({
    getUnit: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: UNIT_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: UNIT_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["unit"],
    }),
    getUnitById: builder.query({
      query: (id) => {
        return {
          url: `${UNIT_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["unit"],
    }),
    addUnit: builder.mutation({
      query: (payload) => ({
        url: UNIT_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["unit"],
    }),
    updateUnit: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${UNIT_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["unit"],
    }),
    deleteUnit: builder.mutation({
      query: (id) => ({
        url: `${UNIT_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["unit"],
    }),
  }),
});

export const {
  useGetUnitQuery,
  useGetUnitByIdQuery,
  useAddUnitMutation,
  useUpdateUnitMutation,
  useDeleteUnitMutation,
} = UnitMasterApi;

export default UnitMasterApi;
