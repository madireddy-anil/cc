import { Header, HeaderContent } from "../../../components/PageHeader/Header";
import { Button } from "@payconstruct/design-system";
import { showFilterAction } from "../../../config/trades/tradeSlice";
import { useAppDispatch } from "../../../redux/hooks/store";

interface TradeFilterProps {}

export const TradeFilter: React.FC<TradeFilterProps> = () => {
  const dispatch = useAppDispatch();

  return (
    <Header>
      <HeaderContent.LeftSide />
      <HeaderContent.RightSide>
        <Button
          label="Filters"
          onClick={() => {
            dispatch(showFilterAction(true));
          }}
          size="medium"
          type="tertiary"
          icon={{
            name: "filter",
            position: "left"
          }}
        />
        {/* <Button
          label="Download Excel"
          onClick={() => {
            downloadXLS();
          }}
          size="medium"
          type="tertiary"
          disabled={true}
          icon={{
            name: "dropdown",
            position: "left"
          }}
        /> */}
      </HeaderContent.RightSide>
    </Header>
  );
};
