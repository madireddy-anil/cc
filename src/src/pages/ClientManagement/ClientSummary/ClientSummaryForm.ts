export const formatCountriesListForOptionSet = (countries: any) => {
  return (countries || []).map((item: any) => {
    return [item.name, item.name];
  });
};

export const formatProductListForOptionSet = (products: any) => {
  return (products || []).map((item: any) => {
    return [item.productCode, item.product];
  });
};

export const IndustryOptionList: any = [
  ["commodities", "Commodities"],
  ["iGaming", "iGaming"],
  ["forex", "Forex"],
  ["gambling", "Gambling"],
  ["private_aviation", "Private Aviation"],
  ["psp", "PSP"],
  ["saas", "Saas"],
  ["retail", "Retail"],
  ["other", "Other"]
];

export const forexIndustries: any = [
  ["broker", "Broker"],
  ["platform_service", "Platform- or Service provider"],
  ["gambling", "Gambling"],
  ["other", "Other"]
];
export const gamingIndustries: any = [
  ["operator", "Operator"],
  ["platform_service", "Platform- or Service provider"],
  ["gambling", "Gambling"],
  ["other", "Other"]
];

export const subIndustries: any = [
  ["broker", "Broker"],
  ["gambling", "Gambling"],
  ["operator", "Operator"],
  ["platform_service", "Platform- or Service Provider"],
  ["other", "Other"]
];

export const tierList: any = [
  ["tier1", "Tier 1"],
  ["tier2", "Tier 2"],
  ["tier3", "Tier 3"]
];

export const companyTypes: any = [
  ["LTD", "Limited company"],
  ["REG_PARTNER", "Registered partnership"],
  ["NON_REG_PARTNER", "Non-Registered partnership"],
  ["LTD_BY_GUARANTEE", "Limited by guarantee"],
  ["SOLE_TRADER", "Sole trader"],
  ["NON_PROFIT", "Non profit"],
  ["CHARITY", "Charity"],
  ["TRUST", "Trust"],
  ["LTD_PARTNER", "Limited partnership"],
  ["JOINT_STOCK", "Joint-stock"],
  ["COOP", "Cooperative"],
  ["ASSOCIATION", "Association"],
  ["JOINT_VENTURE", "Joint-venture"],
  ["SIMPLE_LTD", "Simple limited company"],
  ["PLC", "Private Limited Company"],
  ["ECONOMIC_INTEREST_ASSOCIATION", "Economic interest association"],
  ["LLP", "Limited liability partnership"],
  ["PENSION_SCHEME", "Pension scheme"],
  ["CORPORATION", "Corporation"],
  ["SOE", "SOE"],
  ["PUBLIC_SECTOR", "Public sector"],
  ["S_CORPORATION", "S corporation"],
  ["SLP", "Scottish limited partnership"]
];

export const BrandAndProductData: any = [
  {
    key: 1,
    label: "Main Product",
    value: [
      "Restricted Currency Transfer",
      "PayConstruct - Restricted Currency Transfer - China"
    ]
  },
  {
    key: 2,
    label: "Sub-Product 1",
    value: [
      "PayConstruct - Restricted Currency Transfer - China",
      "Restricted Currency Transfer"
    ]
  },
  {
    key: 3,
    label: "Sub-Product 2",
    value: [
      "Restricted Currency Transfer",
      "PayConstruct - Restricted Currency Transfer - China"
    ]
  }
];

export const websiteFormData: any = [
  {
    index: "ddd",
    type: "text",
    name: "website",
    label: "Website",
    required: true,
    message: "Website is required!"
  },
  {
    index: "fff",
    type: "text",
    name: "name",
    label: "Name",
    required: true,
    message: "Name is required!"
  }
];

export const rightSideHeaderData: any = [
  {
    key: 1,
    label: "Documents"
  },
  {
    key: 2,
    label: "People"
  }
  // {
  //   key: 3,
  //   label: "Beneficiaries"
  // }
];

export const kycStatusList: any = [
  ["fail", "Fail"],
  ["new", "New"],
  ["pass", "Pass"],
  ["pending", "Pending"],
  ["review_required", "Review Required"]
];

export const rolePosition: any = [
  ["director", "Director"],
  ["shareholder", "Shareholder"]
];

export const yesNoOptions: any = [
  { label: "Yes", value: true },
  { label: "No", value: false }
];
