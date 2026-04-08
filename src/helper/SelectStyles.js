export const selectStyles = (error = false) => ({
    control: (base, state) => ({
        ...base,
        borderRadius: "8px",
        minHeight: "44px",
        borderColor: state.isFocused ? "#003366" : error ? "#dc3545" : "#d1d5db",
        boxShadow: state.isFocused ? "0 0 0 1px #003366" : "none",
        backgroundColor: state.isDisabled ? "#e9ecef" : "white",
        cursor: state.isDisabled ? "not-allowed" : "default",
        "&:hover": {
            borderColor: state.isFocused ? "#003366" : error ? "#dc3545" : "#d1d5db",
        },
    }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected ? "#003366" : state.isFocused ? "#f8d7da" : "white",
        color: state.isSelected ? "white" : "black",
        padding: "10px 15px",
        "&:active": {
            backgroundColor: "#003366",
            color: "white",
        },
    }),
    menu: (base) => ({
        ...base,
        borderRadius: "8px",
        zIndex: 999,
        overflow: "hidden",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    }),
    singleValue: (base) => ({
        ...base,
        color: "#495057",
    }),
    placeholder: (base) => ({
        ...base,
        color: "#6c757d",
    }),
    valueContainer: (base) => ({
        ...base,
        padding: "2px 12px",
    }),
});
