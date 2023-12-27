import React, { useState } from "react";
import { Pagination as DSPagination } from "@payconstruct/design-system";
import style from "./pagination.module.css";
import { useEffect } from "react";

interface PaginationProps {
  reset?: boolean;
  list: any[];
  pageSize?: number;
  onChange: (list: any[]) => void;
  pageOption?: any[];
}

/**
 *
 * @param list - Array list with data to be show `[]`
 * @param onChange - Will trigger after changing pagination, returns an array for current page.
 * You can sent a dispatch event to update state with current page
 * 
 * `(list) => {
    dispatch(changePageAction(list));
  `
 * @returns
 */
const Pagination: React.FC<PaginationProps> = ({
  reset,
  list,
  onChange,
  pageSize: size = 5,
  pageOption: options = ["5", "10", "15"]
}) => {
  const [pageSize, setPageSize] = useState(size);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageOption] = useState(options);

  useEffect(() => {
    onChange(list?.slice((currentPage - 1) * pageSize, currentPage * pageSize));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, list]);

  useEffect(() => {
    if (reset) setCurrentPage(1);
  }, [reset]);

  const onChangeHandler = (page: number, size = pageSize) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  if (list?.length === 0) return <div></div>;
  return (
    <DSPagination
      className={style["CP-pagination"]}
      // Having total=0 causes an issue (antd) state due to the negative range not properly handled.
      total={list?.length === 0 ? 1 : list?.length}
      showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
      defaultPageSize={pageSize}
      defaultCurrent={currentPage}
      size="small"
      showSizeChanger={list?.length > 5}
      pageSizeOptions={pageOption}
      onChange={onChangeHandler}
      onShowSizeChange={onChangeHandler}
    />
  );
};

export { Pagination };
