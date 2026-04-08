import { Icon } from "@iconify/react/dist/iconify.js";
import React from "react";
import Select from "react-select";
import { selectStyles } from "../helper/SelectStyles";

const TablePagination = ({
  currentPage,
  totalPages,
  onPageChange,
  rowsPerPage,
  onRowsPerPageChange,
  totalRecords,
}) => {
  const renderPageNumbers = () => {
    let pages = [];
    const delta = 1; // Number of pages to show on each side of the active page
    const left = currentPage + 1 - delta;
    const right = currentPage + 1 + delta;
    let range = [];
    let rangeWithEllipsis = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= left && i <= right)) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithEllipsis.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithEllipsis.push('...');
        }
      }
      rangeWithEllipsis.push(i);
      l = i;
    }

    return rangeWithEllipsis.map((i, index) => {
      if (i === '...') {
        return (
          <li key={`ellipsis-${index}`} className="page-item disabled">
            <span className="page-link border-0 bg-transparent text-secondary-light px-1">...</span>
          </li>
        );
      }
      return renderPageItem(i);
    });
  };

  const renderPageItem = (i) => (
    <li key={i} className="page-item">
      <button
        className={`page-link fw-medium radius-8 border-0 py-10 d-flex align-items-center justify-content-center h-48-px w-48-px ${currentPage === i - 1
          ? "bg-primary-600 text-white"
          : "bg-primary-50 text-secondary-light"
          }`}
        onClick={() => onPageChange(i - 1)}
      >
        {i}
      </button>
    </li>
  );

  const options = [
    { value: 10, label: "10" },
    { value: 20, label: "20" },
    { value: 50, label: "50" },
    { value: 70, label: "70" },
    { value: 100, label: "100" },
  ];

  const handleSelectChange = (selectedOption) => {
    onRowsPerPageChange({ target: { value: selectedOption.value } });
  };

  const paginationSelectStyles = {
    ...selectStyles(),
    control: (base, state) => ({
      ...selectStyles().control(base, state),
      minHeight: "40px",
      height: "40px",
      minWidth: "80px",
    }),
    valueContainer: (base) => ({
      ...base,
      height: "40px",
      padding: "0 8px",
    }),
    indicatorsContainer: (base) => ({
      ...base,
      height: "40px",
    }),
  };

  const selectedOption =
    options.find((opt) => opt.value === parseInt(rowsPerPage)) || options[0];

  return (
    <div className="d-flex align-items-center justify-content-end flex-wrap gap-3 mt-24">
      <div className="d-flex align-items-center gap-2 me-8">
        <span className="text-secondary-light fw-medium">Show</span>
        <Select
          value={selectedOption}
          onChange={handleSelectChange}
          options={options}
          styles={paginationSelectStyles}
          isSearchable={false}
          isClearable={false}
          menuPlacement="auto"
          menuPortalTarget={document.body}
        />
      </div>
      <span className="text-secondary-light">
        Showing {totalRecords === 0 ? 0 : currentPage * rowsPerPage + 1} to{" "}
        {Math.min((currentPage + 1) * rowsPerPage, totalRecords)} of{" "}
        {totalRecords} Entries
      </span>
      <ul className="pagination d-flex flex-wrap align-items-center gap-2 justify-content-center mb-0">
        <li className={`page-item ${currentPage === 0 ? "disabled" : ""}`}>
          <button
            className="page-link bg-primary-50 text-secondary-light fw-medium radius-8 border-0 py-10 d-flex align-items-center justify-content-center h-48-px w-48-px"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 0}
          >
            <Icon icon="ep:d-arrow-left" className="text-xl" />
          </button>
        </li>
        {renderPageNumbers()}
        <li
          className={`page-item ${currentPage === totalPages - 1 ? "disabled" : ""
            }`}
        >
          <button
            className="page-link bg-primary-50 text-secondary-light fw-medium radius-8 border-0 py-10 d-flex align-items-center justify-content-center h-48-px w-48-px"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
          >
            <Icon icon="ep:d-arrow-right" className="text-xl" />
          </button>
        </li>
      </ul>
    </div>
  );
};

export default TablePagination;
