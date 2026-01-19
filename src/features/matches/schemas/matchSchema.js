import { z } from 'zod';

export const matchSchema = z.object({
  league: z.string().min(1, "League is required"),
  match: z.string().min(1, "Match name is required"),
  teamA: z.string().min(1, "Home Team is required"),
  teamB: z.string().min(1, "Away Team is required"),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)"),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  channel: z.string().optional(),
  cdn: z.string().default('AWS'),
});
