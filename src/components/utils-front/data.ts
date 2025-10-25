import FullCalendar from "@fullcalendar/react";
import type { RefObject } from "react";

export type calendarRef = RefObject<FullCalendar | null>;

// setting earliest / latest available time in minutes since Midnight
export const earliestTime = 360;
export const latestTime = 1430;

export const months = [
  {
    value: "1",
    label: "Styczeń",
  },
  {
    value: "2",
    label: "Luty",
  },
  {
    value: "3",
    label: "Marzec",
  },
  {
    value: "4",
    label: "Kwiecień",
  },
  {
    value: "5",
    label: "Maj",
  },
  {
    value: "6",
    label: "Czerwiec",
  },
  {
    value: "7",
    label: "Lipiec",
  },
  {
    value: "8",
    label: "Sierpień",
  },
  {
    value: "9",
    label: "Wrzesień",
  },
  {
    value: "10",
    label: "Październik",
  },
  {
    value: "11",
    label: "Listopad",
  },
  {
    value: "12",
    label: "Grudzień",
  },
];

const getRandomDays = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const currentDate = new Date();

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  dateStatus: string;
  backgroundColor?: string;
  description?: string;
}

export const initialEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "Daily Standup Meeting",
    start: new Date("2025-10-12 10:00:00+02:00"),
    end: new Date("2025-10-12 14:00:00+02:00"),
    backgroundColor: "#AEC6E4",
    dateStatus: "available",
    description: "This is a daily meeting to go over today's tasks.",
  },
  {
    id: "2",
    title: "Client Lunch",
    start: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1, 16, 30),
    end: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1, 17, 30),
    backgroundColor: "#FFD1DC",
    description: "Lunch at Cracker Barrel with integration clients.",
    dateStatus: "available",
  },
  {
    id: "3",
    title: "Counselor Meetup",
    start: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 18, 0),
    end: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 18, 45),
    backgroundColor: "#B2E0B2",
    description: "Conversation with counselor about progression.",
    dateStatus: "available",
  },
  {
    id: "4",
    title: "Team Retreat",
    start: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 3, 8, 0),
    end: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 3, 18, 45),
    backgroundColor: "#FFB3BA",
    description: "Team bonding and strategic planning.",
    dateStatus: "available",
  },
  {
    id: "5",
    title: "Time Management Workshop",
    start: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 5, 10, 0),
    end: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 5, 15, 30),
    backgroundColor: "#FFDFBA",
    description: "Improve your productivity with effective time management techniques.",
    dateStatus: "available",
  },
  {
    id: "6",
    title: "Health and Wellness Fair",
    dateStatus: "available",
    start: new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() + getRandomDays(20, 24),
      9,
      0
    ),
    end: new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() + getRandomDays(25, 29),
      15,
      0
    ),
    backgroundColor: "#B9FBC0",
    description: "Explore health resources and wellness activities.",
  },
  {
    id: "7",
    title: "Book Club Discussion",
    dateStatus: "available",
    start: new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() + getRandomDays(30, 34),
      18,
      0
    ),
    end: new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() + getRandomDays(35, 39),
      20,
      0
    ),
    backgroundColor: "#C3B1E1",
    description: "Discussing this month's book selection with the club.",
  },
  {
    id: "8",
    title: "Creative Writing Workshop",
    dateStatus: "available",
    start: new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() + getRandomDays(40, 44),
      14,
      0
    ),
    end: new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() + getRandomDays(45, 49),
      16,
      0
    ),
    backgroundColor: "#B2E7E0",
    description: "Join us for a weekend of creative writing exercises.",
  },
  {
    id: "9",
    title: "Charity Fundraiser",
    dateStatus: "available",
    start: new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() + getRandomDays(50, 54),
      19,
      0
    ),
    end: new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() + getRandomDays(55, 59),
      22,
      0
    ),
    backgroundColor: "#F6C9D8",
    description: "An evening of fun to raise funds for a good cause.",
  },
];
