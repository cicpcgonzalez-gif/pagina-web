export const formatTicketNumber = (value) => String(value ?? '').padStart(5, '0');
