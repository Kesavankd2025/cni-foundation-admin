import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Modal, Button } from "react-bootstrap";
import TablePagination from "./TablePagination";
import ProductApi from "../Api/ProductApi";
import ShowNotifications from "../helper/ShowNotifications";
import { IMAGE_BASE_URL } from "../Config/Index";
import usePermissions from "../hook/usePermissions";

const ShopAdminListLayer = () => {
  const { hasPermission } = usePermissions();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);

  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await ProductApi.getProducts(
        currentPage,
        rowsPerPage,
        debouncedSearchTerm,
      );
      if (response && response.status && response.data) {
        const resData = response.data.data;
        if (Array.isArray(resData)) {
          setProducts(resData);
          setTotalRecords(response.data.total || resData.length || 0);
        } else if (resData.docs) {
          setProducts(resData.docs);
          setTotalRecords(response.data.total || resData.total || 0);
        } else {
          setProducts([]);
          setTotalRecords(0);
        }
      } else {
        setProducts([]);
        setTotalRecords(0);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
      setTotalRecords(0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, rowsPerPage, debouncedSearchTerm]);

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setShowViewModal(true);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(parseInt(e.target.value));
    setCurrentPage(0);
  };

  const confirmDelete = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    setIsUpdating(true);
    try {
      const response = await ProductApi.statusUpdate(
        productToDelete._id || productToDelete.id,
      );
      if (response.status) {
        fetchProducts(); // Refresh list
        setShowDeleteModal(false);
        setProductToDelete(null);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCloseDelete = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  const totalPages = Math.ceil(totalRecords / rowsPerPage);

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center justify-content-between flex-wrap gap-3">
        <h6 className="text-primary-600 pb-2 mb-0">Product List</h6>
        <div className="d-flex align-items-center flex-wrap gap-3">
          <form className="navbar-search" onSubmit={(e) => e.preventDefault()}>
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
          {hasPermission("Create Product", "add") && (
            <Link
              to="/shop-add"
              className="btn btn-primary text-sm btn-sm px-12 py-12 radius-8 d-flex align-items-center gap-2"

            >
              <Icon icon="ic:baseline-plus" className="text-xl" />
              Add Product
            </Link>
          )}
        </div>
      </div>
      <div className="card-body p-24">
        <div className="table-responsive scroll-sm">
          <table className="table bordered-table sm-table mb-0">
            <thead>
              <tr>
                <th scope="col">S.No</th>
                <th scope="col">Product Name</th>
                <th scope="col">Category</th>
                <th scope="col" className="text-center">Price</th>
                <th scope="col" className="text-center">Status</th>
                <th scope="col" className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    Loading products...
                  </td>
                </tr>
              ) : products && products.length > 0 ? (
                products.map((product, index) => (
                  <tr key={product._id || product.id}>
                    <td>{currentPage * rowsPerPage + index + 1}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <img
                          src={
                            product.productImage?.path
                              ? `${IMAGE_BASE_URL}/${product.productImage.path}`
                              : typeof product.productImage === "string"
                                ? `${IMAGE_BASE_URL}/${product.productImage}`
                                : "https://placehold.co/40x40?text=Prod"
                          }
                          alt=""
                          className="w-40-px h-40-px rounded-circle flex-shrink-0 me-12 overflow-hidden object-fit-cover"
                          onError={(e) => {
                            e.target.src = "https://placehold.co/40x40?text=Prod";
                          }}
                        />
                        <span className="text-md fw-medium text-secondary-light">
                          {product.productName}
                        </span>
                      </div>
                    </td>
                    <td>{product.categoryName}</td>
                    <td className="text-center">₹{product.price}</td>
                    <td className="text-center">
                      <span className={`badge ${product.isActive === 1 ? 'bg-success-50 text-success-600' : 'bg-danger-50 text-danger-600'} px-20 py-4 radius-4`}>
                        {product.isActive === 1 ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="d-flex align-items-center gap-10 justify-content-center">
                        <button
                          onClick={() => handleViewProduct(product)}
                          type="button"
                          className="bg-info-focus bg-hover-info-200 text-info-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
                        >
                          <Icon icon="majesticons:eye-line" className="icon text-xl" />
                        </button>
                        {hasPermission("Create Product", "edit") && (
                          <Link
                            to={`/shop-edit/${product._id}`}
                            className="btn-edit-custom fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
                          >
                            <Icon icon="lucide:edit" className="menu-icon" />
                          </Link>
                        )}
                        {hasPermission("Create Product", "delete") && (
                          <button
                            type="button"
                            onClick={() => confirmDelete(product)}
                            className={`remove-item-btn ${product.isActive === 1 ? 'bg-success-focus text-success-600' : 'bg-danger-focus text-danger-600'} fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle border-0`}
                          >
                            <Icon icon={product.isActive === 1 ? "lucide:unlock" : "lucide:lock"} className="menu-icon text-xl" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    No products found.
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

      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered size="lg" className="premium-modal">
        <div className="modal-header border-bottom-0 py-20 px-24 d-flex align-items-center justify-content-between bg-white" style={{ borderLeft: "5px solid #003366" }}>
          <div className="d-flex align-items-center gap-3">
            <div className="bg-danger-focus p-10 radius-10 d-flex align-items-center justify-content-center">
              <Icon icon="solar:box-bold-duotone" className="text-danger-600 text-2xl" />
            </div>
            <h5 className="modal-title fw-bold text-primary-600 mb-0 fs-4">
              Product Details
            </h5>
          </div>
          <button
            type="button"
            className="btn-close"
            onClick={() => setShowViewModal(false)}
          ></button>
        </div>
        <Modal.Body className="p-24 pt-0">
          {selectedProduct && (
            <div className="row g-4">
              <div className="col-md-5">
                <div className="position-relative radius-12 overflow-hidden border border-neutral-100 shadow-sm h-100">
                  <img
                    src={selectedProduct.productImage?.path ? `${IMAGE_BASE_URL}/${selectedProduct.productImage.path}` : "https://placehold.co/400x400?text=Prod"}
                    alt={selectedProduct.productName}
                    className="w-100 h-100 object-fit-cover"
                    style={{ minHeight: "300px" }}
                    onError={(e) => {
                      e.target.src = "https://placehold.co/400x400?text=Prod";
                    }}
                  />
                  {selectedProduct.isActive === 1 && (
                    <span className="position-absolute top-12 start-12 badge bg-success text-white px-12 py-6 radius-4 text-xs fw-bold">
                      Available
                    </span>
                  )}
                </div>
              </div>
              <div className="col-md-7">
                <div className="d-flex flex-column h-100">
                  <div className="mb-20">
                    <span className="text-xs text-secondary-light fw-bold uppercase tracking-wider mb-8 d-block">Category</span>
                    <span className="badge bg-danger-focus text-danger-600 px-16 py-8 radius-8 fw-bold text-lg">
                      {selectedProduct.categoryName || "Uncategorized"}
                    </span>
                  </div>

                  <h3 className="text-secondary-light fw-black mb-12 fs-4">{selectedProduct.productName}</h3>

                  <div className="mb-24">
                    <span className="text-xs text-secondary-light fw-bold uppercase tracking-wider mb-4 d-block">Price</span>
                    <h4 className="text-primary-600 fw-black mb-0 fs-4">₹{selectedProduct.price}</h4>
                  </div>

                  <div className="mt-auto p-20 bg-neutral-50 radius-12 border border-neutral-100">
                    <div className="d-flex align-items-center gap-2 mb-12">
                      <Icon icon="solar:notes-bold-duotone" className="text-primary-600 text-xl" />
                      <h6 className="mb-0 fw-bold text-secondary-light fs-5">Product Description</h6>
                    </div>
                    <p className="text-sm text-secondary-light mb-0 lineHeight-2">
                      {selectedProduct.description || "No detailed description available for this product."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <div className="modal-footer border-top-0 p-24 pt-0">
          <button
            type="button"
            className="btn btn-secondary radius-8 px-24"
            onClick={() => setShowViewModal(false)}
          >
            Close Detail View
          </button>
        </div>
      </Modal>

      {/* Delete/Status Modal */}
      <Modal show={showDeleteModal} onHide={handleCloseDelete} centered>
        <Modal.Body className="text-center p-5">
          <div className="d-flex justify-content-center mb-3">
            <div className={`${productToDelete?.isActive === 1 ? "bg-danger-focus" : "bg-success-focus"} rounded-circle d-flex justify-content-center align-items-center w-64-px h-64-px`}>
              <Icon
                icon={productToDelete?.isActive === 1 ? "lucide:unlock" : "lucide:lock"}
                className={`${productToDelete?.isActive === 1 ? "text-success-600" : "text-danger-600"} text-xxl`}
              />
            </div>
          </div>
          <h5 className="mb-3">Are you sure?</h5>
          <p className="text-secondary-light mb-4">
            Do you want to {productToDelete?.isActive === 1 ? "disable" : "enable"} this product?
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Button
              variant="outline-secondary"
              className="px-32"
              onClick={handleCloseDelete}
            >
              Cancel
            </Button>
            <Button
              variant={productToDelete?.isActive === 1 ? "danger" : "success"}
              className="px-32"
              onClick={handleDelete}
              disabled={isUpdating}
              style={productToDelete?.isActive === 1 ? { backgroundColor: "#003366", borderColor: "#003366" } : {}}
            >
              {isUpdating ? "Processing..." : productToDelete?.isActive === 1 ? "Disable" : "Enable"}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ShopAdminListLayer;
