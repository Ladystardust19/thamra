// Consultation availability — a code template (single source of truth).
// Edit SLOT_CONFIG to change when consultations are offered.
//
// Georgia (Asia/Tbilisi) is UTC+4 all year (no DST), so we use a fixed offset
// instead of a tz library: a slot's stored instant is UTC, but it's generated
// and displayed in Tbilisi local time.

export const TBILISI_OFFSET_HOURS = 4;

export const SLOT_CONFIG = {
  weekdays: [1, 2, 3, 4, 5], // Mon–Fri (JS getDay: 0=Sun … 6=Sat)
  startHour: 10, // first slot starts at 10:00 (Tbilisi)
  endHour: 20, // slots must finish by 20:00 (Tbilisi)
  slotMinutes: 45, // length of one consultation
  horizonDays: 14, // how far ahead slots are offered
  leadMinutes: 120, // earliest a slot can be booked from "now"
};

export interface Slot {
  start: string; // ISO UTC instant — the canonical slot id
  label: string; // Georgian human label, e.g. "ორშაბათი, 5 აგვისტო, 10:00"
}

const GE_WEEKDAYS = [
  "კვირა", "ორშაბათი", "სამშაბათი", "ოთხშაბათი", "ხუთშაბათი", "პარასკევი", "შაბათი",
];
const GE_MONTHS = [
  "იანვარი", "თებერვალი", "მარტი", "აპრილი", "მაისი", "ივნისი",
  "ივლისი", "აგვისტო", "სექტემბერი", "ოქტომბერი", "ნოემბერი", "დეკემბერი",
];

// Tbilisi-local calendar fields for a UTC instant (offset is fixed year-round).
function tbilisiParts(utc: Date) {
  const t = new Date(utc.getTime() + TBILISI_OFFSET_HOURS * 3_600_000);
  return {
    weekday: t.getUTCDay(),
    day: t.getUTCDate(),
    month: t.getUTCMonth(),
    year: t.getUTCFullYear(),
    hour: t.getUTCHours(),
    minute: t.getUTCMinutes(),
  };
}

// The UTC instant for a given Tbilisi-local Y/M/D H:M (day/month overflow is
// normalised by Date.UTC, so day+d across a month boundary is safe).
function tbilisiInstant(
  year: number, month: number, day: number, hour: number, minute: number,
): Date {
  return new Date(Date.UTC(year, month, day, hour - TBILISI_OFFSET_HOURS, minute, 0, 0));
}

/** "ორშაბათი, 5 აგვისტო" — the day part of a slot, for grouping. */
export function slotDayLabel(iso: string): string {
  const p = tbilisiParts(new Date(iso));
  return `${GE_WEEKDAYS[p.weekday]}, ${p.day} ${GE_MONTHS[p.month]}`;
}

/** "10:00" — the time part of a slot. */
export function slotTimeLabel(iso: string): string {
  const p = tbilisiParts(new Date(iso));
  return `${String(p.hour).padStart(2, "0")}:${String(p.minute).padStart(2, "0")}`;
}

/** Full Georgian label for a slot instant (ISO string). */
export function formatSlot(iso: string): string {
  return `${slotDayLabel(iso)}, ${slotTimeLabel(iso)}`;
}

/**
 * Every template slot from now to the horizon, BEFORE removing taken ones.
 * Past slots and anything inside the lead-time window are already excluded.
 */
export function generateTemplateSlots(now: Date = new Date()): Slot[] {
  const cfg = SLOT_CONFIG;
  const slots: Slot[] = [];
  const earliest = now.getTime() + cfg.leadMinutes * 60_000;
  const today = tbilisiParts(now);
  const lastStartMin = cfg.endHour * 60 - cfg.slotMinutes; // latest start that still ends by endHour

  for (let d = 0; d <= cfg.horizonDays; d++) {
    // Resolve the Tbilisi calendar date d days ahead.
    const dayParts = tbilisiParts(
      tbilisiInstant(today.year, today.month, today.day + d, cfg.startHour, 0),
    );
    if (!cfg.weekdays.includes(dayParts.weekday)) continue;

    for (let min = cfg.startHour * 60; min <= lastStartMin; min += cfg.slotMinutes) {
      const instant = tbilisiInstant(
        dayParts.year, dayParts.month, dayParts.day, Math.floor(min / 60), min % 60,
      );
      if (instant.getTime() >= earliest) {
        const iso = instant.toISOString();
        slots.push({ start: iso, label: formatSlot(iso) });
      }
    }
  }
  return slots;
}

/** True if `iso` is a valid, currently-offered template slot. */
export function isValidTemplateSlot(iso: string, now: Date = new Date()): boolean {
  return generateTemplateSlots(now).some((s) => s.start === iso);
}
