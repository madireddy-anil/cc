import { useEffect, useState } from "react";
import { Button } from "@payconstruct/design-system";
import {
  TableWrapper,
  Header,
  HeaderContent,
  PageWrapper
} from "../../../components";

import ErrorQueueListTable from "./components/ErrorQueueListTable";
import FilterDrawer from "./components/FilterDrawer";
// import { selectErrorQueues } from "../../../config/errorQueue/errorQueueSlice";
import { useAppSelector } from "../../../redux/hooks/store";
import { useGetErrorQueuesQuery } from "../../../services/errorQueueService";

import { ErrorRowType, SelectedFilterType } from "./components/errorQueueTypes";
import { Spinner } from "../../../components/Spinner/Spinner";
import { useGetVendorsQuery } from "../../../services/ControlCenter/endpoints/entitiesEndpoint";

const selectedFilterState: SelectedFilterType = {
  optionsClient: undefined,
  optionsProcessFlow: undefined,
  optionsStatus: undefined,
  optionDayOutstanding: 0,
  count: 0
};

export const ErrorQueueList = () => {
  const [showFilter, setShowFilter] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(selectedFilterState);
  const [cTime, setCTime] = useState<string>();
  // const dataSource: ErrorRowType[] = useAppSelector(selectErrorQueues);

  const { isLoading, data: queueList } = useGetErrorQueuesQuery(
    `error_queue_${cTime}`,
    {
      skip: !cTime
    }
  );
  const errorQueueList = queueList?.data?.payments || [];

  const { isLoading: isVendorEntityLoading, data: vendorList } =
    useGetVendorsQuery(`GET_VENDORS_LIST_IN_ERROR_QUEUE_LIST_${cTime}`, {
      skip: !cTime
    });
  const vendorsList = vendorList?.data?.entities || [];

  useEffect(() => {
    setCTime(new Date().toLocaleTimeString());
  }, []);

  const handleSetShowFilter = () => {
    setShowFilter(!showFilter);
  };

  return (
    <main>
      <PageWrapper>
        <Header>
          <HeaderContent.LeftSide>
            <HeaderContent.Title>Error Queue List </HeaderContent.Title>
          </HeaderContent.LeftSide>
          <HeaderContent.RightSide>
            <Button
              label={`Filter ${
                selectedFilter.count > 0 ? `(${selectedFilter.count})` : ""
              }`}
              onClick={() => {
                handleSetShowFilter();
              }}
              size="large"
              type="tertiary"
              icon={{
                name: "filter",
                position: "left"
              }}
            />
          </HeaderContent.RightSide>
        </Header>
        <TableWrapper>
          {isLoading ? (
            <Spinner />
          ) : (
            <ErrorQueueListTable
              isVendorEntityLoading={isVendorEntityLoading}
              vendorsList={vendorsList}
              dataSource={errorQueueList}
              filterObject={selectedFilter}
            />
          )}
        </TableWrapper>
      </PageWrapper>
      <FilterDrawer
        visible={showFilter}
        handleClose={handleSetShowFilter}
        dataSource={errorQueueList}
        setFilter={setSelectedFilter}
        selectedFilter={selectedFilter}
      />
    </main>
  );
};

// Export need to be default for code Splitting
// https://reactjs.org/docs/code-splitting.html#route-based-code-splitting
export { ErrorQueueList as default };
