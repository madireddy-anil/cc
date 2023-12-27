export type FilterOptionType = [string | number, string];

export type DebtorNameType = { debtorName: string };

export type ErrorRowType = {
  createdAt: string;
  debtor: DebtorNameType;
  transactionReference: string;
  processFlow: string;
  isOutbound: true | false;
  debitCurrency: string;
  creditCurrency: string;
  originalInstructedAmount: string;
  messageValidationResult: string;
  exitStatusCode: "E1" | "R1"; // need to get all the possible values.
  id: string;
  daysOutstanding: number;
};

export type FilterObjectType = {
  optionsClient: Array<FilterOptionType>;
  optionsProcessFlow: Array<FilterOptionType>;
  optionsStatus: Array<FilterOptionType>;
};

export type SelectedFilterType = {
  optionsClient: string | undefined;
  optionsProcessFlow: string | undefined;
  optionsStatus: string | undefined;
  optionDayOutstanding: number;
  count: number;
};

export type StatusType = {
  name?: string;
  text: string;
  icon: "checkCircle" | "clockCircle" | "circleInfoOutline";
  color?: string;
};

export type IconKeyType = keyof StatusType;
