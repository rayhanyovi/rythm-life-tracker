import { QuestType } from "@prisma/client";

import {
  getAppTimezone,
  getCurrentLocalDate,
  getPeriodKeyForDate,
  shiftPeriodDate,
} from "@/lib/periods";

export function calculateCurrentStreak(
  questType: QuestType,
  completionPeriodKeys: string[],
  date = new Date(),
  timeZone = getAppTimezone(),
) {
  if (questType === QuestType.MAIN) {
    return null;
  }

  const completionSet = new Set(completionPeriodKeys);
  const currentPeriodKey = getPeriodKeyForDate(questType, date, timeZone);
  let cursorDate = getCurrentLocalDate(date, timeZone);

  if (!completionSet.has(currentPeriodKey)) {
    cursorDate = shiftPeriodDate(questType, cursorDate, -1);
  }

  let streak = 0;

  while (true) {
    const periodKey = getPeriodKeyForDate(questType, cursorDate, timeZone);

    if (!completionSet.has(periodKey)) {
      return streak;
    }

    streak += 1;
    cursorDate = shiftPeriodDate(questType, cursorDate, -1);
  }
}
