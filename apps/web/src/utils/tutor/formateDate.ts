export function formatDate(iso: string, locale: string) {
  const formattedLocale =
    locale === "ar" ? "ar-EG" : "en-US";

  return new Date(iso).toLocaleDateString(formattedLocale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatTime(isoString: string, locale: string, t: (key: string, values?: any) => string): string {
  const date = new Date(isoString);
  const today = new Date();

  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const formattedLocale = locale === "ar" ? "ar-EG" : "en-US";

  const time = date.toLocaleTimeString(formattedLocale, {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isToday) return t("today", { time });

  return `${formatDate(isoString, locale)}, ${time}`;
}