import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Navigate } from "react-router-dom";
import { Text, Notification } from "@payconstruct/design-system";
import { useAppDispatch, useAppSelector } from "../../redux/hooks/store";
import { updateAccessToken } from "../../config/auth/authSlice";
import { useGetProfileQuery } from "../../services/ControlCenter/ccService";
import { useGetCountriesQuery } from "../../services/bmsService";
import { useGetCurrenciesQuery } from "../../services/currencies";
import { useGetAllUsersQuery } from "../../services/clientManagement";
import { useGetAllClientsQuery } from "../../services/ControlCenter/endpoints/entitiesEndpoint";
import { useGetAllCompaniesQuery } from "../../services/ControlCenter/endpoints/companiesEndpoint";
import { logoutUrl } from "../../config/variables";

const Authorization: React.FC = () => {
  const dispatch = useAppDispatch();

  const { isAuthenticated, error, getAccessTokenSilently, logout } = useAuth0();
  const { token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      getAccessToken();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (error) {
      Notification({
        type: "error",
        message: error?.message ? error?.message : "User not authorized"
      });

      timeout = setTimeout(() => {
        logout({ returnTo: logoutUrl });
        dispatch({ type: "user/LOG_OUT" });
      }, 8000);
    }
    return () => {
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const getAccessToken = async () => {
    try {
      const token = await getAccessTokenSilently();
      dispatch(updateAccessToken(token));
    } catch (error) {
      console.log(error, "ERROR");
    }
  };

  const generateRandomName = Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, "")
    .substr(0, 5);

  const [randomName] = useState(generateRandomName);

  useGetProfileQuery(randomName, {
    refetchOnMountOrArgChange: true,
    skip: token === null
  });

  // Same for Countries
  useGetCountriesQuery(randomName, {
    refetchOnMountOrArgChange: true,
    skip: token === null
  });

  // Get All Currencies
  useGetCurrenciesQuery(randomName, {
    refetchOnMountOrArgChange: true,
    skip: token === null
  });

  // Get All Clients
  useGetAllClientsQuery(randomName, {
    refetchOnMountOrArgChange: true,
    skip: token === null
  });

  // Get All Companies
  useGetAllCompaniesQuery(randomName, {
    refetchOnMountOrArgChange: true,
    skip: token === null
  });

  // Get All Users
  useGetAllUsersQuery(randomName, {
    refetchOnMountOrArgChange: true,
    skip: token === null
  });

  if (token) return <Navigate to={"/"} />;

  return (
    <div style={{ width: "100%" }}>
      <div style={{ textAlign: "center", marginTop: "20%" }}>
        <img
          src={"https://brand.getorbital.com/orbital-icon.png"}
          alt="Orbital"
          width={50}
          height={50}
          style={{ marginBottom: "10px" }}
        />
        <br />
        <Text size="small" label="Orbital loading..." />
      </div>
    </div>
  );
};

export default Authorization;
