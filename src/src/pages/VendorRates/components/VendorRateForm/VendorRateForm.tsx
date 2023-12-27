import {
  TextInput,
  Button,
  DatePicker,
  Text,
  Colors,
  Form
} from "@payconstruct/design-system";
import { Rate } from "@payconstruct/pp-types";
import { Spacer } from "../../../../components";
import style from "../../VendorRates.module.css";
import moment from "moment";
import { RatePost } from "../../../../services/ratesService";

const dateFormat = "DD/MM/YY HH:mm";

const VendorRateForm = (vendor: Rate, submit: (form: RatePost) => void) => {
  const onFinish = (formValues: RatePost) => {
    const { vendorId, expiresAt, pair, rate, vendorName } = formValues;

    submit({
      vendorId,
      expiresAt: moment(expiresAt, "DD/MM/YY HH:mm").toString(),
      pair,
      rate: Number(rate),
      vendorName
    } as RatePost);
  };

  return (
    <Form
      name={`${vendor.vendorId}-${vendor.pair}`}
      id={`${vendor.vendorId}-${vendor.pair}`}
      onFinish={onFinish}
      initialValues={{
        vendorId: vendor.vendorId,
        pair: vendor.pair,
        rate: vendor.rate,
        createdAt: moment(vendor.createdAt),
        expiresAt: moment(vendor.expiresAt),
        vendorName: vendor.vendorName
      }}
    >
      <Form.Item hidden>
        <TextInput
          label="vendorId"
          floatingLabel={true}
          required={true}
          name="vendorId"
        />
        <Form.Item hidden>
          <TextInput
            label="pair"
            floatingLabel={true}
            required={true}
            name="pair"
          />
        </Form.Item>
      </Form.Item>
      <Form.Item name="vendorName">
        <TextInput label="Vendor Name" floatingLabel={true} required={true} />
      </Form.Item>
      <Form.Item name="rate">
        <TextInput label="Rate" floatingLabel={true} required={true} />
      </Form.Item>
      <Form.Item name="createdAt">
        <DatePicker
          style={{ width: "100%" }}
          format={dateFormat}
          placeholder="Created At"
          disabled
        />
      </Form.Item>
      <Spacer size={10} />
      <Form.Item name="expiresAt">
        <DatePicker
          showTime={{ format: "HH:mm" }}
          style={{ width: "100%" }}
          format={dateFormat}
          placeholder="Expiry Time"
        />
      </Form.Item>

      <div className={style["vendor-rates_market"]}>
        <div className={style["vendor-rates__leftSide"]}>
          <Text
            label="Mid-market"
            size="small"
            color={Colors.grey.neutral300}
          />
        </div>
        <div className={style["vendor-rates__rightSide"]}>
          <Text
            label={String(vendor?.rate ?? "N/A")}
            size="small"
            color={Colors.grey.neutral700}
          />
        </div>
      </div>
      <Spacer size={10} />
      <Button
        label="Submit"
        formId={`${vendor.vendorId}-${vendor.pair}`}
        formType="submit"
        size="medium"
        type="primary"
      />
    </Form>
  );
};

export { VendorRateForm };
