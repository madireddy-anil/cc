import { useAuth } from "../redux/hooks/useAuth";
import { useAppDispatch } from "../redux/hooks/store";
import { RouteProps, useLocation, Outlet, Navigate } from "react-router-dom";
import jwt_decode from "jwt-decode";
import PageNotFound from "../pages/4xx/404";
import { useRevokeTokenMutation } from "../services/tokenService";

export const PrivateRoute: React.FC<RouteProps> = () => {
  let {
    auth: { token }
  } = useAuth();
  const dispatch = useAppDispatch();
  const [revokeToken] = useRevokeTokenMutation();

  // Handle token expiration time
  const logoutOnTokenExpire = (token: string) => {
    const decodeToken: any = jwt_decode(token);

    const tokenExpireAt = decodeToken?.exp;
    const currentTime = (new Date().getTime() + 1) / 1000;
    if (currentTime >= tokenExpireAt) {
      revokeToken();
      dispatch({ type: "user/LOG_OUT" });
    } else {
      const setTime = (tokenExpireAt - currentTime) * 1000;
      setTimeout(() => {
        revokeToken();
        dispatch({ type: "user/LOG_OUT" });
      }, setTime);
    }
  };

  if (token) logoutOnTokenExpire(token);

  return <>{token ? <Outlet /> : <Navigate to="/login" />}</>;
};

export function NoMatch() {
  return <PageNotFound />;
}

export const LocationDisplay = () => {
  const location = useLocation();

  return <div data-testid="location-display">{location.pathname}</div>;
};
