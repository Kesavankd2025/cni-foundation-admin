import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";
import Select from "react-select";
import { selectStyles } from "../helper/SelectStyles";
import ZoneApi from "../Api/ZoneApi";
import RegionApi from "../Api/RegionApi";
import ChapterApi from "../Api/ChapterApi";
import MemberApi from "../Api/MemberApi";
import ProductApi from "../Api/ProductApi";
import OrderApi from "../Api/OrderApi";
import usePermissions from "../hook/usePermissions";

const ShopListLayer = () => {
  const { hasPermission } = usePermissions();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    zone: "",
    region: "",
    chapter: "",
    member: "",
    date: new Date().toISOString().split("T")[0],
  });

  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Lists Data
  const [zoneOptions, setZoneOptions] = useState([]);
  const [regionOptions, setRegionOptions] = useState([]);
  const [chapterOptions, setChapterOptions] = useState([]);
  const [memberOptions, setMemberOptions] = useState([]);
  const [productOptions, setProductOptions] = useState([]);

  useEffect(() => {
    fetchZones();
    fetchProducts();
  }, []);

  const fetchZones = async () => {
    const res = await ZoneApi.getZone();
    if (res.status) {
      const options = res.response.data.map((item) => ({
        value: item._id,
        label: item.name,
      }));
      setZoneOptions(options);
    }
  };

  const fetchRegions = async (zoneId) => {
    const res = await RegionApi.getRegionByZone(zoneId);
    if (res.status) {
      const options = res.response.data.map((item) => ({
        value: item._id,
        label: item.region,
      }));
      setRegionOptions(options);
    } else {
      setRegionOptions([]);
    }
  };

  const fetchChapters = async (regionId) => {
    const res = await ChapterApi.getChapter({ regionId });
    if (res.status) {
      const options = res.response.data.map((item) => ({
        value: item._id,
        label: item.chapterName,
      }));
      setChapterOptions(options);
    } else {
      setChapterOptions([]);
    }
  };

  const fetchMembers = async (chapterId) => {
    const res = await MemberApi.getMembers({ chapterId });
    if (res.status) {
      const options = res.response.data.map((item) => ({
        value: item._id,
        label: item.fullName,
      }));
      setMemberOptions(options);
    } else {
      setMemberOptions([]);
    }
  };

  const fetchProducts = async () => {
    const res = await ProductApi.getProducts();
    if (res.status) {
      const options = res.data.data.map((item) => ({
        value: item._id,
        label: item.productName,
        price: item.price,
      }));
      setProductOptions(options);
    }
  };

  const [errors, setErrors] = useState({});

  const handleSelectChange = (selectedOption, { name }) => {
    const value = selectedOption ? selectedOption.value : "";

    setFormData((prev) => {
      const newData = { ...prev, [name]: value };

      // Reset dependent fields
      if (name === "zone") {
        newData.region = "";
        newData.chapter = "";
        newData.member = "";
        setRegionOptions([]);
        setChapterOptions([]);
        setMemberOptions([]);
        if (value) fetchRegions(value);
      } else if (name === "region") {
        newData.chapter = "";
        newData.member = "";
        setChapterOptions([]);
        setMemberOptions([]);
        if (value) fetchChapters(value);
      } else if (name === "chapter") {
        newData.member = "";
        setMemberOptions([]);
        if (value) fetchMembers(value);
      }

      return newData;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleProductSelect = (selectedOption) => {
    if (!selectedOption) return;

    const existingItem = cart.find(
      (item) => item.productId === selectedOption.value,
    );
    if (existingItem) {
      setCart((prev) =>
        prev.map((item) =>
          item.productId === selectedOption.value
            ? { ...item, qty: item.qty + 1, total: (item.qty + 1) * item.price }
            : item,
        ),
      );
    } else {
      setCart((prev) => [
        ...prev,
        {
          productId: selectedOption.value,
          name: selectedOption.label,
          price: selectedOption.price,
          qty: 1,
          amount: selectedOption.price,
          total: selectedOption.price,
        },
      ]);
    }
    setSelectedProduct(null);
    if (errors.cart) {
      setErrors((prev) => ({ ...prev, cart: "" }));
    }
  };

  const updateQuantity = (id, delta) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.productId === id) {
          const newQty = Math.max(1, item.qty + delta);
          return { ...item, qty: newQty, total: newQty * item.price };
        }
        return item;
      }),
    );
  };

  const removeItem = (id) => {
    setCart((prev) => prev.filter((item) => item.productId !== id));
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.total, 0);
  };

  const validateForm = () => {
    let newErrors = {};
    let isValid = true;

    if (!formData.zone) {
      newErrors.zone = "Zone is Required";
      isValid = false;
    }
    if (!formData.region) {
      newErrors.region = "Region is Required";
      isValid = false;
    }
    if (!formData.chapter) {
      newErrors.chapter = "Chapter is Required";
      isValid = false;
    }
    if (!formData.member) {
      newErrors.member = "Member is Required";
      isValid = false;
    }
    if (cart.length === 0) {
      newErrors.cart = "Please add at least one product to the cart";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const payload = {
      zoneId: formData.zone,
      regionId: formData.region,
      chapterId: formData.chapter,
      memberId: formData.member,
      products: cart.map((item) => ({
        productId: item.productId,
        amount: item.amount,
        qty: item.qty,
        price: item.price,
        total: item.total,
      })),
      grantTotal: getTotalPrice(),
    };

    const res = await OrderApi.createOrder(payload);
    if (res.status) {
      navigate("/orders");
    }
  };

  const getSelectedOption = (options, value) => {
    return options.find((option) => option.value === value) || null;
  };

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-header border-bottom bg-base py-16 px-24">
        <h6 className="text-primary-600 pb-2 mb-0">Place New Order</h6>
      </div>
      <div className="card-body p-24">
        <form onSubmit={handleSubmit}>
          <div className="row gy-4">
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Zone <span className="text-danger">*</span>
              </label>
              <Select
                name="zone"
                options={zoneOptions}
                value={getSelectedOption(zoneOptions, formData.zone)}
                onChange={handleSelectChange}
                styles={selectStyles(errors.zone)}
                placeholder="Select Zone"
                isClearable={false}
              />
              {errors.zone && (
                <small className="text-danger">{errors.zone}</small>
              )}
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Region <span className="text-danger">*</span>
              </label>
              <Select
                name="region"
                options={regionOptions}
                value={getSelectedOption(regionOptions, formData.region)}
                onChange={handleSelectChange}
                styles={selectStyles(errors.region)}
                placeholder="Select Region"
                isClearable={false}
              />
              {errors.region && (
                <small className="text-danger">{errors.region}</small>
              )}
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Chapter <span className="text-danger">*</span>
              </label>
              <Select
                name="chapter"
                options={chapterOptions}
                value={getSelectedOption(chapterOptions, formData.chapter)}
                onChange={handleSelectChange}
                styles={selectStyles(errors.chapter)}
                placeholder="Chapter"
                isClearable={false}
              />
              {errors.chapter && (
                <small className="text-danger">{errors.chapter}</small>
              )}
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Member <span className="text-danger">*</span>
              </label>
              <Select
                name="member"
                options={memberOptions}
                value={getSelectedOption(memberOptions, formData.member)}
                onChange={handleSelectChange}
                styles={selectStyles(errors.member)}
                placeholder="Select Member"
                isClearable={false}
              />
              {errors.member && (
                <small className="text-danger">{errors.member}</small>
              )}
            </div>

            <div className="col-12">
              <label className="form-label fw-semibold">
                Select Product <span className="text-danger">*</span>
              </label>
              <Select
                name="product"
                options={productOptions}
                value={selectedProduct}
                onChange={handleProductSelect}
                styles={selectStyles(errors.cart)}
                placeholder="Search & Select Product..."
                isClearable={true}
              />
              {errors.cart && (
                <small className="text-danger">{errors.cart}</small>
              )}
            </div>

            {cart.length > 0 && (
              <div className="col-12">
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th
                          className="text-center"
                          style={{
                            backgroundColor: "#003366",
                            color: "white",
                            border: "none",
                            width: "60px",
                          }}
                        >
                          S.No
                        </th>
                        <th
                          style={{
                            backgroundColor: "#003366",
                            color: "white",
                            border: "none",
                          }}
                        >
                          Product Name
                        </th>
                        <th
                          className="text-center"
                          style={{
                            backgroundColor: "#003366",
                            color: "white",
                            border: "none",
                            width: "200px",
                          }}
                        >
                          Price
                        </th>
                        <th
                          className="text-center"
                          style={{
                            backgroundColor: "#003366",
                            color: "white",
                            border: "none",
                            width: "240px",
                          }}
                        >
                          Quantity
                        </th>
                        <th
                          className="text-center"
                          style={{
                            backgroundColor: "#003366",
                            color: "white",
                            border: "none",
                            width: "220px",
                          }}
                        >
                          Total
                        </th>
                        <th
                          className="text-center"
                          style={{
                            backgroundColor: "#003366",
                            color: "white",
                            border: "none",
                            width: "80px",
                          }}
                        >
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map((item, index) => (
                        <tr key={item.productId}>
                          <td
                            className="text-center align-middle fw-medium"
                            style={{ width: "60px" }}
                          >
                            {index + 1}
                          </td>
                          <td className="align-middle">{item.name}</td>
                          <td
                            className="text-center align-middle"
                            style={{ width: "100px" }}
                          >
                            ₹{item.price}
                          </td>
                          <td
                            className="text-center align-middle"
                            style={{ width: "140px" }}
                          >
                            <div className="d-flex justify-content-center">
                              <div
                                className="d-flex border rounded"
                                style={{ width: "120px" }}
                              >
                                <button
                                  type="button"
                                  className="btn btn-light border-0 d-flex align-items-center justify-content-center"
                                  style={{ width: "40px" }}
                                  onClick={() =>
                                    updateQuantity(item.productId, -1)
                                  }
                                  disabled={item.qty <= 1}
                                >
                                  <Icon
                                    icon="mdi:minus"
                                    style={{ fontSize: "16px" }}
                                  />
                                </button>
                                <div
                                  className="d-flex align-items-center justify-content-center fw-semibold"
                                  style={{
                                    width: "40px",
                                    backgroundColor: "#f8f9fa",
                                    borderLeft: "1px solid #dee2e6",
                                    borderRight: "1px solid #dee2e6",
                                  }}
                                >
                                  {item.qty}
                                </div>
                                <button
                                  type="button"
                                  className="btn btn-light border-0 d-flex align-items-center justify-content-center"
                                  style={{ width: "40px" }}
                                  onClick={() =>
                                    updateQuantity(item.productId, 1)
                                  }
                                >
                                  <Icon
                                    icon="mdi:plus"
                                    style={{ fontSize: "16px" }}
                                  />
                                </button>
                              </div>
                            </div>
                          </td>
                          <td
                            className="text-center align-middle"
                            style={{ width: "120px" }}
                          >
                            ₹{item.total}
                          </td>
                          <td className="align-middle">
                            <button
                              type="button"
                              className="btn btn-primary btn-sm p-1 d-flex align-items-center justify-content-center"
                              style={{ width: "32px", height: "32px" }}
                              onClick={() => removeItem(item.productId)}
                            >
                              <Icon
                                icon="mdi:trash-can-outline"
                                style={{ fontSize: "18px" }}
                              />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td
                          colSpan="4"
                          className="text-end fw-bold align-middle"
                        >
                          Grand Total:
                        </td>
                        <td
                          colSpan="2"
                          className="fw-bold fs-5 text-primary-600 align-middle"
                        >
                          ₹{getTotalPrice()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div className="d-flex justify-content-end gap-2 mt-24">
            {/* <Link
              to="/shop-list"
              className="btn btn-outline-danger-600 px-32 radius-8 justify-content-center"
            >
              Cancel
            </Link> */}
            {hasPermission("Place Order", "add") && (
              <button
                type="submit"
                className="btn btn-primary radius-8 px-20 py-11"
              >
                Confirm Order
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShopListLayer;
