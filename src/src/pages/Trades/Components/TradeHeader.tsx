import { Header, HeaderContent } from "../../../components/PageHeader/Header";
import { Button } from "@payconstruct/design-system";
import { showFilterAction } from "../../../config/trades/tradeSlice";
import { useAppDispatch } from "../../../redux/hooks/store";

interface TradeHeaderProps {
  newTrade: () => void;
  downloadXLS: () => void;
}

export const TradeHeader: React.FC<TradeHeaderProps> = ({
  newTrade,
  downloadXLS
}) => {
  const dispatch = useAppDispatch();

  return (
    <Header>
      <HeaderContent.LeftSide>
        <HeaderContent.Title>Exotic FX Orders</HeaderContent.Title>
        <Button
          label="New EFX Order"
          icon={{
            name: "add",
            position: "left"
          }}
          onClick={() => {
            newTrade();
          }}
          size="small"
          type="primary"
        />
      </HeaderContent.LeftSide>
    </Header>
  );
};
