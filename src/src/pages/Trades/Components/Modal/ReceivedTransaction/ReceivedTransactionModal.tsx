import {
  Colors,
  Modal,
  Text,
  Form,
  Select,
  Row,
  Col,
  Search,
  Checkbox,
  CheckboxCurrency,
  CurrencyTag
} from "@payconstruct/design-system";
import { Spacer } from "../../../../../components/Spacer/Spacer";
import styles from "../Receipt/ReceiptModal.module.css";

// const

const TradeTransactions = () => {
  return (
    <>
      <Row gutter={15} justify="space-between">
        <Col>
          <Text
            label={"Trade-10908517264934"}
            weight="bold"
            size="xsmall"
            color={Colors.grey.neutral900}
          />
          <Spacer size={10} />
        </Col>
        <Col>
          <Text
            label={"25 April, 2021"}
            weight="bold"
            size="xsmall"
            color={Colors.grey.neutral900}
          />
        </Col>
      </Row>
      <Row gutter={15}>
        <Col span={24}>
          {[1, 2, 3].map((item, index) => {
            return (
              <>
                <CheckboxCurrency
                  onChange={(e) => {
                    console.log("OnChange:", e.target.value);
                  }}
                  currencySymbol="CNY"
                  currencyTag={<CurrencyTag currency="CNY" prefix="CNY" />}
                  description="Chinese Yuan Ren"
                  status="approved"
                  title="CNY"
                  value={item}
                />
                <Spacer size={15} />
              </>
            );
          })}
        </Col>
      </Row>
    </>
  );
};
const ModalBody: React.FC = () => {
  return (
    <div
      className={styles["receipt-modal"]}
      style={{ maxHeight: "440px", overflowY: "scroll", overflowX: "hidden" }}
    >
      <Form initialValues={{}}>
        <Row gutter={15}>
          <Col span={14}>
            <Search
              bordered={true}
              style={{ height: "auto" }}
              onChange={() => {
                console.log("Search is changing");
              }}
              onClear={() => {}}
            />
          </Col>
          <Col span={10}>
            <Form.Item name={"currency"}>
              <Select
                label="Currency"
                optionlist={[
                  ["CNY", "CNY"],
                  ["USD", "USD"],
                  ["GBP", "GBP"],
                  ["EUR", "EUR"]
                ]}
                placeholder="Select Options"
              />
            </Form.Item>
          </Col>
        </Row>
        {[1, 2].map((item, index) => (
          <TradeTransactions />
        ))}
      </Form>
    </div>
  );
};

const ReceivedTransactionModal: React.FC = () => {
  return (
    <Modal
      modalView={true}
      title={"Received Transactions"}
      onCancelText={"Cancel"}
      onOkText={"Confirm Received Transaction"}
      onClickCancel={() => {
        console.log("Click Cancel");
      }}
      onClickOk={() => {
        console.log("Click Ok");
      }}
      description={<ModalBody />}
    />
  );
};

export { ReceivedTransactionModal };
