import React, { useState } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import './ThankYouSlipLayer.css';

const ThankYouSlipLayer = () => {
    const [activeTab, setActiveTab] = useState('given'); // 'given' or 'received'

    // Mock data for Given
    const givenData = {
        chapters: [
            {
                id: 1,
                name: 'ARAM Chapter',
                amount: '₹1,34,11,533',
                members: [
                    { id: 1, name: 'Logarajan S P', company: 'e-intellisafe & Security', category: 'CCTV & Security', amount: '₹25,00,000', type: 'Inside' },
                    { id: 2, name: 'Mathiarasu M', company: 'TECHMAXX ENGINEERING', category: 'Fire & Safety', amount: '₹18,50,000', type: 'Outside' },
                    { id: 3, name: 'Mano Neelamegam', company: 'WUDFE INC', category: 'Interior Designer', amount: '₹22,00,000', type: 'Inside' }
                ]
            },
            {
                id: 2,
                name: 'Arni Chapter',
                amount: '₹67,29,71,600',
                members: [
                    { id: 4, name: 'Ramesh Kumar', company: 'Auto Solutions', category: 'Automobile', amount: '₹30,00,000', type: 'Outside' },
                    { id: 5, name: 'Priya Lakshmi', company: 'Fashion Trends', category: 'Retail', amount: '₹15,75,000', type: 'Inside' },
                    { id: 8, name: 'Suresh Raina', company: 'Cricket Academy', category: 'Sports', amount: '₹12,00,000', type: 'Outside' }
                ]
            },
            {
                id: 3,
                name: 'Salem Chapter',
                amount: '₹45,20,000',
                members: [
                    { id: 9, name: 'Anbu Selvan', company: 'Textile Hub', category: 'Manufacturing', amount: '₹20,00,000', type: 'Inside' },
                    { id: 10, name: 'Revathi S', company: 'Organic Foods', category: 'FMCG', amount: '₹25,20,000', type: 'Outside' }
                ]
            }
        ]
    };

    // Mock data for Received
    const receivedData = {
        chapters: [
            {
                id: 1,
                name: 'ARAM Chapter',
                amount: '₹95,00,000',
                members: [
                    { id: 6, name: 'Vijay Kumar', company: 'Tech Services', category: 'IT Solutions', amount: '₹45,00,000', type: 'Inside' },
                    { id: 7, name: 'Anitha R', company: 'Consulting Firm', category: 'Business Consulting', amount: '₹50,00,000', type: 'Outside' }
                ]
            },
            {
                id: 4,
                name: 'Coimbatore Chapter',
                amount: '₹55,00,000',
                members: [
                    { id: 11, name: 'Murugan G', company: 'Pump Works', category: 'Industry', amount: '₹30,00,000', type: 'Inside' },
                    { id: 12, name: 'Santhosh M', company: 'Jewels & Co', category: 'Retail', amount: '₹25,00,000', type: 'Outside' }
                ]
            }
        ]
    };

    const currentData = activeTab === 'given' ? givenData : receivedData;

    return (
        <div className="d-flex flex-column gap-4">
            {/* Header section */}
            <div className="d-flex align-items-center justify-content-between mb-24 px-12 flex-wrap gap-3">
                <div className="d-flex align-items-center">
                    <div className="bg-danger-600 radius-2" style={{ width: '4px', height: '32px' }}></div>
                    <div className="ms-12">
                        <h5 className="fw-bold mb-0" style={{ color: '#101828' }}>Thank You Slip Reports</h5>
                        <p className="text-sm text-secondary-light mb-0">Detailed list of business generated across chapters</p>
                    </div>
                </div>

                {/* Tab Selection */}
                <div className="d-flex align-items-center gap-2 p-1 bg-neutral-100 radius-12">
                    <button
                        type="button"
                        className={`btn btn-sm py-10 px-20 radius-8 border-0 d-flex align-items-center gap-2 transition-2 ${activeTab === 'given'
                            ? 'bg-primary-600 text-white shadow-sm'
                            : 'text-secondary-light hover-bg-neutral-200'
                            }`}
                        onClick={() => setActiveTab('given')}
                    >
                        <Icon icon="solar:hand-money-outline" fontSize={18} />
                        Given Slips
                    </button>
                    <button
                        type="button"
                        className={`btn btn-sm py-10 px-20 radius-8 border-0 d-flex align-items-center gap-2 transition-2 ${activeTab === 'received'
                            ? 'bg-primary-600 text-white shadow-sm'
                            : 'text-secondary-light hover-bg-neutral-200'
                            }`}
                        onClick={() => setActiveTab('received')}
                    >
                        <Icon icon="solar:handshake-outline" fontSize={18} />
                        Received Slips
                    </button>
                </div>
            </div>

            {/* Grid of Chapter Slips */}
            <div className="row gy-3 px-12">
                {currentData.chapters.map(chapter => (
                    <div key={chapter.id} className="col-xl-3 col-md-6 col-12">
                        <div className="card h-100 p-0 radius-12 shadow-hover-sm transition-2 overflow-hidden border-0">
                            {/* Chapter Header with Green Gradient */}
                            <div className="p-12 bg-success-600 text-white">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <h6 className="fw-bold mb-0 text-white text-truncate" style={{ maxWidth: '140px' }}>{chapter.name}</h6>
                                    <div className="w-32-px h-32-px rounded-circle bg-white-20 d-flex align-items-center justify-content-center">
                                        <Icon icon="solar:globus-outline" fontSize={18} />
                                    </div>
                                </div>
                                <div className="mt-8">
                                    <span className="text-xxs opacity-75 text-uppercase spacing-1 d-block mb-1">Chapter Value</span>
                                    <h5 className="fw-bolder mb-0 text-white">{chapter.amount}</h5>
                                </div>
                            </div>

                            {/* Members List */}
                            <div className="card-body p-12 bg-base">
                                <h6 className="text-xxs fw-bold text-secondary-light text-uppercase spacing-1 mb-12">Transactions</h6>
                                <div className="d-flex flex-column gap-2">
                                    {chapter.members.map(member => (
                                        <div
                                            key={member.id}
                                            className="p-10 radius-8 border transition-2 hover-bg-neutral-50"
                                            style={{ borderColor: '#f2f2f2' }}
                                        >
                                            <div className="d-flex justify-content-between align-items-start mb-4">
                                                <div className="flex-grow-1 overflow-hidden">
                                                    <h6 className="text-sm fw-bold mb-2 text-dark text-truncate">{member.name}</h6>
                                                    <div className="d-flex align-items-center gap-2 mb-2">
                                                        <span className="badge bg-neutral-100 text-secondary-light py-2 px-6 radius-4 text-xxs">
                                                            {member.category}
                                                        </span>
                                                        <span className={`badge py-2 px-6 radius-4 text-xxs ${member.type === 'Inside' ? 'bg-info-focus text-info-600' : 'bg-warning-focus text-warning-main'}`}>
                                                            {member.type}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-end">
                                                    <span className="text-success-main fw-bold text-md d-block">{member.amount}</span>
                                                </div>
                                            </div>
                                            <div className="d-flex align-items-center gap-2 mt-4 opacity-75 overflow-hidden">
                                                <Icon icon="solar:case-outline" fontSize={12} className="text-success-600 flex-shrink-0" />
                                                <span className="text-xxs fw-medium text-secondary-light text-truncate">{member.company}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Card Footer Action */}
                            <div className="card-footer bg-neutral-50 border-top-0 p-8 text-center">
                                <button type="button" className="btn p-0 text-success-600 fw-bold text-xs hover-text-success-700 d-flex align-items-center gap-2 mx-auto">
                                    View Report
                                    <Icon icon="solar:arrow-right-outline" fontSize={12} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ThankYouSlipLayer;
