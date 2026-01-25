// Location matching utilities for dealbreaker filtering

export type WorkMode = "onsite" | "hybrid" | "remote";
export type GeographicRestriction = "none" | "us_canada" | "north_america" | "emea";

export interface LocationMatchResult {
  isMatch: boolean;
  reason?: string;
  hasTimezoneSynergy?: boolean;
}

// Simplified city-to-country mapping for common hubs
const CITY_COUNTRY_MAP: Record<string, string> = {
  // USA
  "new york": "USA",
  "los angeles": "USA",
  "san francisco": "USA",
  "chicago": "USA",
  "austin": "USA",
  "seattle": "USA",
  "boston": "USA",
  "miami": "USA",
  "denver": "USA",
  "atlanta": "USA",
  // Canada
  "toronto": "Canada",
  "vancouver": "Canada",
  "montreal": "Canada",
  "calgary": "Canada",
  "ottawa": "Canada",
  // Mexico
  "mexico city": "Mexico",
  "guadalajara": "Mexico",
  // UK
  "london": "UK",
  "manchester": "UK",
  "edinburgh": "UK",
  // Europe
  "berlin": "Germany",
  "munich": "Germany",
  "paris": "France",
  "amsterdam": "Netherlands",
  "dublin": "Ireland",
  "barcelona": "Spain",
  "madrid": "Spain",
  "stockholm": "Sweden",
  "copenhagen": "Denmark",
  "oslo": "Norway",
  "zurich": "Switzerland",
  "vienna": "Austria",
  "milan": "Italy",
  "rome": "Italy",
  "warsaw": "Poland",
  "prague": "Czech Republic",
  "lisbon": "Portugal",
  // Middle East
  "dubai": "UAE",
  "tel aviv": "Israel",
  "riyadh": "Saudi Arabia",
  // Africa
  "johannesburg": "South Africa",
  "cape town": "South Africa",
  "nairobi": "Kenya",
  "lagos": "Nigeria",
  "cairo": "Egypt",
  // Asia Pacific
  "singapore": "Singapore",
  "hong kong": "Hong Kong",
  "tokyo": "Japan",
  "sydney": "Australia",
  "melbourne": "Australia",
  "bangalore": "India",
  "mumbai": "India",
  // South America
  "sao paulo": "Brazil",
  "buenos aires": "Argentina",
  "bogota": "Colombia",
};

// Country to region mapping
const COUNTRY_REGIONS: Record<string, string[]> = {
  // US & Canada
  us_canada: ["USA", "Canada"],
  // North America (US, Canada, Mexico)
  north_america: ["USA", "Canada", "Mexico"],
  // EMEA (Europe, Middle East, Africa)
  emea: [
    "UK", "Germany", "France", "Netherlands", "Ireland", "Spain", "Sweden",
    "Denmark", "Norway", "Switzerland", "Austria", "Italy", "Poland",
    "Czech Republic", "Portugal", "Belgium", "Finland", "Greece", "Hungary",
    "Romania", "Bulgaria", "Croatia", "Slovakia", "Slovenia", "Latvia",
    "Lithuania", "Estonia", "Luxembourg", "Malta", "Cyprus",
    "UAE", "Israel", "Saudi Arabia", "Qatar", "Kuwait", "Bahrain", "Oman",
    "Jordan", "Lebanon", "Egypt", "Turkey",
    "South Africa", "Kenya", "Nigeria", "Morocco", "Tunisia", "Ghana",
    "Ethiopia", "Tanzania", "Rwanda", "Uganda",
  ],
};

// Approximate UTC offsets for timezone synergy calculation
const CITY_TIMEZONE_OFFSETS: Record<string, number> = {
  // US & Canada (Western to Eastern)
  "los angeles": -8,
  "san francisco": -8,
  "seattle": -8,
  "vancouver": -8,
  "denver": -7,
  "calgary": -7,
  "chicago": -6,
  "austin": -6,
  "new york": -5,
  "boston": -5,
  "miami": -5,
  "toronto": -5,
  "montreal": -5,
  "ottawa": -5,
  "atlanta": -5,
  // Mexico
  "mexico city": -6,
  "guadalajara": -6,
  // UK & Ireland
  "london": 0,
  "manchester": 0,
  "edinburgh": 0,
  "dublin": 0,
  // Western Europe
  "paris": 1,
  "amsterdam": 1,
  "berlin": 1,
  "munich": 1,
  "zurich": 1,
  "vienna": 1,
  "madrid": 1,
  "barcelona": 1,
  "rome": 1,
  "milan": 1,
  "stockholm": 1,
  "copenhagen": 1,
  "oslo": 1,
  "warsaw": 1,
  "prague": 1,
  "lisbon": 0,
  // Eastern Europe & Middle East
  "dubai": 4,
  "tel aviv": 2,
  "riyadh": 3,
  "cairo": 2,
  // Africa
  "johannesburg": 2,
  "cape town": 2,
  "nairobi": 3,
  "lagos": 1,
  // Asia Pacific
  "singapore": 8,
  "hong kong": 8,
  "tokyo": 9,
  "sydney": 10,
  "melbourne": 10,
  "bangalore": 5.5,
  "mumbai": 5.5,
  // South America
  "sao paulo": -3,
  "buenos aires": -3,
  "bogota": -5,
};

/**
 * Normalize city name for comparison
 */
function normalizeCity(city: string | null | undefined): string {
  if (!city) return "";
  return city.toLowerCase().trim().replace(/,.*$/, "").trim();
}

/**
 * Get country from city name
 */
function getCountryFromCity(city: string | null | undefined): string | null {
  const normalized = normalizeCity(city);
  return CITY_COUNTRY_MAP[normalized] || null;
}

/**
 * Check if a location is within a geographic restriction
 */
export function isWithinGeographicRestriction(
  candidateCity: string | null | undefined,
  restriction: GeographicRestriction
): boolean {
  if (restriction === "none") return true;
  
  const country = getCountryFromCity(candidateCity);
  if (!country) {
    // If we can't determine country, be permissive for remote
    console.log(`[LocationMatch] Unknown city: ${candidateCity}, allowing for remote`);
    return true;
  }
  
  const allowedCountries = COUNTRY_REGIONS[restriction] || [];
  return allowedCountries.includes(country);
}

/**
 * Get timezone offset for a city
 */
export function getTimezoneOffset(city: string | null | undefined): number | null {
  const normalized = normalizeCity(city);
  return CITY_TIMEZONE_OFFSETS[normalized] ?? null;
}

/**
 * Check if two cities are within timezone range (default ±3 hours)
 */
export function isWithinTimezoneRange(
  city1: string | null | undefined,
  city2: string | null | undefined,
  hoursRange: number = 3
): boolean {
  const offset1 = getTimezoneOffset(city1);
  const offset2 = getTimezoneOffset(city2);
  
  if (offset1 === null || offset2 === null) return false;
  
  const diff = Math.abs(offset1 - offset2);
  return diff <= hoursRange;
}

/**
 * Check if cities match (case insensitive, handles "Toronto, ON" vs "Toronto")
 */
export function citiesMatch(city1: string | null | undefined, city2: string | null | undefined): boolean {
  const normalized1 = normalizeCity(city1);
  const normalized2 = normalizeCity(city2);
  
  if (!normalized1 || !normalized2) return false;
  
  return normalized1 === normalized2;
}

/**
 * Main location matching function - determines if a candidate matches job location requirements
 */
export function isLocationMatch(
  candidateProfile: {
    work_mode?: string | null;
    city_hub?: string | null;
    geographic_restriction?: string | null;
  },
  jobData: {
    work_mode?: string | null;
    location_text?: string | null;
    geographic_restriction?: string | null;
  }
): LocationMatchResult {
  const jobWorkMode = (jobData.work_mode || "remote") as WorkMode;
  const jobCityHub = jobData.location_text;
  const jobGeoRestriction = (jobData.geographic_restriction || "none") as GeographicRestriction;
  
  const candidateWorkMode = (candidateProfile.work_mode || "remote") as WorkMode;
  const candidateCityHub = candidateProfile.city_hub;
  
  // DEALBREAKER 1: On-site/Hybrid jobs require matching city
  if (jobWorkMode === "onsite" || jobWorkMode === "hybrid") {
    // If candidate only wants remote, exclude
    if (candidateWorkMode === "remote" && candidateProfile.geographic_restriction === "none") {
      // Candidate is fully remote, might still be open to hybrid in their city
    }
    
    // Check if cities match
    if (!citiesMatch(candidateCityHub, jobCityHub)) {
      return {
        isMatch: false,
        reason: `Location mismatch: Job requires ${jobWorkMode} in ${jobCityHub || "unspecified location"}, candidate is in ${candidateCityHub || "unspecified location"}`,
      };
    }
  }
  
  // DEALBREAKER 2: Remote jobs with geographic restrictions
  if (jobWorkMode === "remote" && jobGeoRestriction !== "none") {
    if (!isWithinGeographicRestriction(candidateCityHub, jobGeoRestriction)) {
      const restrictionLabels: Record<GeographicRestriction, string> = {
        none: "Global",
        us_canada: "US & Canada",
        north_america: "North America",
        emea: "EMEA",
      };
      return {
        isMatch: false,
        reason: `Geographic restriction: Job is limited to ${restrictionLabels[jobGeoRestriction]}, candidate is in ${candidateCityHub || "unknown location"}`,
      };
    }
  }
  
  // Check for timezone synergy (remote jobs with city hub)
  let hasTimezoneSynergy = false;
  if (jobWorkMode === "remote" && jobCityHub && candidateCityHub) {
    hasTimezoneSynergy = isWithinTimezoneRange(candidateCityHub, jobCityHub, 3);
  }
  
  return {
    isMatch: true,
    hasTimezoneSynergy,
  };
}

/**
 * Reverse matching - check if a job matches candidate's location preferences
 * Used for candidate swipe view
 */
export function isJobLocationMatch(
  candidateProfile: {
    work_mode?: string | null;
    city_hub?: string | null;
  },
  jobData: {
    work_mode?: string | null;
    location_text?: string | null;
    geographic_restriction?: string | null;
  }
): LocationMatchResult {
  const candidateWorkMode = (candidateProfile.work_mode || "remote") as WorkMode;
  const candidateCityHub = candidateProfile.city_hub;
  
  const jobWorkMode = (jobData.work_mode || "remote") as WorkMode;
  const jobCityHub = jobData.location_text;
  
  // If candidate prefers on-site/hybrid, they need jobs in their city
  if (candidateWorkMode === "onsite" || candidateWorkMode === "hybrid") {
    if (jobWorkMode === "remote") {
      // Remote job is fine for anyone
    } else if (!citiesMatch(candidateCityHub, jobCityHub)) {
      return {
        isMatch: false,
        reason: `Location mismatch: Candidate prefers ${candidateWorkMode} in ${candidateCityHub}, job is in ${jobCityHub}`,
      };
    }
  }
  
  // Check timezone synergy
  let hasTimezoneSynergy = false;
  if (jobCityHub && candidateCityHub) {
    hasTimezoneSynergy = isWithinTimezoneRange(candidateCityHub, jobCityHub, 3);
  }
  
  return {
    isMatch: true,
    hasTimezoneSynergy,
  };
}
