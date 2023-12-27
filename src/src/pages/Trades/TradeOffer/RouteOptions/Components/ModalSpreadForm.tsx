import { FC, useState } from "react";

import {
  Modal,
  Form as DSForm,
  Accordions,
  Input
} from "@payconstruct/design-system";

import { Financials, EFXOrderFinancials } from "@payconstruct/pp-types";

import { useAdjustPriceMutation } from "../../../../../services/routesService";
import { Spacer } from "../../../../../components";
import css from "./ModalSpreadForm.module.css";

const getModalBody = (routeData?: EFXOrderFinancials) => {
  const getLegItems = (legData?: Financials, leg?: "exchange" | "local") => {
    const { client, vendor = [] } = legData || {};
    let rate = client?.rate;

    const formItems = vendor.map((vendorRow) => {
      // @ts-ignore
      let { spread, counterparty, name } = vendorRow;
      let count = 0;
      if (!rate) return null;
      const invertedRate = 1 / parseFloat(rate);

      return vendorRow?.deposits?.map((depositRow) => {
        if (!rate) return null;
        let { depositAmount } = depositRow;
        count++;
        const remittanceAmount = depositAmount * parseFloat(rate);
        return (
          <>
            <div className={css["modal-spread-input-row"]}>
              <div>
                <DSForm.Item
                  name={`${leg}-${counterparty}-name-${count}`}
                  initialValue={name}
                >
                  <Input label="Counterparty" disabled={true} />
                </DSForm.Item>
              </div>
              <div>
                <DSForm.Item
                  name={`${leg}-${counterparty}-depositAmount-${count}`}
                  initialValue={depositAmount}
                >
                  <Input label="Deposit Amount" disabled={true} />
                </DSForm.Item>
              </div>
            </div>
            <div className={css["modal-spread-input-row"]}>
              <div>
                <DSForm.Item
                  name={`${leg}-${counterparty}-spread-${count}`}
                  initialValue={spread}
                >
                  <Input label="All-in Spread" disabled={true} />
                </DSForm.Item>
              </div>
              <div>
                <DSForm.Item
                  name={`${leg}-${counterparty}-rate-${count}`}
                  initialValue={rate}
                >
                  <Input label="Client Facing All in Rate" disabled={true} />
                </DSForm.Item>
              </div>
            </div>
            <div className={css["modal-spread-input-row"]}>
              <div>
                <DSForm.Item
                  name={`${leg}-${counterparty}-invertedRate-${count}`}
                  initialValue={invertedRate}
                >
                  <Input label="Inverted All in Rate" disabled={true} />
                </DSForm.Item>
              </div>
              <div>
                <DSForm.Item
                  name={`${leg}-${counterparty}-remittanceAmount-${count}`}
                  initialValue={remittanceAmount}
                >
                  <Input label="Remittance Amount" disabled={true} />
                </DSForm.Item>
              </div>
            </div>
          </>
        );
      });
    });

    return formItems ? formItems : <></>;
  };

  return (
    <>
      <Accordions
        // status="completed"
        unCollapse={true}
        accordionType="simple"
        header="Exchange Leg"
        text={
          <>
            <div className={css["modal-spread-input-row"]}>
              <div style={{ marginRight: 0 }}>
                <DSForm.Item name="exchange">
                  <Input label="Client Spread BPS" />
                </DSForm.Item>
              </div>
            </div>
            {getLegItems(routeData?.exchange, "exchange")}
          </>
        }
      />
      <Spacer size={20} />
      {routeData?.local && (
        <Accordions
          // status="completed"
          unCollapse={true}
          accordionType="simple"
          header="Local Leg"
          text={getLegItems(routeData?.local, "local")}
        />
      )}
    </>
  );
};

const defaultPageState = {
  onOkText: "Save Details",
  onCancelText: "Cancel",
  saveInProgress: false,
  progressBody: "Loading"
};

interface PropTypes {
  setShowSpreadForm: (e: boolean) => void;
  setRouteData: (data: any) => void;
  routeData?: EFXOrderFinancials;
  orderId: string;
}

const ModalSpreadForm: FC<PropTypes> = ({
  setShowSpreadForm,
  routeData,
  orderId,
  setRouteData
}) => {
  console.log(routeData);
  const [form] = DSForm.useForm();
  const [adjustPrice] = useAdjustPriceMutation();

  const [pageState, setPageState] = useState(defaultPageState);

  const onFinish = async (formData: any) => {
    //console.log(formData);
    const payload = {
      exchange: parseInt(formData.exchange)
    };

    try {
      setPageState({
        ...pageState,
        onOkText: "",
        onCancelText: "",
        saveInProgress: true,
        progressBody: "Loading"
      });
      const response = await adjustPrice({ id: orderId, payload }).unwrap();
      setRouteData(response);
      setPageState({
        ...pageState,
        onOkText: "",
        onCancelText: "Close",
        saveInProgress: true,
        progressBody: "Price adjustment is successful"
      });
    } catch (err) {
      setPageState({
        ...pageState,
        onOkText: "",
        onCancelText: "Close",
        saveInProgress: true,
        progressBody: "There was an error adjusting the spread value."
      });
    }
  };

  return (
    <Modal
      title="Adjust Client Spread"
      subTitle="Put in the desired value for Client Spread (BPS)"
      modalView={true}
      modalWidth={800}
      onOkText={pageState.onOkText}
      onCancelText={pageState.onCancelText}
      onClickOk={() => {
        form.submit();
      }}
      onClickCancel={() => {
        setShowSpreadForm(false);
      }}
      description={
        pageState.saveInProgress ? (
          <>{pageState.progressBody}</>
        ) : (
          <DSForm
            form={form}
            onFinish={onFinish}
            initialValues={{ exchange: routeData?.exchange?.client?.spread }}
          >
            {getModalBody(routeData)}
          </DSForm>
        )
      }
    ></Modal>
  );
};

export { ModalSpreadForm };
