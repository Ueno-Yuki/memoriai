type NominatimReverseResponse = {
  display_name: string;
  address: {
    neighbourhood?: string;
    suburb?: string;
    city_district?: string;
    town?: string;
    city?: string;
    village?: string;
    county?: string;
    state?: string;
    country?: string;
  };
};

export type GeocodeResult = {
  label: string;
  latitude: number;
  longitude: number;
  source: "nominatim";
};

function buildLabel(address: NominatimReverseResponse["address"]): string {
  return (
    address.neighbourhood ??
    address.suburb ??
    address.city_district ??
    address.town ??
    address.city ??
    address.village ??
    address.county ??
    address.state ??
    address.country ??
    ""
  );
}

function codeError(message: string, code: string): Error {
  return Object.assign(new Error(message), { code });
}

export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<GeocodeResult> {
  const userAgent = process.env.NOMINATIM_USER_AGENT;
  if (!userAgent) throw new Error("NOMINATIM_USER_AGENT is not set");

  const url =
    `https://nominatim.openstreetmap.org/reverse` +
    `?lat=${latitude}&lon=${longitude}&format=json&accept-language=ja`;

  const res = await fetch(url, {
    headers: { "User-Agent": userAgent },
    // Nominatim usage policy: 1 req/sec max
    // serverless の場合は呼び出し頻度をクライアント側で制御すること
    next: { revalidate: 0 },
  });

  if (res.status === 429) throw codeError("Nominatim rate limit exceeded", "rate_limited");
  if (!res.ok) throw codeError(`Nominatim error: ${res.status}`, "geocode_failed");

  const data: NominatimReverseResponse = await res.json();

  // Nominatim returns HTTP 200 with {"error":"Unable to geocode"} for coordinates with no result
  if (!data.address && !data.display_name) {
    const err = new Error("Nominatim returned no result");
    (err as Error & { code: string }).code = "geocode_failed";
    throw err;
  }

  const label = (data.address ? buildLabel(data.address) : "") || data.display_name;

  return { label, latitude, longitude, source: "nominatim" };
}
