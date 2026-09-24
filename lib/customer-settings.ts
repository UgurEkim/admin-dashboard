export const phoneCountryCodes = ["+31", "+32", "+49"] as const;
export type PhoneCountryCode = (typeof phoneCountryCodes)[number];

const defaultPhoneCountryCodeKey =
  "repair-admin.settings.default-phone-country-code";

export function getDefaultPhoneCountryCode(): PhoneCountryCode {
  if (typeof window === "undefined") return "+31";
  const value = window.localStorage.getItem(defaultPhoneCountryCodeKey);
  return phoneCountryCodes.includes(value as PhoneCountryCode)
    ? (value as PhoneCountryCode)
    : "+31";
}

export function setDefaultPhoneCountryCode(value: PhoneCountryCode) {
  window.localStorage.setItem(defaultPhoneCountryCodeKey, value);
}
