export function getDateForSteamTitle() {
  return new Date()
    .toLocaleDateString("en-US", {
      timeZone: "America/Los_Angeles",
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
