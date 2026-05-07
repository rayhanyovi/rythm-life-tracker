import { TaskCadence } from "@prisma/client";

import {
  getAppTimezone,
  getCurrentLocalDate,
  getPeriodKeyForDate,
  shiftPeriodDate,
} from "@/lib/periods";

export function calculateCurrentStreak(
  cadence: TaskCadence,
  completionPeriodKeys: string[],
  date = new Date(),
  timeZone = getAppTimezone(),
) {
  if (cadence === TaskCadence.ONCE) {
    return null;
  }

  const completionSet = new Set(completionPeriodKeys);
  const currentPeriodKey = getPeriodKeyForDate(cadence, date, timeZone);
  let cursorDate = getCurrentLocalDate(date, timeZone);

  if (!completionSet.has(currentPeriodKey)) {
    cursorDate = shiftPeriodDate(cadence, cursorDate, -1);
  }

  let streak = 0;

  while (true) {
    const periodKey = getPeriodKeyForDate(cadence, cursorDate, timeZone);

    if (!completionSet.has(periodKey)) {
      return streak;
    }

    streak += 1;
    cursorDate = shiftPeriodDate(cadence, cursorDate, -1);
  }
}
