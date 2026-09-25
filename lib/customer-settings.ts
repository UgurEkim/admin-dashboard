import { request } from "../data/repositories/api";
export const phoneCountryCodes = ["+31", "+32", "+49"] as const;
export type PhoneCountryCode = (typeof phoneCountryCodes)[number];

export async function setDefaultPhoneCountryCode(
  defaultPhoneCountryCode: PhoneCountryCode,
) {
  return request({
    action: "save",
    collection: "settings",
    data: { defaultPhoneCountryCode },
  });
}
