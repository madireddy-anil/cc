import moment from "moment-timezone";

export const formatPair = (pair: string) => {
  const formattedPair = pair.split(".").join(" / ");
  if (!formattedPair) {
    return pair;
  }
  return formattedPair;
};

export const isValidRate = (expiresAt: string, rate?: number) => {
  if (rate === 0) return false;
  return !!rate && moment(new Date()).isBefore(expiresAt);
};
