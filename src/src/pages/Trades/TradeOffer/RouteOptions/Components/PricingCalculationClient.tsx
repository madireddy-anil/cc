import { FC, useState } from "react";
import {
  Col,
  Row,
  Text
  // Notification
} from "@payconstruct/design-system";
import { Input, Checkbox } from "antd";
import {
  rateFormat,
  fractionFormat
} from "../../../../../utilities/transformers";
import { useGetClientByIdQuery } from "../../../../../services/ControlCenter/endpoints/entitiesEndpoint";
import { EFXFinancials } from "@payconstruct/pp-types";

interface PropTypes {
  clientItem: EFXFinancials;
  orderId: string;
  type: string;
  showInputs: boolean;
  setSpreadData: any;
}

const PricingCalculationClient: FC<PropTypes> = ({
  clientItem,
  type,
  showInputs,
  setSpreadData
}) => {
  const id = clientItem?.counterparty;
  const { data } = useGetClientByIdQuery({ id });
  const clientName = data?.data?.genericInformation?.registeredCompanyName;
  const invertedRate = 1 / parseFloat(clientItem?.rate);
  const [textInput, setTextInput] = useState("");

  const handleClickCheck = () => {
    setSpreadData(textInput);
  };

  const handleChange = ({
    target: { value }
  }: React.ChangeEvent<HTMLInputElement>) => {
    setTextInput(value);
  };

  return (
    <div>
      <Row>
        <Col span={5}>
          <Text label={`Client - ${clientName}`} size="medium" />
        </Col>
        <Col span={4}>
          <Text
            label={
              clientItem?.buyCurrency +
              " " +
              fractionFormat((clientItem?.buyAmount || "").toString())
            }
            size="medium"
          />
        </Col>
        <Col span={4}>
          {type === "exchange" && showInputs ? (
            <div style={{ display: "flex" }}>
              <div style={{ width: "40%", marginRight: "10px" }}>
                <Input
                  key="name"
                  name="name"
                  placeholder={(clientItem?.spread || "").toString()}
                  required
                  type="text"
                  onChange={handleChange}
                />
              </div>
              <div style={{ width: "55%" }}>
                <Checkbox onChange={handleClickCheck}>Adjust?</Checkbox>
              </div>
            </div>
          ) : (
            <Text label={(clientItem?.spread || "").toString()} size="medium" />
          )}
        </Col>
        <Col span={4}>
          <Text label={rateFormat(clientItem?.rate)} size="medium" />
        </Col>
        <Col span={4}>
          <Text
            label={rateFormat((invertedRate || "").toString())}
            size="medium"
          />
        </Col>
        <Col span={3}>
          <Text
            label={
              clientItem?.sellCurrency +
              " " +
              fractionFormat((clientItem?.sellAmount || "").toString())
            }
            size="medium"
          />
        </Col>
      </Row>
    </div>
  );
};

export { PricingCalculationClient };
