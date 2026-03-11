import { QuestType } from "@prisma/client";

const DEFAULT_TIMEZONE = "Asia/Jakarta";

function getDatePartsInTimeZone(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(date);
  const lookup = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return {
    year: Number(lookup.year),
    month: Number(lookup.month),
    day: Number(lookup.day),
  };
}

function toUtcDateFromLocalParts(parts: {
  day: number;
  month: number;
  year: number;
}) {
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function getIsoWeekData(date: Date) {
  const workingDate = new Date(date.getTime());
  const weekDay = workingDate.getUTCDay() || 7;

  workingDate.setUTCDate(workingDate.getUTCDate() + 4 - weekDay);

  const year = workingDate.getUTCFullYear();
  const yearStart = new Date(Date.UTC(year, 0, 1));
  const dayOfYear =
    Math.floor((workingDate.getTime() - yearStart.getTime()) / 86_400_000) + 1;
  const week = Math.ceil(dayOfYear / 7);

  return {
    week,
    year,
  };
}

function getTimeZoneOffsetMinutes(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "shortOffset",
    hour: "2-digit",
  });
  const timeZonePart = formatter
    .formatToParts(date)
    .find((part) => part.type === "timeZoneName")?.value;

  if (!timeZonePart || timeZonePart === "GMT") {
    return 0;
  }

  const match = timeZonePart.match(/^GMT([+-])(\d{1,2})(?::(\d{2}))?$/);

  if (!match) {
    return 0;
  }

  const sign = match[1] === "-" ? -1 : 1;
  const hours = Number(match[2]);
  const minutes = Number(match[3] ?? "0");

  return sign * (hours * 60 + minutes);
}

export function parseLocalDateInput(dateValue: string) {
  const match = dateValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    return null;
  }

  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
}

export function getAppTimezone() {
  return process.env.NEXT_PUBLIC_APP_TIMEZONE ?? DEFAULT_TIMEZONE;
}

export function getLocalDateKey(date = new Date(), timeZone = getAppTimezone()) {
  const localParts = getDatePartsInTimeZone(date, timeZone);

  return `${localParts.year}-${pad(localParts.month)}-${pad(localParts.day)}`;
}

export function getCurrentLocalDate(date = new Date(), timeZone = getAppTimezone()) {
  return toUtcDateFromLocalParts(getDatePartsInTimeZone(date, timeZone));
}

export function getDateForLocalDateInput(
  dateValue: string,
  timeZone = getAppTimezone(),
  hour = 12,
) {
  const parsed = parseLocalDateInput(dateValue);

  if (!parsed) {
    return null;
  }

  const offsetMinutes = getTimeZoneOffsetMinutes(
    new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day, 12)),
    timeZone,
  );

  return new Date(
    Date.UTC(parsed.year, parsed.month - 1, parsed.day, hour) -
      offsetMinutes * 60_000,
  );
}

export function shiftPeriodDate(
  questType: QuestType,
  date: Date,
  amount: number,
) {
  const nextDate = new Date(date.getTime());

  if (questType === QuestType.MONTHLY) {
    nextDate.setUTCDate(1);
    nextDate.setUTCMonth(nextDate.getUTCMonth() + amount);

    return nextDate;
  }

  if (questType === QuestType.WEEKLY) {
    nextDate.setUTCDate(nextDate.getUTCDate() + amount * 7);

    return nextDate;
  }

  if (questType === QuestType.DAILY) {
    nextDate.setUTCDate(nextDate.getUTCDate() + amount);
  }

  return nextDate;
}

export function getPeriodKeyForDate(
  questType: QuestType,
  date = new Date(),
  timeZone = getAppTimezone(),
) {
  if (questType === QuestType.MAIN) {
    return "ONE_TIME";
  }

  const localParts = getDatePartsInTimeZone(date, timeZone);

  if (questType === QuestType.DAILY) {
    return `${localParts.year}-${pad(localParts.month)}-${pad(localParts.day)}`;
  }

  if (questType === QuestType.MONTHLY) {
    return `${localParts.year}-${pad(localParts.month)}`;
  }

  const utcDate = toUtcDateFromLocalParts(localParts);
  const isoWeek = getIsoWeekData(utcDate);

  return `${isoWeek.year}-W${pad(isoWeek.week)}`;
}

export function getCurrentPeriodKey(
  questType: QuestType,
  date = new Date(),
  timeZone = getAppTimezone(),
) {
  return getPeriodKeyForDate(questType, date, timeZone);
}
