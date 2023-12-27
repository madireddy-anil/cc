import { FC } from "react";
import { Modal, Table } from "@payconstruct/design-system";
import {
  useAppDispatch,
  useAppSelector
} from "../../../../../redux/hooks/store";
import {
  showRouteDetailsModal,
  showRouteDetailsModalAction,
  // selectedRouteIndex as sri,
  tempSelectedRoute as tsr,
  Route
} from "../../../../../config/trades/tradeSlice";
import { Card } from "../../../Components/Card/Card";
import { RouteOptionData } from "./Options";
import { Spacer, CurrencyBadge, Badge } from "../../../../../components";
import {
  fractionFormat,
  getLegsCount
} from "../../../../../utilities/transformers";
import css from "./RouteOptionModal.module.css";

const OptionData: FC = () => {
  const tempSelectedRoute = useAppSelector(tsr);
  if (tempSelectedRoute) {
    const {
      legs,
      buyAmount,
      buyCurrency,
      vendorAllRate,
      sellCurrency,
      estimatedSellAmount
    } = tempSelectedRoute;
    const legsCount = getLegsCount(legs);
    const depositAmount = `${buyCurrency} ${fractionFormat(buyAmount)}`;
    const estCost = `${sellCurrency} ${fractionFormat(estimatedSellAmount)}`;

    return (
      <div className={css["option-data"]}>
        <Card>
          <RouteOptionData
            label="Number of legs"
            value={`${legsCount} ${
              legsCount === 0 || legsCount > 1 ? "legs" : "leg"
            }`}
          />
          <div className={css["divider"]} />
          <RouteOptionData label="Deposit Amount" value={depositAmount} />
          <div className={css["divider"]} />
          <RouteOptionData
            label="Estimated Internal Rate"
            value={String(vendorAllRate)}
          />
          <div className={css["divider"]} />
          <RouteOptionData label="Vendor Sell Amount" value={estCost} />
        </Card>
      </div>
    );
  }
  return null;
};

const columns = [
  { key: "num", title: "#", dataIndex: "num" },
  {
    key: "vendorName",
    title: "Vendor Name",
    dataIndex: "vendorName",
    render: (data: any) => {
      return (
        <>
          <div>
            <strong>{data.name}</strong>
          </div>
          <div className={css["row-sub-data"]}>
            {data.data.map((d: string, i: number) => (
              <span key={i}>{d}</span>
            ))}
          </div>
        </>
      );
    }
  },
  // { key: "depositCy", title: "Deposit Currency", dataIndex: "depositCy" },
  {
    key: "depositCy",
    title: "Deposit Currency",
    dataIndex: "depositCy",
    render: (data: any) => {
      return (
        <>
          <div>{data.currency}</div>
          <div className={css["row-sub-data"]}>
            {data.amount.map((d: string, i: number) => (
              <span key={i}>
                <span>{d}</span>
                <CurrencyBadge currency={data.currency} />
              </span>
            ))}
          </div>
        </>
      );
    }
  },
  {
    key: "remittanceCy",
    title: "Remittance Currency",
    dataIndex: "remittanceCy"
  },
  // {
  //   key: "remittanceCy",
  //   title: "Remittance Currency",
  //   dataIndex: "remittanceCy",
  //   render: (data: any) => {
  //     return (
  //       <>
  //         <div>{data.currency}</div>
  //         <div className={css["row-sub-data"]}>
  //           {data.amount.map((d: string, i: number) => (
  //             <span key={i}>
  //               <span>{d}</span>
  //               <CurrencyBadge currency={data.currency} />
  //             </span>
  //           ))}
  //         </div>
  //       </>
  //     );
  //   }
  // },
  {
    key: "expVendorRate",
    title: "Exp. Vendor Rate",
    dataIndex: "expVendorRate"
  },
  {
    key: "status",
    title: "Rate Status",
    dataIndex: "status",
    render: (data: boolean) => {
      const color = data ? "green" : "yellow";
      return <Badge color={color} />;
    }
  }
];

interface RouteOptionModalProps {
  route?: Route;
  index?: number;
}
const RouteOptionModal: FC<RouteOptionModalProps> = ({ index, route }) => {
  const dispatch = useAppDispatch();
  // const selectedRouteIndex = useAppSelector(sri);
  // const tempSelectedRoute: any = useAppSelector(tsr); // Property 'rate' does not exist on type 'VendorLeg'
  const visible = useAppSelector(showRouteDetailsModal);

  const handleHideModal = () => {
    dispatch(showRouteDetailsModalAction(false));
  };

  const getLegData = (leg: any, num: string, name: string) => {
    const legData: any = {
      remittanceCy: leg.buyCurrency,
      expVendorRate: leg.rate,
      status: leg.rateValid
    };
    const vendorName: any = {};
    if (name) {
      legData.num = num;
      vendorName.name = name;
    } else {
      legData.num = "";
      vendorName.name = <span dangerouslySetInnerHTML={{ __html: "&nbsp;" }} />;
    }
    const vendorNameData = [];
    for (let dep of leg.deposits) {
      vendorNameData.push(`${leg.vendorName} / ${dep.accountNumber}`);
    }
    vendorName.data = vendorNameData;
    legData.vendorName = vendorName;
    const depositCy: any = {
      currency: leg.sellCurrency
    };
    const depositCyAmount = [];
    for (let dep of leg.deposits) {
      depositCyAmount.push(fractionFormat(dep.depositAmount));
    }
    depositCy.amount = depositCyAmount;
    legData.depositCy = depositCy;
    // const remittanceCy: any = {
    //   currency: leg.buyCurrency
    // };
    // const remittanceCyAmount = [];
    // for (let dep of leg.deposits) {
    //   remittanceCyAmount.push(fractionFormat(dep.depositAmount));
    // }
    // remittanceCy.amount = remittanceCyAmount;
    // legData.remittanceCy = remittanceCy;
    return legData;
  };

  const routeOptionData = [];
  if (route) {
    if (route.legs?.local) {
      for (let leg of route.legs.local) {
        let legName = route.legs.local.indexOf(leg) === 0 ? "Local" : "";
        const tmp = getLegData(leg, "1", legName);
        routeOptionData.push(tmp);
      }
    }
    if (route.legs?.exchange) {
      for (let leg of route.legs.exchange) {
        let legName = route.legs.exchange.indexOf(leg) === 0 ? "Exchange" : "";
        const tmp = getLegData(leg, "2", legName);
        routeOptionData.push(tmp);
      }
    }
  }

  return (
    <Modal
      title={`Route #${index}`}
      description={
        <div className={css["route-option-modal-content"]}>
          {Boolean(route) && <OptionData />}
          <Spacer size={25} />
          <div className={css["table-wrapper"]}>
            {route ? (
              <Table
                dataSource={routeOptionData}
                tableColumns={columns}
                tableSize="medium"
                pagination={false}
                rowClassName={css["table-row"]}
              />
            ) : null}
          </div>
        </div>
      }
      onCancelText="Cancel"
      onClickCancel={handleHideModal}
      modalWidth={870}
      modalView={visible}
      // modalView={visible && Boolean(tempSelectedRoute)}
    />
  );
};

export { RouteOptionModal };
