import React from "react";
import ReactDOM from "react-dom";
import { Auth0Provider } from "@auth0/auth0-react";
import "./index.css";
import App from "./app/App";
import reportWebVitals from "./reportWebVitals";
import {
  clientId,
  audience,
  domain,
  redirectionUrl,
  auth0Scope
} from "./config/variables";

ReactDOM.render(
  <Auth0Provider
    domain={domain}
    clientId={clientId}
    audience={audience}
    redirectUri={redirectionUrl}
    scope={auth0Scope}
  >
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </Auth0Provider>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
