//* All Products that we are using
export enum ProductCode {
  CorporateAccount = "corporate",
  DigitalAssetVault = "da_vault",
  CryptoCommerce = "crypto_commerce",
  ExoticReceivables = "efx"
}

//* Current groups of products
export enum ProductGroup {
  GlobalPayments = "GlobalPayments",
  EFX = "ExoticReceivables"
}

//* Mapping the product code to the product group
export const ProductGroupMap = {
  [ProductGroup.GlobalPayments]: [
    ProductCode.CorporateAccount,
    ProductCode.DigitalAssetVault,
    ProductCode.CryptoCommerce
  ],
  [ProductGroup.EFX]: [ProductCode.ExoticReceivables]
};

//* Verify if the product code belongs to Global Payments
export const isGlobalPayments = (productCode: ProductCode) => {
  if (ProductGroupMap[ProductGroup.GlobalPayments].includes(productCode))
    return true;
  return false;
};

//* Verify if the product code belongs to EFX
export const isEFX = (productCode: ProductCode) => {
  if (ProductGroupMap[ProductGroup.EFX].includes(productCode)) return true;
  return false;
};

//* Get the product group from the product code
export const getProductGroup = (productCode: ProductCode) => {
  if (isGlobalPayments(productCode)) return ProductGroup.GlobalPayments;
  if (isEFX(productCode)) return ProductGroup.EFX;
  return null;
};
