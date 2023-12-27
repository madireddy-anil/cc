import { ProductCode } from "../../../products/Products";
import { api } from "../ccService";
// https://redux-toolkit.js.org/rtk-query/usage/code-splitting

interface Brand {
  _id: string;
  products: {
    _id: string;
    id: string;
    product: string;
    productCode: string;
    label: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  clientBrands: {
    _id: string;
    id: string;
    type: string;
    brand: string;
    brandCode: string;
    isActive: true;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  id: string;
  type: string;
  brand: string;
  brandCode: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}
interface BrandResponse {
  data: Brand;
}

interface BrandsResponse {
  data: {
    brands: any[];
  };
}

interface Product {
  id: string;
  product: string;
  productCode: ProductCode;
  label: string;
}

interface Products {
  data: { products: Product[] };
}

const extendedApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getBrands: builder.query<BrandsResponse, any>({
      query: () => {
        return {
          url: `brands`,
          method: "GET"
        };
      }
    }),
    getBrand: builder.query<BrandResponse, { id: string }>({
      query: ({ id }) => {
        return {
          url: `brands/${id}`,
          method: "GET"
        };
      }
    }),
    getAllProducts: builder.query<Products, any>({
      query: () => "products?limit=0"
    })
  }),

  overrideExisting: false
});

export const { useGetBrandsQuery, useGetAllProductsQuery } = extendedApi;
