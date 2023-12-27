export const validationOnData = (data: any, label: string) => {
  let returnResp;
  if (label === "array") {
    returnResp =
      data !== undefined && data !== null && data?.length > 0 ? data : [];
  }
  if (label === "string") {
    returnResp = data !== undefined && data !== null ? data : "";
  }
  if (label === "object") {
    returnResp =
      data !== undefined && data !== null && Object.entries(data)?.length > 0
        ? data
        : {};
  }
  return returnResp;
};

export const capitalize = (label: string) => {
  if (typeof label !== "string") return "";
  return label.charAt(0).toUpperCase() + label.slice(1);
};

export const formatProductsData = (data: any[]) => {
  return data
    .filter((item: any) => item.isActive === true)
    .map((product: any) => {
      return product.productCode;
    });
};

// Question response format
export const getFormatedResponse = (
  questions: any,
  headerRequired: boolean
) => {
  return questions?.map((question: any) => {
    const formatedQuestion = {
      ...question,
      header: question.label,
      type: question.type,
      name: question.schemaFieldName,
      required: question.isMandatory,
      message: question.description,
      options: question.options,
      mode: question?.isMultipleSelect ? "multiple" : "single"
    };
    // omitting some properties
    const {
      label,
      isDisabled,
      isMandatory,
      schemaFieldName,
      dbSchema,
      createdAt,
      updatedAt,
      isExternal,
      isHidden,
      linkedCompany,
      ...rest
    } = formatedQuestion;
    !headerRequired && delete rest?.header;
    !headerRequired && (rest.label = question.label);
    return rest;
  });
};

export const formatGenericInfoForInitialData = (genericInfo: any) => {
  const registered: any = {};
  const principal: any = {};
  const postal: any = {};
  genericInfo &&
    (genericInfo?.addresses || []).forEach((item: any) => {
      validationOnData(item, "object") &&
        Object.entries(item).forEach(([key, value]): any => {
          if (item.type === "registered" || !item.type) {
            registered[key] = value;
          }
          if (item.type === "principal_place_of_business") {
            principal[key] = value;
          }
          if (item.type === "postal") {
            postal[key] = value;
          }
        });
    });

  const isIndustryExist =
    genericInfo?.industries &&
    genericInfo?.industries[0] &&
    genericInfo.industries[0];

  const country =
    Object.entries(registered).length > 0 &&
    registered !== undefined &&
    registered !== null &&
    registered?.country;

  const returnResp = {
    ...genericInfo,
    industryName: isIndustryExist?.industryType,
    subType: isIndustryExist?.subType,
    comment: isIndustryExist?.comment,
    registerAddress: registered,
    principalAddress: principal,
    postalAddress: postal,
    country: country,
    relationshipManager: genericInfo?.entityAssignees.length
      ? validationOnData(
          genericInfo?.entityAssignees[0].relationshipManager?._id,
          "string"
        )
      : undefined,
    customerAccountSpecialist: genericInfo?.entityAssignees.length
      ? validationOnData(
          genericInfo?.entityAssignees[0].customerAccountSpecialist?._id,
          "string"
        )
      : undefined
  };
  return returnResp;
};

export const formatCountriesListForOptionSet = (countries: any) => {
  return (countries || []).map((item: any) => {
    return [item.name, item.name];
  });
};

export const sortData = (a: any, b: any) => {
  const letterA = a.label || a.name || a.createdAt;
  const letterB = b.label || b.name || b.createdAt;

  let comparison = 0;
  if (letterA > letterB) {
    comparison = 1;
  } else if (letterA < letterB) {
    comparison = -1;
  }
  return comparison;
};

export const formatDocumentForInitialData = (allFiles: any) => {
  if (allFiles.length > 0 && allFiles !== undefined && allFiles !== null) {
    return (allFiles || []).map((file: any) => {
      const document =
        file && Object.assign({}, file, { name: file?.fileName });
      delete document?.fileName;
      return document;
    });
  }
};

export const updateProgressLogOnDocumentsUpload = (
  documents: any[],
  requiredDocuments: any[]
) => {
  const uploadedDocs = (documents || []).filter(
    (doc, index) =>
      documents.findIndex((obj) => obj.documentType === doc.documentType) ===
      index
  );
  let overAllUploadStatus = false;
  if (
    uploadedDocs.length > 0 &&
    uploadedDocs.length === requiredDocuments.length &&
    requiredDocuments.length > 0
  ) {
    overAllUploadStatus = true;
  } else {
    overAllUploadStatus = false;
  }
  return overAllUploadStatus;
};

export const totalSharePercentOfPeople = (people: any[]) => {
  let arrSum;
  const addedSharePercenatge: any[] = [];
  if (people?.length > 0) {
    people.forEach((element) => {
      const checkNumber = element.percentageOfShares
        ? element.percentageOfShares
        : 0;
      addedSharePercenatge.push(parseFloat(checkNumber));
    });
    arrSum = addedSharePercenatge.reduce((a, b) => a + b, 0);
  } else {
    arrSum = 0;
  }
  return arrSum;
};

export const fileDownloader = (
  url: string,
  fileName: string,
  fileType: string
) => {
  const link: HTMLAnchorElement = document.createElement("a");
  link.download = fileName;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const filePreview = (
  url: string,
  fileName: string,
  fileType: string
) => {
  const link: HTMLAnchorElement = document.createElement("a");
  link.download = fileName;
  link.href = url;
  link.target = "_blank";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const generateRandomName = Math.random()
  .toString(36)
  .replace(/[^a-z]+/g, "")
  .substr(0, 5);

export const camelize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const getCamelCase = (statusArr: any, N: number) => {
  let result = "";
  for (let i = 0; i < N; i++) {
    //if the current word is not 1st insert a space
    if (result.length > 0) {
      result += " ";
    }
    // put the first character of statusArr[i]
    result += statusArr[i][0].toUpperCase();
    for (let j = 1; j < statusArr[i].length; j++) {
      // if a space is found, the next character should be in upper case
      if (statusArr[i][j] === " ") {
        result += " ";
        result += statusArr[i][j + 1].toUpperCase();
        j++;
      }
      // otherwise the characters must be in the lower case
      else {
        result += statusArr[i][j].toLowerCase();
      }
    }
  }
  return result;
};

export const amountFormatter = (amount: number, precision?: number) => {
  precision = precision || 2;
  const formatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: precision
  });
  const numberFormatForDisplay = formatter.format(amount);
  return numberFormatForDisplay;
};
