import { useTranslation } from "@/contexts/TranslationContext";
import { config } from "process";

// ===== Dynamic USD → VND rate (using exchangerate-api.com) =====
const FALLBACK_USD_TO_VND = 26000; // fallback nếu API lỗi
const RATE_TTL_MS = 30 * 60 * 1000; // cache 30 phút

let _usdToVndRate = FALLBACK_USD_TO_VND;
let _usdToVndTs = 0;
let _usdToVndFetching = false;

// ⚠️ Thay YOUR-API-KEY bằng key thật của bạn
const EXCHANGE_API_URL = import.meta.env.VITE_EXCHANGE_API_URL 

function revalidateUsdToVnd() {
  const now = Date.now();
  if (_usdToVndFetching) return;
  if (now - _usdToVndTs < RATE_TTL_MS) return;

  _usdToVndFetching = true;
  fetch(EXCHANGE_API_URL)
    .then((r) => r.json())
    .then((data) => {
      const next = Number(data?.conversion_rate);
      if (Number.isFinite(next) && next > 0) {
        _usdToVndRate = next;
        _usdToVndTs = Date.now();
        console.log("[Currency] Updated USD→VND:", Math.round(next));
      }
    })
    .catch((err) => {
      console.warn("[Currency] Fetch rate failed, using cached:", err);
    })
    .finally(() => {
      _usdToVndFetching = false;
    });
}

function getUsdToVndRateSync(): number {
  // mỗi lần gọi sẽ tự refresh nền nếu cache quá cũ
  revalidateUsdToVnd();
  return _usdToVndRate;
}
// ===== End dynamic rate =====

export const formatCurrency = (
  amount: number,
  language: "en" | "vi" = "en"
): string => {
  if (language === "vi") {
    const rate = getUsdToVndRateSync();
    const vndAmount = Math.round(amount * rate);
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(vndAmount);
  } else {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
};

export const convertToVND = (usdAmount: number): number => {
  const rate = getUsdToVndRateSync();
  return Math.round(usdAmount * rate);
};

export const useCurrency = () => {
  const { language } = useTranslation();

  const formatPrice = (amount: number): string => {
    return formatCurrency(amount, language);
  };

  const convertPrice = (usdAmount: number): number => {
    return language === "vi" ? convertToVND(usdAmount) : usdAmount;
  };

  return {
    formatPrice,
    convertPrice,
    currency: language === "vi" ? "VND" : "USD",
    currencySymbol: language === "vi" ? "₫" : "$",
  };
};