import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";
import EventApi from "../Api/EventApi";
import { IMAGE_BASE_URL } from "../Config/Index";
import { formatDate } from "../helper/DateHelper";
import { toast } from "react-toastify";

const WebsiteEventDetailsLayer = () => {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            if (!id) return;
            try {
                const res = await EventApi.getEventById(id);
                if (res.status) {
                    setEvent(res.response);
                } else {
                    toast.error("Event not found");
                }
            } catch (error) {
                console.error("Error fetching event details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (!event) return <div>Event not found</div>;

    return (
        <div className="card h-100 p-0 radius-12">
            <div className="card-header border-bottom bg-base py-16 px-24 d-flex justify-content-between align-items-center">
                <h6 className="text-primary-600 mb-0">Event Details</h6>
                <Link to="/website-event-list" className="btn btn-secondary-50 text-secondary-light px-20 py-10 radius-8">
                    Back to List
                </Link>
            </div>
            <div className="card-body p-24">
                {/* Event Info */}
                <div className="row mb-32">
                    <div className="col-md-4">
                        {event.image ? (
                            <img
                                src={`${IMAGE_BASE_URL}/${event.image.path}`}
                                alt={event.title}
                                className="w-100 h-200-px object-fit-cover radius-12"
                            />
                        ) : (
                            <div className="w-100 h-200-px bg-neutral-100 d-flex justify-content-center align-items-center radius-12">
                                <Icon icon="solar:gallery-bold" className="text-secondary-light text-xxl" />
                            </div>
                        )}
                    </div>
                    <div className="col-md-8">
                        <h4 className="mb-16">{event.title}</h4>
                        <div className="d-flex align-items-center gap-24 mb-16 text-secondary-light">
                            <span className="d-flex align-items-center gap-8">
                                <Icon icon="solar:calendar-date-bold" />
                                {formatDate(event.date)}
                            </span>
                            <span className="d-flex align-items-center gap-8">
                                <Icon icon="solar:map-point-bold" />
                                {event.venue}
                            </span>
                        </div>
                        <p className="text-secondary-light mb-0">{event.details}</p>
                    </div>
                </div>

                {/* Enquiries / Registrations */}
                <h6 className="text-primary-600 mb-16 border-bottom pb-8">Website Enquiries / Registrations</h6>
                <div className="table-responsive">
                    <table className="table bordered-table sm-table mb-0">
                        <thead>
                            <tr>
                                <th scope="col">S.No</th>
                                <th scope="col">Name</th>
                                <th scope="col">Email</th>
                                <th scope="col">Phone</th>
                                <th scope="col">Company</th>
                                <th scope="col">Category</th>
                                <th scope="col">Address</th>
                                <th scope="col">Invited By</th>
                                <th scope="col">Interest</th>
                                <th scope="col">Experience</th>
                                <th scope="col">Registered At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {event.enquiries && event.enquiries.length > 0 ? (
                                event.enquiries.map((enq, index) => (
                                    <tr key={enq.id || enq._id}>
                                        <td>{index + 1}</td>
                                        <td>{enq.name}</td>
                                        <td>{enq.email}</td>
                                        <td>{enq.phone}</td>
                                        <td>{enq.companyName || "-"}</td>
                                        <td>{enq.category || "-"}</td>
                                        <td>{enq.address || "-"}</td>
                                        <td>{enq.invitedBy || "-"}</td>
                                        <td>{enq.interestToBecomeMember || "-"}</td>
                                        <td>{enq.experienceInMeeting || "-"}</td>
                                        <td>{formatDate(enq.createdAt)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="11" className="text-center py-24">
                                        No enquiries yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default WebsiteEventDetailsLayer;
