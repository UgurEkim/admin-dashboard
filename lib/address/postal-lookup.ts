export interface PostalAddress {
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  country: string;
}
export async function lookupDutchAddress(
  postalCode: string,
  houseNumber: string,
  signal?: AbortSignal,
): Promise<PostalAddress | null> {
  const postcode = postalCode.replace(/\s/g, "").toUpperCase();
  const number = houseNumber.trim();
  if (!/^\d{4}[A-Z]{2}$/.test(postcode) || !/^\d+[A-Za-z]?$/.test(number))
    throw new Error("Enter a valid Dutch postcode and house number.");
  const response = await fetch(
    `https://api.pdok.nl/bzk/locatieserver/search/v3_1/free?q=${encodeURIComponent(`postcode:${postcode} AND huisnummer:${number}`)}&rows=1`,
    { signal },
  );
  if (!response.ok)
    throw new Error(
      "The address service is unavailable. You can enter the address manually.",
    );
  const body = (await response.json()) as {
    response?: { docs?: Array<Record<string, unknown>> };
  };
  const result = body.response?.docs?.[0];
  if (!result) return null;
  const street = String(
    result.straatnaam ?? result.straatnaam_verkort ?? "",
  ).trim();
  const city = String(result.woonplaatsnaam ?? result.woonplaats ?? "").trim();
  if (!street || !city) return null;
  return {
    street,
    houseNumber: String(result.huisnummer ?? number),
    postalCode: String(result.postcode ?? postcode),
    city,
    country: "Netherlands",
  };
}
