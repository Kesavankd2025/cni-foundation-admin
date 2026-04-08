import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { formatErrorMessage } from "./TextHelper";

class ShowNotifications {
  static showAlertNotification(message, isSuccess = true) {
    const formattedMessage = formatErrorMessage(message);
    const options = {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      style: {
        background: "#ffffff",
        color: isSuccess ? "#003366" : "#003366",
        fontWeight: "500",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 51, 102, 0.3)",
      },
      progressStyle: {
        background: "rgba(255, 255, 255, 1)",
      },
    };

    if (isSuccess) {
      toast.success(formattedMessage, options);
    } else {
      toast.error(formattedMessage, options);
    }
  }

  static showNotification(message, type = "info") {
    const formattedMessage = formatErrorMessage(message);
    const baseStyle = {
      background: "#ffffff",
      color: "#003366",
      fontWeight: "500",
      borderRadius: "8px",
      boxShadow: "0 4px 12px rgba(0, 51, 102, 0.3)",
    };

    const options = {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      style: baseStyle,
      progressStyle: {
        background: "rgba(255, 255, 255, 0.7)",
      },
    };

    switch (type) {
      case "success":
        toast.success(formattedMessage, options);
        break;
      case "error":
        options.style.background = "#dc3545";
        toast.error(formattedMessage, options);
        break;
      case "warning":
        options.style.background = "#ffc107";
        options.style.color = "#000000";
        toast.warning(formattedMessage, options);
        break;
      case "info":
        options.style.background = "#0dcaf0";
        toast.info(formattedMessage, options);
        break;
      default:
        toast(formattedMessage, options);
    }
  }
}

export default ShowNotifications;
