import { Icon } from '@iconify/react/dist/iconify.js';
import React from 'react';
import StandardDatePicker from '../StandardDatePicker';

const DefaultInputs = ({ title }) => {
    return (
        <div className="col-lg-8">
            <div className="card">
                <div className="card-header">
                    <h6 className="card-title mb-0">{title || "Default Inputs"}</h6>
                </div>
                <div className="card-body">
                    <div className="row gy-3">
                        <div className="col-12">
                            <label className="form-label">Basics Input</label>
                            <input type="text" name="#0" className="form-control" />
                        </div>
                        <div className="col-12">
                            <label className="form-label">Input with Placeholder</label>
                            <input
                                type="text"
                                name="#0"
                                className="form-control"
                                placeholder="info@gmail.com"
                            />
                        </div>
                        <div className="col-12">
                            <label className="form-label">Input with Phone </label>
                            <input
                                type="text"
                                className="form-control flex-grow-1"
                                placeholder="+1 (555) 253-08515"
                            />
                        </div>
                        <div className="col-12">
                            <label className="form-label">Input Date</label>
                            <StandardDatePicker
                                name="exampleDate"
                                value=""
                                onChange={() => { }}
                            />
                        </div>
                        <div className="col-12">
                            <label className="form-label">Input with Payment</label>
                            <div className="input-group">
                                <span className="input-group-text bg-base">
                                    <img src="assets/images/card/payment-icon.png" alt="image_icon" />
                                </span>
                                <input
                                    type="text"
                                    className="form-control flex-grow-1"
                                    placeholder="Card Number"
                                />
                            </div>
                        </div>
                        <div className="col-12 text-end">
                            <button type="submit" className="btn btn-primary-600">Submit</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DefaultInputs;