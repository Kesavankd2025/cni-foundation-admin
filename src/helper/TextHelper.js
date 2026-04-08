export const formatLabel = (str) => {
    if (!str) return "";
    const acronyms = ["cni"];
    return str
        .split(" ")
        .map((word) => {
            if (acronyms.includes(word.toLowerCase())) return word.toUpperCase();
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(" ");
};

export const formatErrorMessage = (str) => {
    if (!str) return "";

    const smallWords = ["is", "of", "and", "the", "to", "in", "on", "at", "as", "for", "with", "by", "from", "about", "into", "a", "an"];
    const acronyms = ["cni"];

    return str
        .toLowerCase()
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .split(" ")
        .map((word, index) => {
            if (acronyms.includes(word.toLowerCase())) {
                return word.toUpperCase();
            }
            return index !== 0 && smallWords.includes(word)
                ? word
                : word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(" ");
};

export const toCamelCase = (str, pascal = false) => {
    if (!str) return "";
    const formatted = str
        .toLowerCase()
        .replace(/[_-]+(.)/g, (m, chr) => chr.toUpperCase())
        .trim();
    if (pascal) {
        return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    }
    return formatted;
};
export const toPascalCase = (str) => toCamelCase(str, true);
export const formatIndianCurrency = (amount) => {
    if (amount === undefined || amount === null || amount === "") return "₹0";
    const numericAmount = Number(amount);
    if (isNaN(numericAmount)) return "₹" + amount;

    return "₹" + numericAmount.toLocaleString("en-IN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
};


