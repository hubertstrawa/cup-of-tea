import { describe, it, expect, beforeEach } from "vitest";
import { DatesService } from "../dates.service";
import {
  createMockSupabaseClient,
  mockDates,
  mockCreateDateRequest,
  mockUpdateDateRequest,
} from "../../mocks/dates.mocks";
import { DEFAULT_USER_ID } from "../../../db/supabase.client";

describe("DatesService", () => {
  let datesService: DatesService;
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    datesService = new DatesService(mockSupabase);
  });

  describe("getDates", () => {
    it("should return paginated dates", async () => {
      const query = {
        page: 1,
        limit: 10,
      };

      const result = await datesService.getDates(query);

      expect(result).toEqual({
        data: mockDates,
        pagination: {
          page: 1,
          limit: 10,
          total: mockDates.length,
        },
      });
    });

    it("should apply filters correctly", async () => {
      const query = {
        page: 1,
        limit: 10,
        teacherId: DEFAULT_USER_ID,
        date: "2024-01-15",
        status: "available" as const,
      };

      const result = await datesService.getDates(query);

      expect(result.data).toBeDefined();
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
    });
  });

  describe("createDate", () => {
    it("should create a new date successfully", async () => {
      const result = await datesService.createDate(mockCreateDateRequest, DEFAULT_USER_ID);

      expect(result).toEqual({
        message: "Date created successfully",
        id: expect.any(String),
      });
    });

    it("should validate time range", () => {
      const invalidRequest = {
        ...mockCreateDateRequest,
        start_time: "2024-01-17T12:00:00.000Z",
        end_time: "2024-01-17T10:00:00.000Z", // End before start
      };

      expect(() => datesService.createDate(invalidRequest, DEFAULT_USER_ID)).rejects.toThrow();
    });
  });

  describe("updateDate", () => {
    it("should update date successfully", async () => {
      const dateId = mockDates[0].id;

      const result = await datesService.updateDate(dateId, mockUpdateDateRequest, DEFAULT_USER_ID);

      expect(result).toEqual({
        message: "Date updated successfully",
      });
    });
  });

  describe("deleteDate", () => {
    it("should delete date successfully", async () => {
      const dateId = mockDates[0].id;

      const result = await datesService.deleteDate(dateId, DEFAULT_USER_ID);

      expect(result).toEqual({
        message: "Date deleted successfully",
      });
    });
  });
});

// Note: These are basic unit tests. For full testing, you would need:
// 1. More comprehensive mock implementations
// 2. Integration tests with real Supabase client
// 3. Error scenario testing
// 4. Edge case validation
// 5. Performance testing for large datasets
