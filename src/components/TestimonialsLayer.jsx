import React, { useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Modal, Button } from "react-bootstrap";
import usePermissions from "../hook/usePermissions";

const TestimonialsLayer = () => {
  const { hasPermission } = usePermissions();
  const [showModal, setShowModal] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);

  // Mock data
  const testimonials = [
    {
      id: 1,
      memberName: "Logarajan S P",
      company: "e-intellisafe & Security Solutions",
      testimonial:
        "Excellent platform for business networking. I have received numerous quality referrals through this network. The professional environment and support from fellow members have been outstanding.",
      date: "2025-12-15",
      rating: 5,
    },
    {
      id: 2,
      memberName: "Mathiarasu M",
      company: "TECHMAXX ENGINEERING",
      testimonial:
        "Being part of this community has significantly impacted my business growth. The weekly meetings are productive and the relationships built here are valuable.",
      date: "2025-12-10",
      rating: 5,
    },
    {
      id: 3,
      memberName: "Mano Neelamegam",
      company: "WUDFE INC",
      testimonial:
        "Great experience working with professional members. The networking opportunities are fantastic and I have made valuable business connections.",
      date: "2025-12-05",
      rating: 4,
    },
    {
      id: 4,
      memberName: "Kumar Raj S",
      company: "Insure Tech Serv",
      testimonial:
        "This networking group has been instrumental in expanding my client base. Highly recommend for serious business professionals.",
      date: "2025-11-28",
      rating: 5,
    },
    {
      id: 5,
      memberName: "Priya Sharma",
      company: "Design Studio Pro",
      testimonial:
        "Amazing community of like-minded entrepreneurs. The support and collaboration have helped me grow my business exponentially.",
      date: "2025-11-20",
      rating: 5,
    },
  ];

  const handleView = (testimonial) => {
    setSelectedTestimonial(testimonial);
    setShowModal(true);
  };

  const renderStars = (rating) => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <Icon
          key={index}
          icon={
            index < rating
              ? "material-symbols:star"
              : "material-symbols:star-outline"
          }
          className={index < rating ? "text-warning" : "text-secondary-light"}
          style={{ fontSize: "14px" }}
        />
      ));
  };

  return (
    <div
      style={{
        background: "var(--bg-color)",
        minHeight: "100vh",
        padding: "1.25rem",
      }}
    >
      {/* Header section */}
      <div className="d-flex align-items-center justify-content-between mb-24 px-12">
        <div className="d-flex align-items-center">
          <div
            className="bg-danger-600 radius-2"
            style={{ width: "4px", height: "32px" }}
          ></div>
          <div className="ms-12">
            <h5 className="fw-bold mb-0" style={{ color: "#101828" }}>
              Testimonials Report
            </h5>
            <p className="text-sm text-secondary-light mb-0">
              Member testimonials and ratings
            </p>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="container-fluid">
        <div className="row g-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="col-xl-4 col-lg-4 col-md-6 col-sm-12"
            >
              <div
                className="h-100 shadow-sm d-flex flex-column"
                style={{
                  backgroundColor: "var(--white)",
                  borderRadius: "14px",
                  border: "1px solid var(--border-color)",
                }}
              >
                <div className="p-3 d-flex flex-column flex-grow-1">
                  {/* Header - Name and Rating */}
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <h6
                      className="mb-0 fw-semibold"
                      style={{
                        fontSize: "15px",
                        color: "var(--text-primary-light)",
                      }}
                    >
                      {testimonial.memberName}
                    </h6>
                    <div className="d-flex gap-1">
                      {renderStars(testimonial.rating)}
                    </div>
                  </div>

                  {/* Company */}
                  <div
                    style={{
                      fontSize: "11px",
                      color: "var(--text-secondary-light)",
                    }}
                    className="mb-3"
                  >
                    {testimonial.company}
                  </div>

                  {/* Testimonial Content */}
                  <div className="flex-grow-1">
                    <div
                      className="rounded-3 p-3 mb-3 h-100"
                      style={{
                        background: "var(--neutral-50)",
                        border: "1px solid var(--border-color)",
                      }}
                    >
                      <p
                        className="mb-0"
                        style={{
                          fontSize: "12px",
                          lineHeight: "1.6",
                          color: "var(--text-primary-light)",
                          textAlign: "justify",
                        }}
                      >
                        {testimonial.testimonial.substring(0, 120)}
                        {testimonial.testimonial.length > 120 ? "..." : ""}
                      </p>
                    </div>
                  </div>

                  {/* Footer - Date and Button */}
                  <div className="d-flex align-items-center justify-content-between mt-auto">
                    <small
                      style={{
                        fontSize: "10px",
                        color: "var(--text-secondary-light)",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Icon icon="mdi:calendar" className="me-1" />
                      {new Date(testimonial.date).toLocaleDateString()}
                    </small>
                    {hasPermission("Testimonials Report", "view") && (
                      <button
                        type="button"
                        onClick={() => handleView(testimonial)}
                        className="btn btn-sm d-flex align-items-center"
                        style={{
                          background: "var(--primary-600)",
                          color: "#fff",
                          padding: "4px 12px",
                          fontSize: "11px",
                          borderRadius: "6px",
                          border: "none",
                        }}
                        title="View Full Testimonial"
                      >
                        <Icon icon="mdi:eye-outline" className="me-1" />
                        View
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* View Testimonial Modal */}
      <Modal
        centered
        show={showModal}
        onHide={() => setShowModal(false)}
        size="md"
        className="border-0"
      >
        <Modal.Body className="p-0">
          {selectedTestimonial && (
            <div className="p-4">
              {/* Close button */}
              <div className="d-flex justify-content-end mb-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="btn btn-link p-0 text-muted"
                >
                  <Icon icon="mdi:close" style={{ fontSize: "24px" }} />
                </button>
              </div>

              {/* Content */}
              <div className="text-center mb-4">
                <div className="mb-3">
                  <div className="d-inline-block p-3 rounded-circle border">
                    <Icon
                      icon="mdi:account"
                      className="text-primary"
                      style={{ fontSize: "40px" }}
                    />
                  </div>
                </div>

                <h4 className="fw-bold mb-1">
                  {selectedTestimonial.memberName}
                </h4>
                <p className="text-muted mb-2">{selectedTestimonial.company}</p>
                <div className="d-flex justify-content-center gap-1 mb-4">
                  {renderStars(selectedTestimonial.rating)}
                </div>
              </div>

              {/* Testimonial */}
              <div className="mb-4">
                <p
                  className="text-center mb-0 px-3"
                  style={{
                    lineHeight: "1.8",
                    fontSize: "1.1rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  "{selectedTestimonial.testimonial}"
                </p>
              </div>

              {/* Footer */}
              <div className="text-center mt-5 pt-4 border-top">
                <small className="text-muted d-block mb-1">
                  <Icon icon="mdi:calendar-outline" className="me-1" />
                  Shared on{" "}
                  {new Date(selectedTestimonial.date).toLocaleDateString()}
                </small>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default TestimonialsLayer;
