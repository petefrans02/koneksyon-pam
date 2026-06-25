"use client";

import { useState, useEffect } from "react";

const countryFlags: Record<string, string> = {
  US: "🇺🇸", HT: "🇭🇹", FR: "🇫🇷", CA: "🇨🇦", GB: "🇬🇧", BR: "🇧🇷",
  DO: "🇩🇴", MX: "🇲🇽", CL: "🇨🇱", BE: "🇧🇪", CH: "🇨🇭", CM: "🇨🇲",
  DE: "🇩🇪", ES: "🇪🇸", IT: "🇮🇹", NL: "🇳🇱", PT: "🇵🇹", JP: "🇯🇵",
  KR: "🇰🇷", AU: "🇦🇺", NG: "🇳🇬", GH: "🇬🇭", SN: "🇸🇳", CI: "🇨🇮",
  CD: "🇨🇩", CG: "🇨🇬", TT: "🇹🇹", JM: "🇯🇲", BS: "🇧🇸", BB: "🇧🇧",
  GY: "🇬🇾", SR: "🇸🇷", PA: "🇵🇦", CO: "🇨🇴", VE: "🇻🇪", PE: "🇵🇪",
  AR: "🇦🇷", GP: "🇬🇵", MQ: "🇲🇶", GF: "🇬🇫", RE: "🇷🇪",
};

export function useCountry() {
  const [country, setCountry] = useState({ code: "", flag: "🌍", name: "" });

  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((r) => r.json())
      .then((data) => {
        const code = data.country_code || "";
        setCountry({
          code,
          flag: countryFlags[code] || "🌍",
          name: data.country_name || "",
        });
      })
      .catch(() => {});
  }, []);

  return country;
}
