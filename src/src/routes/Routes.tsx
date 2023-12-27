import { lazy } from "react";

const Trades = lazy(() => import("../pages/Trades/Trades"));
const Deposit = lazy(() => import("../pages/Trades/Deposit/Deposit"));
const TradeStatus = lazy(
  () => import("../pages/Trades/TradeStatus/TradeStatus")
);
const TradeOffer = lazy(() => import("../pages/Trades/TradeOffer/TradeOffer"));
const ErrorQueueList = lazy(() => import("../pages/ErrorQueue/ErrorQueueList"));
const VendorRates = lazy(() => import("../pages/VendorRates/VendorRates"));
const ErrorQueueView = lazy(() => import("../pages/ErrorQueue/ErrorQueueView"));
const Accounts = lazy(() => import("../pages/Account/AccountList"));
const AccountDetail = lazy(() => import("../pages/Account/AccountDetail"));
const NewPayment = lazy(() => import("../pages/Payments/NewPayment"));
const PaymentStatus = lazy(
  () => import("../pages/Payments/components/PaymentStatus/PaymentStatus")
);
const ClientManagement = lazy(
  () => import("../pages/ClientManagement/Clients")
);
const ClientFileExchange = lazy(
  () => import("../pages/ClientFileExchange/ClientFiles")
);
const ClientSummary = lazy(
  () => import("../pages/ClientManagement/ClientSummary")
);
const LegalAgreements = lazy(
  () => import("../pages/TermsAndConditions/TermsOfService")
);

interface RouteProps {
  path: string;
  parent?: string;
  title: string;
  exact?: boolean;
  main: () => JSX.Element;
}

type RoutesProps = RouteProps[];

export const routes = [
  {
    path: "/",
    exact: true,
    title: "Orders",
    main: () => <Trades />
  },
  //* START - Refactoring Trades to Orders without deprecation to remove in the future
  {
    path: "/trades",
    exact: true,
    title: "Exotic FX Orders",
    main: () => <Trades />
  },
  {
    path: "/trade-offer/:id",
    parent: "/orders",
    exact: true,
    title: "Exotic FX Order",
    main: () => <TradeOffer />
  },
  {
    path: "/trades/deposit",
    parent: "/orders",
    exact: true,
    title: "Exotic FX Order",
    main: () => <Deposit />
  },
  {
    path: "/trades/deposit/trade-status",
    parent: "/orders",
    exact: true,
    title: "Exotic Fx Order",
    main: () => <TradeStatus />
  },
  //* END
  {
    path: "/orders",
    exact: true,
    title: "Exotic FX Orders",
    main: () => <Trades />
  },
  {
    path: "/order/:id",
    parent: "/orders",
    exact: true,
    title: "Exotic FX Order",
    main: () => <TradeOffer />
  },
  {
    path: "/order/deposit",
    parent: "/orders",
    exact: true,
    title: "Exotic FX Order",
    main: () => <Deposit />
  },
  {
    path: "/order/deposit/status",
    parent: "/orders",
    exact: true,
    title: "Exotic Fx Order",
    main: () => <TradeStatus />
  },
  {
    path: "/error-queue",
    title: "Error Queue List",
    exact: true,
    main: () => <ErrorQueueList />
  },
  {
    path: "/error-queue/:id",
    title: "Error Queue List / Summary Details",
    exact: true,
    main: () => <ErrorQueueView />
  },
  {
    path: "/vendor-rates",
    title: "Vendor Rates",
    main: () => <VendorRates />
  },
  {
    path: "/accounts",
    title: "Accounts List",
    main: () => <Accounts />
  },
  {
    path: "/account/:id",
    title: "Accounts",
    exact: true,
    main: () => <AccountDetail />
  },
  {
    path: "/new-payment",
    title: "New Payment",
    exact: true,
    main: () => <NewPayment />
  },
  {
    path: "/new-payment/payment-status",
    exact: true,
    title: "Payment Status",
    main: () => <PaymentStatus />
  },
  {
    path: "/client-management",
    exact: true,
    title: "Clients",
    main: () => <ClientManagement />
  },
  {
    path: "/client-file-exchange",
    exact: true,
    title: "Clients File Exchange",
    main: () => <ClientFileExchange />
  },
  {
    path: "/client/:id",
    exact: true,
    title: "Company Profile",
    main: () => <ClientSummary />
  },
  {
    path: "/terms-of-service",
    exact: true,
    title: "Terms of Service",
    main: () => <LegalAgreements />
  }
] as RoutesProps;
