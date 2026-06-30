export const normalizePhoneNumber = (phoneNumber: string): string => {
  const phone = phoneNumber.trim().replace(/\s+/g, "");

  // Already in international format
  if (phone.startsWith("+20")) {
    return phone;
  }

  // Starts with 20 but missing '+'
  if (phone.startsWith("20")) {
    return `+${phone}`;
  }

  // Local Egyptian format
  if (phone.startsWith("0")) {
    return `+20${phone.slice(1)}`;
  }

  return phone;
};