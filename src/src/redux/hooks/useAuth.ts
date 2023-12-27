import { useMemo } from "react";
import { useSelector } from "react-redux";
import {
  selectCurrentUser,
  selectMFAToken,
  selectAuth
} from "../../config/auth/authSlice";
import { selectRemember } from "../../config/auth/rememberMeSlice";

export const useAuth = () => {
  const auth = useSelector(selectAuth);

  return useMemo(() => ({ auth }), [auth]);
};

export const useUser = () => {
  const user = useSelector(selectCurrentUser);

  return useMemo(() => ({ user }), [user]);
};

export const useMFAToken = () => {
  const MFAToken = useSelector(selectMFAToken);

  return useMemo(() => ({ MFAToken }), [MFAToken]);
};
export const useRemember = () => {
  const remember = useSelector(selectRemember);

  return useMemo(() => ({ remember }), [remember]);
};
