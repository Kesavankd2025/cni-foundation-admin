import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";
import TablePagination from "./TablePagination";
import OrderApi from "../Api/OrderApi";
import usePermissions from "../hook/usePermissions";
import { formatDate } from "../helper/DateHelper";

const OrdersLayer = () => {
  const { hasPermission } = usePermissions();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await OrderApi.getOrderList(
        null,
        currentPage,
        rowsPerPage,
        debouncedSearchTerm,
      );

      if (res.status && res.response) {
        const data = res.response.data;
        if (Array.isArray(data)) {
          setOrders(data);
          setTotalRecords(res.response.total || data.length || 0);
        } else if (data.docs) {
          setOrders(data.docs);
          setTotalRecords(res.response.total || data.total || 0);
        } else {
          setOrders([]);
          setTotalRecords(0);
        }
      } else {
        setOrders([]);
        setTotalRecords(0);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage, rowsPerPage, debouncedSearchTerm]);

  const totalPages = Math.ceil(totalRecords / rowsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(parseInt(e.target.value));
    setCurrentPage(0); // Reset to first page
  };

  const handleStatusChange = async (id, newStatus) => {
    const res = await OrderApi.updateOrderStatus(id, newStatus);
    if (res.status) {
      fetchOrders();
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Pending":
        return "bg-warning-focus text-warning-main";
      case "Processing":
        return "bg-info-focus text-info-main";
      case "Shipped":
        return "bg-neutral-200 text-neutral-600";
      case "Delivered":
        return "bg-success-focus text-success-main";
      case "Cancelled":
        return "bg-danger-focus text-danger-main";
      default:
        return "bg-neutral-200 text-neutral-600";
    }
  };

  // Modal Logic
  const [showModal, setShowModal] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  const handleViewOrder = async (id) => {
    const res = await OrderApi.getOrderDetails(id);
    if (res.status) {
      setSelectedOrderDetails(res.response.data);
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrderDetails(null);
  };
  const statusStyles = `
    .status-dropdown .dropdown-toggle::after {
      display: none;
    }
    .status-dropdown .dropdown-menu {
      border: 1px solid #e5e7eb;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      border-radius: 12px;
      padding: 8px;
      min-width: 140px;
      z-index: 1060;
    }
    .status-dropdown .dropdown-item {
      border-radius: 8px;
      padding: 8px 12px;
      font-weight: 500;
      transition: all 0.2s;
      margin-bottom: 2px;
    }
    .status-dropdown .dropdown-item:last-child {
      margin-bottom: 0;
    }
    .status-dropdown .dropdown-item:hover {
      background-color: #f3f4f6;
    }
    .status-dropdown .dropdown-item.active {
      background-color: #fef2f2;
      color: #C4161C;
    }
  `;

  return (
    <>
      <style>{statusStyles}</style>
      <div className="card h-100 p-0 radius-12">
        <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center flex-wrap gap-3 justify-content-between">
          <h6 className="text-primary-600 pb-2 mb-0">Orders List</h6>
          <div className="d-flex align-items-center flex-wrap gap-3 ms-auto">
            <form
              className="navbar-search"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="text"
                className="bg-base h-40-px w-auto"
                name="search"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(0);
                }}
              />
              <Icon icon="ion:search-outline" className="icon" />
            </form>
          </div>
        </div>
        <div className="card-body p-24">
          <div className="table-responsive scroll-sm" style={{ minHeight: "400px" }}>
            <table className="table bordered-table sm-table mb-0">
              <thead>
                <tr>
                  <th scope="col" style={{ backgroundColor: "#003366", color: "white" }}>S.No</th>
                  <th scope="col" style={{ backgroundColor: "#003366", color: "white" }}>Order ID</th>
                  <th scope="col" style={{ backgroundColor: "#003366", color: "white" }}>Customer</th>
                  <th scope="col" style={{ backgroundColor: "#003366", color: "white" }}>Phone Number</th>
                  <th scope="col" className="text-center" style={{ backgroundColor: "#003366", color: "white" }}>
                    Total Qty
                  </th>
                  <th scope="col" style={{ backgroundColor: "#003366", color: "white" }}>Amount</th>
                  <th scope="col" style={{ backgroundColor: "#003366", color: "white" }}>Created Date</th>
                  <th scope="col" style={{ backgroundColor: "#003366", color: "white" }}>Status</th>
                  <th scope="col" style={{ backgroundColor: "#003366", color: "white" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" className="text-center py-4">
                      Loading orders...
                    </td>
                  </tr>
                ) : orders.length > 0 ? (
                  orders.map((order, index) => (
                    <tr key={order._id}>
                      <td>
                        <span className="text-md mb-0 fw-medium text-secondary-light">
                          {currentPage * rowsPerPage + index + 1}
                        </span>
                      </td>
                      <td>
                        <span className="text-md mb-0 fw-medium text-primary-600">
                          #{order.orderId}
                        </span>
                      </td>
                      <td>
                        <span className="text-md mb-0 fw-normal text-secondary-light">
                          {order.memberName ? order.memberName : "N/A"}
                        </span>
                      </td>
                      <td>
                        <span className="text-md mb-0 fw-normal text-secondary-light">
                          {order.phoneNumber ? order.phoneNumber : "N/A"}
                        </span>
                      </td>
                      <td className="text-center text-md mb-0 fw-normal text-secondary-light">
                        {order.totalQty ? order.totalQty : 0}
                      </td>
                      <td>
                        <span className="text-md mb-0 fw-normal text-secondary-light">
                          ₹{order.grantTotal}
                        </span>
                      </td>
                      <td>
                        <span className="text-md mb-0 fw-normal text-secondary-light">
                          {formatDate(order.orderDate)}
                        </span>
                      </td>
                      <td>
                        <div className="dropdown status-dropdown text-start">
                          <button
                            className={`badge radius-4 px-12 py-6 border-0 dropdown-toggle text-xs fw-bold d-inline-flex align-items-center gap-1 ${getStatusBadgeClass(
                              order.status,
                            )}`}
                            type="button"
                            data-bs-toggle={
                              hasPermission("Orders List", "edit")
                                ? "dropdown"
                                : ""
                            }
                            aria-expanded="false"
                            disabled={!hasPermission("Orders List", "edit")}
                            style={{ cursor: hasPermission("Orders List", "edit") ? 'pointer' : 'default' }}
                          >
                            {order.status}
                            {hasPermission("Orders List", "edit") && <Icon icon="lucide:chevron-down" className="ms-1" style={{ fontSize: '12px' }} />}
                          </button>
                          <ul className="dropdown-menu  shadow-lg border-0">
                            {[
                              "Pending",
                              "Processing",
                              "Shipped",
                              "Delivered",
                              "Cancelled",
                            ].map((status) => (
                              <li key={status}>
                                <button
                                  className={`dropdown-item ${order.status === status ? "active" : ""}`}
                                  onClick={() =>
                                    handleStatusChange(order._id, status)
                                  }
                                >
                                  <div className="d-flex align-items-center gap-2">
                                    <span className="text-xs">{status}</span>
                                  </div>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-10">
                          {hasPermission("Orders List", "view") && (
                            <button
                              type="button"
                              onClick={() => handleViewOrder(order._id)}
                              className="bg-info-focus bg-hover-info-200 text-info-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle border-0"
                            >
                              <Icon
                                icon="majesticons:eye-line"
                                className="icon text-xl"
                              />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center py-4">
                      No orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleRowsPerPageChange}
            totalRecords={totalRecords}
          />
        </div>
      </div>

      {/* Order Details Modal */}
      {showModal && selectedOrderDetails && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1050 }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content radius-16 border-0 shadow-lg overflow-hidden">
              <div className="modal-header border-bottom-0 py-20 px-24 d-flex align-items-center justify-content-between bg-white" style={{ borderLeft: "5px solid #003366" }}>
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-danger-focus p-10 radius-10 d-flex align-items-center justify-content-center">
                    <Icon icon="solar:bill-list-bold-duotone" className="text-danger-600 text-2xl" />
                  </div>
                  <h5 className="modal-title fw-bold text-primary-600 mb-0 fs-4">
                    Order Details - <span className="text-secondary-light">#{selectedOrderDetails.orderId}</span>
                  </h5>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                ></button>
              </div>

              <div className="modal-body p-24 pt-0">
                {/* Info Cards */}
                <div className="row g-4 mb-24">
                  <div className="col-md-7">
                    <div className="bg-neutral-50 radius-12 p-16 h-100 border border-neutral-100">
                      <div className="d-flex align-items-center gap-2 mb-16">
                        <Icon icon="solar:user-bold-duotone" className="text-primary-600 text-xl" />
                        <h6 className="mb-0 fw-bold text-secondary-light fs-5">Client Information</h6>
                      </div>
                      <div className="row g-3">
                        <div className="col-12">
                          <label className="text-xs text-secondary-light fw-medium mb-1 d-block uppercase tracking-wider">Name</label>
                          <span className="text-sm fw-bold text-secondary-light">{selectedOrderDetails.memberName}</span>
                        </div>
                        <div className="col-sm-6">
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <Icon icon="solar:phone-bold-duotone" className="text-danger-600 text-xs" />
                            <label className="text-xs text-secondary-light fw-medium mb-0 uppercase tracking-wider">Contact</label>
                          </div>
                          <span className="text-sm fw-bold text-secondary-light">{selectedOrderDetails.contactNumber}</span>
                        </div>
                        <div className="col-sm-6">
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <Icon icon="solar:map-point-bold-duotone" className="text-danger-600 text-xs" />
                            <label className="text-xs text-secondary-light fw-medium mb-0 uppercase tracking-wider">Zone</label>
                          </div>
                          <span className="text-sm fw-bold text-secondary-light">{selectedOrderDetails.zoneName}</span>
                        </div>
                        <div className="col-sm-6">
                          <label className="text-xs text-secondary-light fw-medium mb-1 d-block uppercase tracking-wider">Region</label>
                          <span className="text-sm fw-bold text-secondary-light">{selectedOrderDetails.regionName}</span>
                        </div>
                        <div className="col-sm-6">
                          <label className="text-xs text-secondary-light fw-medium mb-1 d-block uppercase tracking-wider">Chapter</label>
                          <span className="text-sm fw-bold text-secondary-light">{selectedOrderDetails.chapterName}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-5">
                    <div className="bg-neutral-50 radius-12 p-16 h-100 border border-neutral-100">
                      <div className="d-flex align-items-center gap-2 mb-16">
                        <Icon icon="solar:box-bold-duotone" className="text-primary-600 text-xl" />
                        <h6 className="mb-0 fw-bold text-secondary-light fs-5">Order Summary</h6>
                      </div>
                      <div className="mb-16">
                        <label className="text-xs text-secondary-light fw-medium mb-1 d-block uppercase tracking-wider">Order Date</label>
                        <div className="d-flex align-items-center gap-2">
                          <Icon icon="solar:calendar-bold-duotone" className="text-secondary-light text-sm" />
                          <span className="text-sm fw-bold text-secondary-light">{formatDate(selectedOrderDetails.orderDate)}</span>
                        </div>
                      </div>
                      <div className="mb-16">
                        <label className="text-xs text-secondary-light fw-medium mb-1 d-block uppercase tracking-wider">Current Status</label>
                        <span className={`badge radius-6 px-12 py-6 fw-bold text-xs ${getStatusBadgeClass(selectedOrderDetails.status)}`}>
                          {selectedOrderDetails.status}
                        </span>
                      </div>
                      <div className="mt-auto">
                        <label className="text-xs text-secondary-light fw-medium mb-1 d-block uppercase tracking-wider">Total Items</label>
                        <span className="text-lg fw-black text-primary-600">{selectedOrderDetails.products.reduce((acc, p) => acc + p.qty, 0)} Units</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Table */}
                <div className="table-responsive radius-12 border border-neutral-100 overflow-hidden">
                  <table className="table bordered-table sm-table mb-0">
                    <thead>
                      <tr>
                        <th className="bg-neutral-50 text-secondary-light fw-bold text-xs uppercase" style={{ width: '40%' }}>Product Name</th>
                        <th className="bg-neutral-50 text-secondary-light fw-bold text-xs uppercase text-center">Quantity</th>
                        <th className="bg-neutral-50 text-secondary-light fw-bold text-xs uppercase text-end">Price</th>
                        <th className="bg-neutral-50 text-secondary-light fw-bold text-xs uppercase text-end">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrderDetails.products.map((item, idx) => (
                        <tr key={idx}>
                          <td>
                            <span className="text-sm fw-bold text-secondary-light">{item.productName}</span>
                          </td>
                          <td className="text-center">
                            <span className="badge bg-neutral-200 text-secondary-light px-10 py-4 radius-4 fw-bold text-xs">{item.qty}</span>
                          </td>
                          <td className="text-end fw-medium text-secondary-light text-sm">₹{item.price}</td>
                          <td className="text-end fw-bold text-secondary-light text-sm">₹{item.total}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-top-0">
                      <tr>
                        <td colSpan="3" className="text-end py-16">
                          <span className="text-md fw-bold text-secondary-light me-2">Grand Total</span>
                        </td>
                        <td className="text-end py-16 bg-danger-50">
                          <span className="text-lg fw-black text-primary-600">₹{selectedOrderDetails.grantTotal}</span>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div className="modal-footer border-top-0 p-24 pt-0">
                <button
                  type="button"
                  className="btn btn-outline-neutral-600 px-32 py-11 radius-8 fw-semibold"
                  onClick={closeModal}
                >
                  Close
                </button>
                {/* <button
                  type="button"
                  className="btn btn-primary px-32 py-11 radius-8 fw-bold"
                  style={{ backgroundColor: "#003366", borderColor: "#003366", boxShadow: "0 4px 12px rgba(0, 51, 102, 0.2)" }}
                  onClick={() => window.print()}
                >
                  <Icon icon="solar:printer-bold-duotone" className="me-2 text-xl" />
                  Print Invoice
                </button> */}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrdersLayer;
