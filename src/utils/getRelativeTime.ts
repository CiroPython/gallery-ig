import {
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  differenceInWeeks,
  differenceInMonths
} from "date-fns";

export const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const min = differenceInMinutes(now, date);
  const hr = differenceInHours(now, date);
  const day = differenceInDays(now, date);
  const week = differenceInWeeks(now, date);
  const month = differenceInMonths(now, date);

  if (min < 1) return "Adesso";
  if (min < 60) return `${min} min fa`;
  if (hr < 24) return `${hr} ${hr === 1 ? "ora" : "ore"} fa`;
  if (day === 1) return "Ieri";
  if (day < 7) return `${day} giorni fa`;
  if (week < 5) return `${week} sett. fa`;
  return `${month} ${month === 1 ? "mese" : "mesi"} fa`;
};
