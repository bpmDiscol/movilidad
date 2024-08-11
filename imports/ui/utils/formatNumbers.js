export default function formatNumber(number, options = {}) {
    const {
      locales = 'es-ES', // Define la localización, como 'en-US', 'es-ES', etc.
      style = 'decimal', // Puede ser 'decimal', 'currency', 'percent'
      currency = 'COP',  // Define la moneda si el estilo es 'currency'
      minimumFractionDigits = 0, // Número mínimo de decimales
      maximumFractionDigits = 2  // Número máximo de decimales
    } = options;
  
    return new Intl.NumberFormat(locales, {
      style: style,
      currency: currency,
      minimumFractionDigits: minimumFractionDigits,
      maximumFractionDigits: maximumFractionDigits
    }).format(number);
  }