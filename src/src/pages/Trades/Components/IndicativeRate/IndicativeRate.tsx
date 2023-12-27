import { Colors, Text } from "@payconstruct/design-system";
import { Button, Carousel, Col, Row, Space } from "antd";
import React, { useMemo, useRef, useState } from "react";
import { useWindowWidth } from "@react-hook/window-size";
import { Spacer } from "../../../../components/Spacer/Spacer";
import {
  IndicativeRate,
} from "../../../../services/routesService";
import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";
import "./IndicativeRate.css";
import { CarouselRef } from "antd/lib/carousel";
import { Spinner } from "../../../../components/Spinner/Spinner";
import IndicativeRateEmpty from "./IndicativeRateEmpty";
import IndicativeRateItem from "./IndicativeRateItem";


const SCROLL_WIDTH = 15;

interface PropTypes {
  indicativeRates: IndicativeRate[];
  selectedEntityId: string;
  isLoading: boolean;
}

const IndicativeRateComponent: React.FC<PropTypes> = ({
  indicativeRates,
  selectedEntityId,
  isLoading
}) => {
  const [page, setPage] = useState<number>(0);
  const carousel = useRef<CarouselRef | any>();
  const indicativeRatesTotal: number = indicativeRates.length;
  const windowWidth = useWindowWidth();
  const GRID_COLUMN =
    windowWidth < 1050 - SCROLL_WIDTH
      ? 1
      : windowWidth < 1270 - SCROLL_WIDTH
        ? 2
        : windowWidth < 1500 - SCROLL_WIDTH
          ? 3
          : 4;

  const arrayItems = useMemo(
    () =>
      Array.from(
        Array(
          Math.round(
            indicativeRatesTotal >= GRID_COLUMN
              ? indicativeRatesTotal / GRID_COLUMN
              : 1
          )
        ).keys()
      ),
    [indicativeRates, GRID_COLUMN]
  );

  return (
    <>
      {
        isLoading && selectedEntityId ? (
          <div className="indicative-spinner-container">
            <Spinner />
          </div>
        ) : (
            <>
              <Space direction="vertical" size="small" style={{ display: "flex" }}>
                <Text className="text-noue" style={{ fontSize: "13px" }}>
                  To view the unique indicative rates offered to each client entity,
                  select an entity from the drop-down on the right.
                </Text>
                {
                  (indicativeRates.length !== 0 || !selectedEntityId) && (
                    <Text
                      className="text-noue"
                      style={{
                        fontSize: "13px",
                        color: !selectedEntityId ? Colors.grey.neutral500 : Colors.black.primary
                      }}
                      label="Client sell"
                    />
                  )
                }
              </Space>
              <Spacer size={15} />
              <div style={{ marginLeft: -5, marginRight: -5 }}>
                <Carousel
                  effect="scrollx"
                  ref={carousel}
                  afterChange={(activePage) => setPage(activePage)}
                  className="indicative-rate-carousel"
                  dots={false}
                >
                  {arrayItems.map((item: number, i: number) => {
                    const start = i * GRID_COLUMN;
                    const end = Math.min(start + GRID_COLUMN, indicativeRates.length);
                    return (
                      <div key={i}>
                        <Row>
                          {indicativeRates
                            .slice(start, end)
                            .map((rate: IndicativeRate, index: number) => (
                              <IndicativeRateItem
                                key={`${i}-${index}`}
                                rate={rate}
                                selectedEntityId={selectedEntityId}
                              />
                            ))}
                          {
                            indicativeRates.length === 0 && (
                              <IndicativeRateEmpty
                                gridColumn={GRID_COLUMN}
                                selectedEntityId={selectedEntityId}
                              />
                            )
                          }
                        </Row>
                      </div>
                    );
                  })}
                </Carousel>
              </div>
              {/* Custom PAGINATION */}
              {indicativeRates.length > GRID_COLUMN && (
                <Row justify="space-between">
                  <Col style={{ display: "flex", rowGap: "0.5rem", gap: "0.5rem" }}>
                    <Button
                      shape="circle"
                      onClick={() => carousel.current?.prev()}
                      icon={<ArrowLeftOutlined />}
                      size="small"
                    />
                    <Button
                      shape="circle"
                      onClick={() => carousel.current?.next()}
                      icon={<ArrowRightOutlined />}
                      size="small"
                    />
                  </Col>
                  <Col>
                    {arrayItems.map((item: number, index: number) => (
                      <Button
                        key={index}
                        onClick={() => carousel.current?.goTo(index)}
                        size="small"
                        type="link"
                        className="btn-dot"
                        style={{
                          backgroundColor: page === index ? Colors.red.red500 : Colors.grey.neutral200
                        }}
                      >
                        &nbsp;
                      </Button>
                    ))}
                  </Col>
                </Row>
              )}
            </>
          )
      }
    </>
  );
};

export default IndicativeRateComponent;
