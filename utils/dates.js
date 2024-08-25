export function getDateForSteamTitle() {
  return new Date()
    .toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    })
    .replace(/,/g, "");
}
