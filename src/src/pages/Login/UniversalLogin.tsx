import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

const Login: React.FC = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <>
      {loginWithRedirect({
        portal: "bms",
        prompt: "login"
      })}
    </>
  );
};

export default Login;
