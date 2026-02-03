/**
 * Format amount as Indian Rupees (₹)
 * @param {number} amount - The amount to format
 * @param {object} options - Formatting options
 * @param {boolean} options.showSymbol - Include ₹ symbol (default: true)
 * @param {number} options.decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted currency string
 * @example
 * formatCurrency(100000) // "₹1,00,000.00"
 * formatCurrency(100000, { decimals: 0 }) // "₹1,00,000"
 * formatCurrency(100000, { showSymbol: false }) // "1,00,000.00"
 */
export const formatCurrency = (amount, options = {}) => {
    const {
        showSymbol = true,
        decimals = 2,
    } = options;

    // Handle null, undefined, or non-numeric values
    if (amount === null || amount === undefined || isNaN(amount)) {
        return showSymbol ? "₹0.00" : "0.00";
    }

    // Convert to number if string
    const num = typeof amount === "string" ? parseFloat(amount) : amount;

    // Format with Indian numbering system
    const parts = num.toFixed(decimals).split(".");
    const integerPart = parts[0];
    const decimalPart = parts[1];

    // Add commas in Indian format (e.g., 10,00,000 instead of 1,000,000)
    const formattedInteger = integerPart.replace(/\B(?=(\d{2})+(?!\d))/g, ",");

    const result = decimalPart
        ? `${formattedInteger}.${decimalPart}`
        : formattedInteger;

    return showSymbol ? `₹${result}` : result;
};

/**
 * Format amount without decimal places
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 * @example
 * formatCurrencyWhole(100000) // "₹1,00,000"
 */
export const formatCurrencyWhole = (amount) => {
    return formatCurrency(amount, { decimals: 0 });
};
