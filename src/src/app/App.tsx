import { Suspense, lazy, useEffect } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { Routes } from "react-router";
import { PrivateRoute, NoMatch } from "../routes/PrivateRoute";
import { load, selectLocale } from "../config/i18n/localeSlice";
import { LOCALE } from "../config/i18n/locales";
import { IntlProvider } from "react-intl";
import { store } from "../redux/store";
import { Provider } from "react-redux";
import { useAppDispatch, useAppSelector } from "../redux/hooks/store";
import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";
import Menu from "../components/SideMenu/Menu";
import { routes } from "../routes/Routes";
import { TopBar } from "../components/TopBar/TopBar";

const Login = lazy(() => import("../pages/Login/UniversalLogin"));
const ResetPassword = lazy(
  () => import("../pages/ChangePassword/ChangePassword")
);
const UniversalLogin = lazy(
  () => import("../pages/Authorization/Authorization")
);

let persistor = persistStore(store);

const App = () => (
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <Router>
        <AsyncIntlProvider>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/login" element={<Login />} />

              <Route path="/password_reset" element={<ResetPassword />} />

              <Route
                path="/verify-authorization"
                element={<UniversalLogin />}
              />

              <Route path="/" element={<PrivateRoute />}>
                <Route path="/" element={<Menu />}>
                  {routes.map((route) => (
                    <Route
                      key={route.path}
                      path={route.path}
                      element={
                        <>
                          <TopBar
                            title={route.title}
                            parentPage={route.parent}
                          />
                          <route.main />
                        </>
                      }
                    />
                  ))}
                </Route>
              </Route>
              <Route path="*" element={<NoMatch />} />
            </Routes>
          </Suspense>
        </AsyncIntlProvider>
      </Router>
    </PersistGate>
  </Provider>
);

const AsyncIntlProvider: React.FC = ({ children }) => {
  const locale = LOCALE.ENGLISH;
  const dispatch = useAppDispatch();
  const translation = useAppSelector(selectLocale);

  useEffect(() => {
    import(`../config/i18n/locales/${locale}.json`).then((file) => {
      dispatch(load(file.default));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <IntlProvider locale={locale} messages={translation} defaultLocale="en-US">
      {children}
    </IntlProvider>
  );
};

export default App;
