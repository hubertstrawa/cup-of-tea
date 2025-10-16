import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normalizes a date by setting seconds and milliseconds to 0
 * @param date - The date to normalize
 * @returns A new Date object with seconds and milliseconds set to 0
 */
export function normalizeDateToMinutes(date: Date): Date {
  const normalized = new Date(date);
  normalized.setSeconds(0, 0);
  return normalized;
}
