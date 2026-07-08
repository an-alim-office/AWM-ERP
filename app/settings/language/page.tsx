"use client";

import React, { useEffect, useMemo, useState } from "react";

type TextDirection = "ltr" | "rtl";

type LanguageOption = {
  code: string;
  nativeName: string;
  englishName: string;
  direction: TextDirection;
  priority: "top" | "all";
};

const TOP_FIVE_LANGUAGE_CODES = ["bn", "en", "ar", "hi", "ur"] as const;

const RTL_LANGUAGE_CODES = new Set([
  "ar",
  "ur",
  "fa",
  "he",
  "ps",
  "sd",
  "ug",
  "yi",
  "dv",
  "ku",
  "ks",
]);

const TOP_LANGUAGE_OVERRIDES: Record<
  string,
  {
    nativeName: string;
    englishName: string;
  }
> = {
  bn: {
    nativeName: "বাংলা",
    englishName: "Bengali",
  },
  en: {
    nativeName: "English",
    englishName: "English",
  },
  ar: {
    nativeName: "العربية",
    englishName: "Arabic",
  },
  hi: {
    nativeName: "हिन्दी",
    englishName: "Hindi",
  },
  ur: {
    nativeName: "اردو",
    englishName: "Urdu",
  },
};

/**
 * ISO 639-1 language codes.
 * Top five languages are always shown first, then the rest of the world languages.
 */
const ISO_639_1_LANGUAGE_CODES = [
  "aa",
  "ab",
  "ae",
  "af",
  "ak",
  "am",
  "an",
  "as",
  "av",
  "ay",
  "az",
  "ba",
  "be",
  "bg",
  "bh",
  "bi",
  "bm",
  "bo",
  "br",
  "bs",
  "ca",
  "ce",
  "ch",
  "co",
  "cr",
  "cs",
  "cu",
  "cv",
  "cy",
  "da",
  "de",
  "dv",
  "dz",
  "ee",
  "el",
  "eo",
  "es",
  "et",
  "eu",
  "fa",
  "ff",
  "fi",
  "fj",
  "fo",
  "fr",
  "fy",
  "ga",
  "gd",
  "gl",
  "gn",
  "gu",
  "gv",
  "ha",
  "he",
  "ho",
  "hr",
  "ht",
  "hu",
  "hy",
  "hz",
  "ia",
  "id",
  "ie",
  "ig",
  "ii",
  "ik",
  "io",
  "is",
  "it",
  "iu",
  "ja",
  "jv",
  "ka",
  "kg",
  "ki",
  "kj",
  "kk",
  "kl",
  "km",
  "kn",
  "ko",
  "kr",
  "ks",
  "ku",
  "kv",
  "kw",
  "ky",
  "la",
  "lb",
  "lg",
  "li",
  "ln",
  "lo",
  "lt",
  "lu",
  "lv",
  "mg",
  "mh",
  "mi",
  "mk",
  "ml",
  "mn",
  "mr",
  "ms",
  "mt",
  "my",
  "na",
  "nb",
  "nd",
  "ne",
  "ng",
  "nl",
  "nn",
  "no",
  "nr",
  "nv",
  "ny",
  "oc",
  "oj",
  "om",
  "or",
  "os",
  "pa",
  "pi",
  "pl",
  "ps",
  "pt",
  "qu",
  "rm",
  "rn",
  "ro",
  "ru",
  "rw",
  "sa",
  "sc",
  "sd",
  "se",
  "sg",
  "si",
  "sk",
  "sl",
  "sm",
  "sn",
  "so",
  "sq",
  "sr",
  "ss",
  "st",
  "su",
  "sv",
  "sw",
  "ta",
  "te",
  "tg",
  "th",
  "ti",
  "tk",
  "tl",
  "tn",
  "to",
  "tr",
  "ts",
  "tt",
  "tw",
  "ty",
  "ug",
  "uk",
  "uz",
  "ve",
  "vi",
  "vo",
  "wa",
  "wo",
  "xh",
  "yi",
  "yo",
  "za",
  "zh",
  "zu",
];

const ALL_LANGUAGE_CODES = Array.from(
  new Set([...TOP_FIVE_LANGUAGE_CODES, ...ISO_639_1_LANGUAGE_CODES])
);

function getDisplayLanguageName(code: string, locale: string) {
  try {
    return new Intl.DisplayNames([locale], { type: "language" }).of(code) || code.toUpperCase();
  } catch {
    try {
      return new Intl.DisplayNames(["en"], { type: "language" }).of(code) || code.toUpperCase();
    } catch {
      return code.toUpperCase();
    }
  }
}

function createLanguageOption(code: string): LanguageOption {
  const override = TOP_LANGUAGE_OVERRIDES[code];
  const isTopLanguage = TOP_FIVE_LANGUAGE_CODES.includes(
    code as (typeof TOP_FIVE_LANGUAGE_CODES)[number]
  );

  return {
    code,
    nativeName: override?.nativeName || getDisplayLanguageName(code, code),
    englishName: override?.englishName || getDisplayLanguageName(code, "en"),
    direction: RTL_LANGUAGE_CODES.has(code) ? "rtl" : "ltr",
    priority: isTopLanguage ? "top" : "all",
  };
}

const LANGUAGE_OPTIONS: LanguageOption[] = ALL_LANGUAGE_CODES.map(createLanguageOption);

const TOP_LANGUAGES = LANGUAGE_OPTIONS.filter((language) => language.priority === "top");

const STORAGE_KEY = "erp-panel-language";

function isValidLanguageCode(code: string) {
  return LANGUAGE_OPTIONS.some((language) => language.code === code);
}

function applyLanguageToDocument(code: string) {
  if (typeof document === "undefined") return;

  const selectedLanguage = LANGUAGE_OPTIONS.find((language) => language.code === code);

  if (!selectedLanguage) return;

  document.documentElement.lang = selectedLanguage.code;
  document.documentElement.dir = selectedLanguage.direction;
}

export default function LanguageSettingsPage() {
  const [lang, setLang] = useState("bn");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    try {
      const savedLanguage = window.localStorage.getItem(STORAGE_KEY);

      if (savedLanguage && isValidLanguageCode(savedLanguage)) {
        setLang(savedLanguage);
        applyLanguageToDocument(savedLanguage);
      }
    } catch {
      // LocalStorage unavailable হলে UI যেন ভেঙে না যায়।
    }
  }, []);

  const selectedLanguage = useMemo(() => {
    return LANGUAGE_OPTIONS.find((language) => language.code === lang) || LANGUAGE_OPTIONS[0];
  }, [lang]);

  const filteredLanguages = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return LANGUAGE_OPTIONS;
    }

    return LANGUAGE_OPTIONS.filter((language) => {
      return (
        language.code.toLowerCase().includes(normalizedSearch) ||
        language.nativeName.toLowerCase().includes(normalizedSearch) ||
        language.englishName.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [search]);

  const selectOptions = useMemo(() => {
    const selectedExists = filteredLanguages.some((language) => language.code === lang);

    if (selectedExists) {
      return filteredLanguages;
    }

    return [selectedLanguage, ...filteredLanguages];
  }, [filteredLanguages, lang, selectedLanguage]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidLanguageCode(lang)) {
      setSuccess(false);
      return;
    }

    setLoading(true);
    setSuccess(false);

    setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, lang);
      } catch {
        // LocalStorage unavailable হলেও language state এবং UI safe থাকবে।
      }

      applyLanguageToDocument(lang);
      setLoading(false);
      setSuccess(true);
    }, 700);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-md space-y-6 mt-6">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800">
        (Language Settings)
        </h1>
        <p className="text-sm text-gray-500">
        Select your Preferred Language For a personalized ERP Experience.
        </p>
      </div>

      {success && (
        <div className="p-4 bg-green-50 text-green-600 border border-green-200 rounded-lg text-sm">
          Panel Language Updated Successfully
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select The Top 5 Languages
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {TOP_LANGUAGES.map((language) => (
                <label
                  key={language.code}
                  dir={language.direction}
                  className={`p-4 border rounded-xl flex items-center gap-3 cursor-pointer transition ${
                    lang === language.code
                      ? "border-blue-500 bg-blue-50/50"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="lang"
                    value={language.code}
                    checked={lang === language.code}
                    onChange={() => setLang(language.code)}
                    className="accent-blue-600"
                  />
                  <div>
                    <span className="block font-bold text-gray-800 text-sm">
                      {language.nativeName}
                    </span>
                    <span className="text-xs text-gray-400">
                      {language.englishName} Language
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="max-w-2xl border rounded-xl p-4 bg-gray-50/60">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              All Country Languages
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search Languages :"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-400">
                  ভাষার নাম, English name অথবা ISO code দিয়ে সার্চ করতে পারবেন।
                </p>
              </div>

              <div>
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {selectOptions.length > 0 ? (
                    selectOptions.map((language) => (
                      <option key={language.code} value={language.code}>
                        {language.nativeName} — {language.englishName} ({language.code.toUpperCase()})
                      </option>
                    ))
                  ) : (
                    <option value={lang}>কোনো ভাষা পাওয়া যায়নি</option>
                  )}
                </select>

                <p className="mt-1 text-xs text-gray-400">
                  মোট {LANGUAGE_OPTIONS.length}টি আন্তর্জাতিক ভাষা যুক্ত আছে।
                </p>
              </div>
            </div>
          </div>

          <div
            dir={selectedLanguage.direction}
            className="p-4 rounded-xl border border-blue-100 bg-blue-50/40"
          >
            <p className="text-sm text-gray-600">
              Selected Language :
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="font-bold text-gray-800">
                {selectedLanguage.nativeName}
              </span>
              <span className="text-sm text-gray-500">
                ({selectedLanguage.englishName})
              </span>
              <span className="text-xs px-2 py-1 rounded-full bg-white border text-gray-500">
                ISO: {selectedLanguage.code.toUpperCase()}
              </span>
              <span className="text-xs px-2 py-1 rounded-full bg-white border text-gray-500">
                Direction: {selectedLanguage.direction.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-start">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow transition disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {loading ? "প্রসেস হচ্ছে..." : "Change The Language"}
          </button>
        </div>
      </form>
    </div>
  );
}