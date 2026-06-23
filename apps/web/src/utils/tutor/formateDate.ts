export function formatDate(iso: string, locale: string) {
  const formattedLocale =
    locale === "ar" ? "ar-EG" : "en-US";

  return new Date(iso).toLocaleDateString(formattedLocale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}