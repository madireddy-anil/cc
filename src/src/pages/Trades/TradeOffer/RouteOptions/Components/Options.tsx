import { FC, Fragment } from "react";
import { Radio } from "antd";
import { Text, Colors } from "@payconstruct/design-system";
import {
  useAppDispatch,
  useAppSelector
} from "../../../../../redux/hooks/store";
import {
  tempSelectRoute,
  tempSelectedRoute as tsr,
  showRouteDetailsModalAction,
  routeList as rl,
  selectRouteIndex,
  selectedRouteIndex as sri,
  Route
} from "../../../../../config/trades/tradeSlice";
import { Card } from "../../../Components/Card/Card";
import { Spacer } from "../../../../../components";
import {
  fractionFormat,
  getLegsCount
} from "../../../../../utilities/transformers";
import css from "./Options.module.css";
import { RouteOptionModal } from "./RouteOptionModal";

interface PropTypes {
  label: string;
  value: string;
}

const RouteOptionData: FC<PropTypes> = ({ label, value }) => {
  return (
    <div>
      <Text label={label} size="small" color={Colors.grey.neutral500} />
      <Text label={value} color={Colors.grey.neutral700} />
    </div>
  );
};

type TOption = {
  index?: number;
  data?: Route;
};

const Option: FC<TOption> = ({ index, data }) => {
  const dispatch = useAppDispatch();
  const handleShowModal = () => {
    dispatch(showRouteDetailsModalAction(true));
  };
  const {
    legs,
    buyAmount,
    buyCurrency,
    vendorAllRate,
    sellCurrency,
    estimatedSellAmount
  } = data as Route;
  const legsCount = legs ? getLegsCount(legs) : undefined;
  const depositAmount = `${buyCurrency} ${fractionFormat(buyAmount)}`;
  const estCost = `${sellCurrency} ${fractionFormat(estimatedSellAmount)}`;
  return (
    <div className={css["option-content"]}>
      <div className={css["option-detail"]}>
        <Text
          label={`Route #${index}`}
          weight="bold"
          color={Colors.grey.neutral700}
        />
        <span className={css["see-more"]} onClick={handleShowModal}>
          {"See more details"}
        </span>
      </div>
      <div className={css["option-data"]}>
        {legsCount && (
          <RouteOptionData
            label="Number of legs"
            value={`${legsCount} ${
              legsCount === 0 || legsCount > 1 ? "legs" : "leg"
            }`}
          />
        )}
        <RouteOptionData label="Deposit Amount" value={depositAmount} />
        <RouteOptionData
          label="Estimated Internal Rate"
          value={String(vendorAllRate)}
        />
        <RouteOptionData label="Vendor Sell Amount" value={estCost} />
      </div>
    </div>
  );
};

interface OptionsProps {
  route?: Route;
}

const SelectedOption: FC<OptionsProps> = ({ route }) => {
  const { neutral50 } = Colors.grey;
  return (
    <>
      <Card
        style={{
          borderColor: neutral50,
          backgroundColor: neutral50
        }}
      >
        <Option index={1} data={route} />
      </Card>
      <RouteOptionModal index={1} route={route} />
    </>
  );
};

interface OptionsProps {
  routes?: Route[];
}

const Options: FC<OptionsProps> = (props) => {
  const dispatch = useAppDispatch();
  const handleSelectRoute = (index: string, route: Route) => {
    dispatch(selectRouteIndex(index));
    dispatch(tempSelectRoute(route));
  };
  const selectedRoute = useAppSelector(tsr);
  const selectedRouteIndex = useAppSelector(sri);
  const routeList = useAppSelector(rl);
  return (
    <>
      <Radio.Group
        name="route-options"
        value={selectedRoute ? selectedRoute.SK : ""}
        style={{
          width: "100%"
        }}
      >
        {routeList.map((route: Route, i: number) => {
          return (
            <Fragment key={i}>
              <Card
                style={
                  selectedRoute && selectedRoute.SK === route.SK
                    ? { borderColor: Colors.blue.blue500 }
                    : {}
                }
              >
                <Radio
                  value={route.SK}
                  onClick={() => handleSelectRoute(String(i + 1), route)}
                >
                  <Option index={i + 1} data={route} />
                </Radio>
              </Card>
              <Spacer size={15} />
            </Fragment>
          );
        })}
      </Radio.Group>
      <RouteOptionModal
        index={Number(selectedRouteIndex)}
        route={selectedRoute as Route}
      />
    </>
  );
};

export { Options, SelectedOption, RouteOptionData };
