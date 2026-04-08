import React, { forwardRef, useState, useRef, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, parse, isValid } from "date-fns";
import { Icon } from "@iconify/react";

/**
 * Custom Date & Time Picker
 * - Replaced flatpickr with react-datepicker for better React lifecycle support.
 * - 12-hour AM/PM format for time selection.
 * - Premium UI matching the app's red/dark theme.
 */
const CustomInput = forwardRef(({ value, onClick, placeholder, className, name, onClear, enableTime, disabled }, ref) => (
    <div className="position-relative w-100" style={{ cursor: disabled ? "not-allowed" : "default" }}>
        <input
            ref={ref}
            className={className}
            onClick={disabled ? undefined : onClick}
            value={value}
            placeholder={placeholder}
            readOnly
            name={name}
            disabled={disabled}
            style={{
                cursor: disabled ? "not-allowed" : "pointer",
                backgroundColor: disabled ? "#e9ecef" : "#fff",
                paddingRight: value ? "44px" : "32px"
            }}
        />
        <div
            className="position-absolute end-0 top-50 translate-middle-y d-flex align-items-center gap-1 me-12"
            style={{ zIndex: 5, pointerEvents: disabled ? "none" : "auto" }}
        >
            {value && !disabled && (
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        onClear();
                    }}
                    className="clear-date-btn text-secondary-light"
                    title="Clear Date"
                >
                    <Icon icon="solar:close-circle-bold" style={{ fontSize: '18px' }} />
                </div>
            )}
            <div className="text-secondary-light" style={{ pointerEvents: "none", display: "flex" }}>
                <Icon
                    icon={enableTime ? "solar:calendar-date-bold" : "solar:calendar-bold"}
                    style={{ fontSize: '18px' }}
                />
            </div>
        </div>
    </div>
));

const StandardDatePicker = ({
    value,
    onChange,
    placeholder = "DD/MM/YYYY",
    className = "form-control radius-8",
    name,
    enableTime = false,
    noCalendar = false,
    minDate,
    maxDate,
    minTime, // Explicit minTime
    maxTime,  // Explicit maxTime
    disabled = false
}) => {
    const [isYearOpen, setIsYearOpen] = useState(false);
    const dropdownRef = useRef(null);
    const activeYearRef = useRef(null);

    // Scroll to active year when dropdown opens
    useEffect(() => {
        if (isYearOpen && activeYearRef.current) {
            activeYearRef.current.scrollIntoView({ block: 'center', behavior: 'auto' });
        }
    }, [isYearOpen]);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsYearOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Helper to parse the value string into a Date object
    const getParsedDate = (val) => {
        if (!val) return null;
        if (val instanceof Date) return val;

        // Try direct construction (handles ISO strings and many standard formats)
        let parsed = new Date(val);
        if (isValid(parsed)) return parsed;

        // Fallback to manual parsing for specific formats if direct fails
        const formats = [
            "yyyy-MM-dd HH:mm",
            "yyyy-MM-dd",
            "dd/MM/yyyy HH:mm",
            "dd/MM/yyyy",
            "yyyy-MM-dd h:mm aa",
            "dd/MM/yyyy h:mm aa",
            "yyyy-MM-dd'T'HH:mm:ss.SSSX",
            "yyyy-MM-dd'T'HH:mm"
        ];
        for (let f of formats) {
            try {
                parsed = parse(val, f, new Date());
                if (isValid(parsed)) return parsed;
            } catch (e) { }
        }
        return null;
    };

    const selectedDate = getParsedDate(value);

    const handleDateChange = (date) => {
        if (onChange) {
            let formattedValue = "";
            if (date instanceof Date && isValid(date)) {
                let finalDate = new Date(date);

                // Force constraints on the selected moment
                if (minD && finalDate < minD) {
                    finalDate = new Date(minD);
                }
                if (maxD && finalDate > maxD) {
                    finalDate = new Date(maxD);
                }

                formattedValue = finalDate.toISOString();
            }

            onChange({
                target: {
                    name: name,
                    value: formattedValue
                }
            });
        }
    };

    // Auto-correct if value becomes invalid due to minD/maxD changes (e.g. time passing)
    useEffect(() => {
        if (selectedDate && isValid(selectedDate)) {
            let needsCorrection = false;
            let correctedDate = new Date(selectedDate);

            if (minD && selectedDate < minD) {
                // Determine if it's a previous day
                const isPreviousDay = new Date(selectedDate).setHours(0, 0, 0, 0) < new Date(minD).setHours(0, 0, 0, 0);
                if (isPreviousDay) {
                    correctedDate = new Date(minD);
                    needsCorrection = true;
                }
                // If it's same day but earlier time, we let it be to avoid bumping existing values to "now"
                // The picker's minTime will still prevent picking new invalid times.
            } else if (maxD && selectedDate > maxD) {
                // For max bounds, we remain strict (e.g. apply date must be before training date)
                correctedDate = new Date(maxD);
                needsCorrection = true;
            }

            if (needsCorrection) {
                handleDateChange(correctedDate);
            }
        }
    }, [minDate, maxDate]); // Re-run when boundaries change

    // Simplified Now/Today logic
    const [now, setNow] = useState(new Date());

    // Update 'now' periodically (every minute) to keep boundaries fresh
    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(interval);
    }, []);

    const minD = minDate === "today" ? now : (typeof minDate === "string" ? getParsedDate(minDate) : minDate);
    const maxD = maxDate === "today" ? now : (typeof maxDate === "string" ? getParsedDate(maxDate) : maxDate);

    const years = Array.from({ length: 121 }, (_, i) => (new Date().getFullYear() - 100) + i).reverse();
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];


    return (
        <>
            <style>{`
                .react-datepicker {
                    background-color: #FFFFFF !important;
                    border: 1px solid #E2E8F0 !important;
                    border-radius: 12px !important;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.12) !important;
                    font-family: 'Inter', sans-serif !important;
                }

                .react-datepicker__header {
                    background-color: #fff !important;
                    border-bottom: 1px solid #f1f5f9 !important;
                    padding: 0 !important;
                    border-radius: 12px 12px 0 0 !important;
                }

                .custom-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 16px;
                }

                .header-center {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .month-text {
                    font-size: 18px;
                    font-weight: 800;
                    color: #0f172a;
                }

                .year-dropdown-container {
                    position: relative;
                }

                .year-display {
                    background: #f1f5f9;
                    color: #64748b;
                    padding: 4px 8px;
                    border-radius: 6px;
                    font-size: 17px;
                    font-weight: 500;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    transition: all 0.2s;
                }

                .year-display:hover {
                    background: #e2e8f0;
                    color: #334155;
                }

                .custom-year-list {
                    position: absolute;
                    top: 100%;
                    left: 50%;
                    transform: translateX(-50%);
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                    width: 90px;
                    max-height: 220px;
                    overflow-y: auto;
                    z-index: 9999;
                    margin-top: 5px;
                }

                .custom-year-item {
                    padding: 8px;
                    text-align: center;
                    cursor: pointer;
                    font-size: 14px;
                    color: #475569;
                    transition: background 0.2s;
                }

                .custom-year-item:hover {
                    background: #FEF2F2;
                    color: #003366;
                }

                .custom-year-item.active {
                    background: #003366;
                    color: white;
                }

                .custom-year-list::-webkit-scrollbar {
                    width: 5px;
                }
                .custom-year-list::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 10px;
                }

                .nav-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #94a3b8;
                    padding: 4px;
                    border-radius: 50%;
                    display: flex;
                    transition: all 0.2s;
                }

                .nav-btn:hover {
                    background: #f1f5f9;
                    color: #003366;
                }

                .react-datepicker__day-names {
                    display: flex;
                    justify-content: space-between;
                    padding: 8px 12px 0;
                }

                .react-datepicker__day-name {
                    font-size: 13px !important;
                    font-weight: 700 !important;
                    color: #475569 !important;
                    width: 36px !important;
                    margin: 0 !important;
                }

                .react-datepicker__month {
                    margin: 8px 12px 12px !important;
                }

                .react-datepicker__day {
                    width: 36px !important;
                    line-height: 36px !important;
                    margin: 0 !important;
                    font-size: 14px !important;
                    border-radius: 8px !important;
                    color: #334155 !important;
                }

                .react-datepicker__day.react-datepicker__day--selected,
                .react-datepicker__day.react-datepicker__day--keyboard-selected,
                .react-datepicker__day.react-datepicker__day--selected:hover,
                .react-datepicker__day.react-datepicker__day--keyboard-selected:hover {
                    background-color: #003366 !important;
                    color: #FFFFFF !important;
                    font-weight: 700 !important;
                }

                .react-datepicker__day:hover:not(.react-datepicker__day--selected):not(.react-datepicker__day--keyboard-selected) {
                    background-color: #f1f5f9 !important;
                    color: #003366 !important;
                }

                .react-datepicker__day--today {
                    color: #003366 !important;
                    font-weight: 700 !important;
                    border: none !important;
                }

                .react-datepicker__day--outside-month {
                    color: #cbd5e1 !important;
                }

                .react-datepicker__time-container {
                    border-left: 1px solid #f1f5f9 !important;
                    width: 100px !important;
                }

                .react-datepicker-time__header {
                    padding: 12px 0 !important;
                    font-size: 15px !important;
                    color: #0f172a !important;
                }

                .react-datepicker__time-list-item--selected {
                    background-color: #003366 !important;
                color: #ffffff !important;
                }

                .react-datepicker__day--selected,
                .react-datepicker__day--keyboard-selected {
                    background-color: #003366 !important;
                    color: #ffffff !important;
                }

                .clear-date-btn {
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 4px;
                    border-radius: 50%;
                }

                .clear-date-btn:hover {
                    background-color: #e3e2feff;
                    color: #003366 !important;
                }
                    
                .react-datepicker__day--disabled, 
                .react-datepicker__month-text--disabled,
                .react-datepicker__quarter-text--disabled, 
                .react-datepicker__year-text--disabled {
                    color: #cbd5e1 !important;
                    background-color: transparent !important;
                    opacity: 0.3 !important;
                    cursor: not-allowed !important;
                    text-decoration: none !important;
                }

                .react-datepicker__day:not(.react-datepicker__day--disabled) {
                    color: #0f172a;
                    font-weight: 600 !important;
                }

                .react-datepicker__time-list-item--disabled {
                    color: #cbd5e1 !important;
                    opacity: 0.3 !important;
                    cursor: not-allowed !important;
                }

                .react-datepicker__day--outside-month {
                    color: #94a3b8 !important;
                    opacity: 0.6;
                }
            `}</style>
            <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                showTimeSelect={enableTime}
                timeFormat="h:mm aa"
                timeIntervals={1}
                timeCaption="Time"
                dateFormat={enableTime ? "dd/MM/yyyy h:mm aa" : "dd/MM/yyyy"}
                minDate={minD}
                maxDate={maxD}
                minTime={
                    (() => {
                        if (minTime) return minTime;
                        // Determine which day to check constraints against
                        const refDate = selectedDate || now;
                        if (!minD || !refDate) {
                            return new Date(new Date().setHours(0, 0, 0, 0));
                        }

                        const isSameDay = minD.getDate() === refDate.getDate() &&
                            minD.getMonth() === refDate.getMonth() &&
                            minD.getFullYear() === refDate.getFullYear();

                        if (!isSameDay) {
                            return new Date(new Date().setHours(0, 0, 0, 0));
                        }

                        // Use boundary hours/mins precisely
                        const t = new Date(refDate);
                        t.setHours(minD.getHours(), minD.getMinutes(), 0, 0);
                        return t;
                    })()
                }
                maxTime={
                    (() => {
                        if (maxTime) return maxTime;
                        const refDate = selectedDate || now;
                        if (!maxD || !refDate) {
                            return new Date(new Date().setHours(23, 59, 59, 999));
                        }

                        const isSameDay = maxD.getDate() === refDate.getDate() &&
                            maxD.getMonth() === refDate.getMonth() &&
                            maxD.getFullYear() === refDate.getFullYear();

                        if (!isSameDay) {
                            return new Date(new Date().setHours(23, 59, 59, 999));
                        }

                        // Use max boundary hours/mins precisely
                        const t = new Date(refDate);
                        t.setHours(maxD.getHours(), maxD.getMinutes(), 59, 999);
                        return t;
                    })()
                }
                placeholderText={placeholder}
                customInput={<CustomInput className={className} name={name} enableTime={enableTime} onClear={() => handleDateChange(null)} disabled={disabled} />}
                disabled={disabled}
                renderCustomHeader={({
                    date,
                    changeYear,
                    decreaseMonth,
                    increaseMonth,
                    prevMonthButtonDisabled,
                    nextMonthButtonDisabled,
                }) => (
                    <div className="custom-header">
                        <button
                            type="button"
                            className="nav-btn"
                            onClick={decreaseMonth}
                            disabled={prevMonthButtonDisabled}
                        >
                            <Icon icon="lucide:chevron-left" style={{ fontSize: '24px' }} />
                        </button>
                        <div className="header-center">
                            <span className="month-text">{months[date.getMonth()]}</span>
                            <div className="year-dropdown-container" ref={dropdownRef}>
                                <div
                                    className="year-display"
                                    onClick={() => setIsYearOpen(!isYearOpen)}
                                >
                                    {date.getFullYear()}
                                    <Icon icon="lucide:chevron-down" style={{ fontSize: '16px' }} />
                                </div>
                                {isYearOpen && (
                                    <div className="custom-year-list">
                                        {years.map((year) => (
                                            <div
                                                key={year}
                                                ref={date.getFullYear() === year ? activeYearRef : null}
                                                className={`custom-year-item ${date.getFullYear() === year ? 'active' : ''}`}
                                                onClick={() => {
                                                    changeYear(year);
                                                    setIsYearOpen(false);
                                                }}
                                            >
                                                {year}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <button
                            type="button"
                            className="nav-btn"
                            onClick={increaseMonth}
                            disabled={nextMonthButtonDisabled}
                        >
                            <Icon icon="lucide:chevron-right" style={{ fontSize: '24px' }} />
                        </button>
                    </div>
                )}
                isClearable={false}
                wrapperClassName="w-100 d-block"
            />
        </>
    );
};

export default StandardDatePicker;
