import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Modal, Button } from "react-bootstrap";
import TablePagination from "./TablePagination";
import ShopCategoryApi from "../Api/ShopCategoryApi";
import { IMAGE_BASE_URL } from "../Config/Index";
import usePermissions from "../hook/usePermissions";

const ShopCategoryListLayer = () => {
  const { hasPermission } = usePermissions();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Optional: View Modal State if we decide to include it (User said edit,delete enough, but nice to have)
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    const response = await ShopCategoryApi.getShopCategories();
    console.log(response, "response");

    if (response.status) {
      setCategories(response.data.data || response.data);
    }
    setLoading(false);
  };

  const handleViewCategory = (category) => {
    setSelectedCategory(category);
    setShowViewModal(true);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCategories = categories.filter(
    (category) =>
      category.name &&
      category.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalRecords = filteredCategories.length;
  const totalPages = Math.ceil(totalRecords / rowsPerPage);

  const currentData = filteredCategories.slice(
    currentPage * rowsPerPage,
    (currentPage + 1) * rowsPerPage,
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(parseInt(e.target.value));
    setCurrentPage(0);
  };

  const confirmDelete = (category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (categoryToDelete) {
      const response = await ShopCategoryApi.statusUpdate(
        categoryToDelete._id || categoryToDelete.id,
      );
      if (response.status) {
        fetchCategories(); // Refresh list
        setShowDeleteModal(false);
        setCategoryToDelete(null);
      }
    }
  };

  const handleCloseDelete = () => {
    setShowDeleteModal(false);
    setCategoryToDelete(null);
  };

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center flex-wrap gap-3 justify-content-between">
        <h6 className="text-primary-600 pb-2 mb-0">Category List</h6>
        <div className="d-flex align-items-center flex-wrap gap-3 ms-auto">
          <form className="navbar-search">
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

          {hasPermission("Category List", "add") && (
            <Link
              to="/shop-category-create"
              className="btn btn-primary text-sm btn-sm px-12 py-12 radius-8 d-flex align-items-center gap-2"

            >
              <Icon
                icon="ic:baseline-plus"
                className="icon text-xl line-height-1"
              />
              Create Category
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
                <th scope="col">Image</th>
                <th scope="col">Category Name</th>
                <th scope="col">Status</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentData.length > 0 ? (
                currentData.map((category, index) => (
                  <tr key={index}>
                    <td>{currentPage * rowsPerPage + index + 1}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <img
                          src={
                            category.categoryImage
                              ? `${IMAGE_BASE_URL}/${category.categoryImage.path ||
                                category.categoryImage.imagePath
                                }`.replace(/([^:]\/)\/+/g, "$1") // Remove double slashes except after http:
                              : "https://placehold.co/40x40?text=IMG"
                          }
                          alt={category.name}
                          className="w-40-px h-40-px rounded-circle object-fit-cover"
                          onError={(e) => {
                            e.target.src =
                              "https://placehold.co/40x40?text=IMG";
                          }}
                        />
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <span className="text-md mb-0 fw-normal text-secondary-light">
                          {category.name}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge ${category.isActive === 1
                          ? "bg-success-focus text-success-main"
                          : "bg-danger-focus text-danger-main"
                          } px-24 py-4 radius-4 fw-medium text-sm`}
                      >
                        {category.isActive === 1 ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-10">
                        {/* 
                         User said "Action (edit ,delete anough)". 
                         I will keep View button invisible or remove if strictly needed. 
                         But for now I'll include it for complete parity with ShopAdminListLayer 
                         unless user complains. 
                        */}
                        {/* <button
                          type="button"
                          onClick={() => handleViewCategory(category)}
                          className="bg-info-focus bg-hover-info-200 text-info-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
                        >
                          <Icon
                            icon="majesticons:eye-line"
                            className="icon text-xl"
                          />
                        </button> */}
                        {/* Commented out View to strictly follow "Action (edit ,delete anough)" */}

                        {hasPermission("Category List", "edit") && (
                          <Link
                            to={`/shop-category-edit/${category._id || category.id}`}
                            className="btn-edit-custom fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
                          >
                            <Icon icon="lucide:edit" className="menu-icon" />
                          </Link>
                        )}
                        {hasPermission("Category List", "delete") && (
                          <button
                            type="button"
                            onClick={() => confirmDelete(category)}
                            className={`remove-item-btn ${category.isActive === 1 ? 'bg-success-focus text-success-600' : 'bg-danger-focus text-danger-600'} fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle border-0`}
                          >
                            <Icon icon={category.isActive === 1 ? "lucide:unlock" : "lucide:lock"} className="menu-icon text-xl" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalRecords > 0 && (
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleRowsPerPageChange}
            totalRecords={totalRecords}
          />
        )}
      </div>

      <Modal show={showDeleteModal} onHide={handleCloseDelete} centered>
        <Modal.Body className="text-center p-5">
          <div className="d-flex justify-content-center mb-3">
            <div className={`${categoryToDelete?.isActive === 1 ? "bg-success-focus" : "bg-danger-focus"} rounded-circle d-flex justify-content-center align-items-center w-64-px h-64-px`}>
              <Icon
                icon={categoryToDelete?.isActive === 1 ? "lucide:unlock" : "lucide:lock"}
                className={`${categoryToDelete?.isActive === 1 ? "text-success-600" : "text-danger-600"} text-xxl`}
              />
            </div>
          </div>
          <h5 className="mb-3">Are you sure?</h5>
          <p className="text-secondary-light mb-4">
            Do you want to {categoryToDelete?.isActive === 1 ? "disable" : "enable"} category "{categoryToDelete?.name}"?
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
              variant={categoryToDelete?.isActive === 1 ? "danger" : "success"}
              className="px-32"
              onClick={handleDelete}
              style={categoryToDelete?.isActive === 1 ? { backgroundColor: "#003366", borderColor: "#003366" } : {}}
            >
              {categoryToDelete?.isActive === 1 ? "Disable" : "Enable"}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ShopCategoryListLayer;
