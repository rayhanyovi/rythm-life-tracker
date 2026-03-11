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

export function getAppTimezone() {
  return process.env.NEXT_PUBLIC_APP_TIMEZONE ?? DEFAULT_TIMEZONE;
}

export function getCurrentPeriodKey(
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
