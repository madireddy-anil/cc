import React, { useState } from "react";
import { Pagination as DSPagination } from "@payconstruct/design-system";
import style from "./pagination.module.css";
import { useEffect } from "react";

interface PaginationProps {
  reset?: boolean;
  list: any[];
  pageSize?: number;
  onChange: (pageNumber: number, pageSize: number) => void;
  accountsTotal: number;
  pageNumber: number;
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
  pageSize,
  accountsTotal,
  pageNumber,
  pageOption: options = ["5", "10", "15"]
}) => {
  const [pageSizeState, setPageSize]: any = useState(pageSize);
  const [currentPage, setCurrentPage] = useState(pageNumber);
  const [pageOption, setPageOption] = useState(options);

  useEffect(() => {
    onChange(currentPage, pageSizeState);
  }, [currentPage, pageSizeState]);

  useEffect(() => {
    if (reset) setCurrentPage(1);
  }, [reset]);

  const onChangeHandler = (page: number, size = pageSize) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  if (!list) return <div></div>;
  return (
    <DSPagination
      className={style["CP-pagination"]}
      total={accountsTotal}
      showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
      defaultPageSize={pageSizeState}
      defaultCurrent={pageNumber}
      size="small"
      showSizeChanger={list?.length >= 5}
      pageSizeOptions={pageOption}
      onChange={onChangeHandler}
      onShowSizeChange={onChangeHandler}
      current={pageNumber}
    />
  );
};

export { Pagination as PaginationDynamic };
