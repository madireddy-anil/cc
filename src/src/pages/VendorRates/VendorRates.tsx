import React, { useEffect } from "react";
import { Accordions, Notification, Status } from "@payconstruct/design-system";
import { Header, HeaderContent, PageWrapper, Spacer } from "../../components";
import moment from "moment-timezone";
import {
  RatePost,
  useGetAllRatesQuery,
  useSetRatesMutation
} from "../../services/ratesService";
import style from "./VendorRates.module.css";
import { setLoading, selectTimezone } from "../../config/general/generalSlice";
import { useAppDispatch, useAppSelector } from "../../redux/hooks/store";
import { VendorRateForm } from "./components/VendorRateForm/VendorRateForm";
import { vendorRateHeader } from "./components/VendorRateAccordion/VendorRateHeader";
import { VendorRateSearch } from "./components/VendorRateSearch/VendorRateSearch";
import { selectVendorRates } from "../../config/rate/rateSlice";
import { isValidRate } from "./helpers/vendorRatesHelpers";

const VendorRates: React.FC = () => {
  const dispatch = useAppDispatch();
  const vendorRatesList = useAppSelector(selectVendorRates);
  const timezone = useAppSelector(selectTimezone);

  const [rateForm] = useSetRatesMutation();
  const { refetch, ratesData, isLoading } = useGetAllRatesQuery("allRates", {
    selectFromResult: ({ data, isLoading }) => ({
      ratesData: data?.vendorRates,
      isLoading
    }),
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true
  });

  useEffect(() => {
    if (isLoading) {
      dispatch(setLoading(true));
      return;
    }
    dispatch(setLoading(false));
  }, [isLoading, dispatch]);

  const onSubmit = async (form: RatePost) => {
    dispatch(setLoading(true));

    try {
      form.expiresAt
        ? moment(form.expiresAt).tz(timezone).toISOString()
        : moment().tz(timezone).toISOString();
      await rateForm(form).unwrap();
      dispatch(setLoading(false));
      Notification({
        message: "Rates Changed!",
        description: "A new Rate has been submitted successfully",
        type: "success"
      });
      refetch();
    } catch (err: any) {
      dispatch(setLoading(false));
      Notification({
        message: "Error",
        description: "An Error Occurred",
        type: "error"
      });
    }
  };

  return (
    <main>
      <PageWrapper>
        <div className={style["vendor-rates-custom-header"]}>
          <Header>
            <HeaderContent.LeftSide>
              <HeaderContent.Title>Vendor Rates</HeaderContent.Title>
            </HeaderContent.LeftSide>
            <HeaderContent.RightSide>
              <VendorRateSearch vendorRates={ratesData} />
            </HeaderContent.RightSide>
          </Header>
        </div>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <>
            {vendorRatesList && vendorRatesList?.length < 1 && (
              <div>No results found</div>
            )}
            {vendorRatesList?.map((vendor: any, index: number) => {
              return (
                <div key={`${vendor.vendorId}_${index}`}>
                  <Accordions
                    header=""
                    headerLeft={vendorRateHeader(vendor)}
                    headerRight={
                      isValidRate(vendor.expiresAt, Number(vendor.rate)) ? (
                        <Status
                          type="approved"
                          tooltipText="Active daily rate"
                        />
                      ) : (
                        <Status type="pending" tooltipText="No valid rate" />
                      )
                    }
                    text={VendorRateForm(vendor, onSubmit)}
                  />
                  <Spacer size={10} />
                </div>
              );
            })}
          </>
        )}
      </PageWrapper>
    </main>
  );
};

export default VendorRates;
