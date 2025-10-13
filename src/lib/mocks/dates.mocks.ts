import type {
  DateListItemDTO,
  PaginatedResponseDTO,
  CreateEntityResponseDTO,
  UpdateEntityResponseDTO,
  DeleteEntityResponseDTO,
} from "../../types2";
import { DEFAULT_USER_ID } from "../../db/supabase.client";

// Mock data for dates
export const mockDates: DateListItemDTO[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    start_time: "2024-01-15T10:00:00.000Z",
    student_id: null,
    end_time: "2024-01-15T11:00:00.000Z",
    status: "available",
    teacher_id: DEFAULT_USER_ID,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    start_time: "2024-01-15T14:00:00.000Z",
    end_time: "2024-01-15T15:00:00.000Z",
    status: "booked",
    teacher_id: DEFAULT_USER_ID,
    student_id: null,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    start_time: "2024-01-16T09:00:00.000Z",
    end_time: "2024-01-16T10:00:00.000Z",
    status: "available",
    teacher_id: DEFAULT_USER_ID,
    student_id: null,
  },
];

// Mock paginated response
export const mockPaginatedDatesResponse: PaginatedResponseDTO<DateListItemDTO> = {
  data: mockDates,
  pagination: {
    page: 1,
    limit: 10,
    total: 3,
  },
};

// Mock create response
export const mockCreateDateResponse: CreateEntityResponseDTO = {
  message: "Date created successfully",
  id: "550e8400-e29b-41d4-a716-446655440004",
};

// Mock update response
export const mockUpdateDateResponse: UpdateEntityResponseDTO = {
  message: "Date updated successfully",
};

// Mock delete response
export const mockDeleteDateResponse: DeleteEntityResponseDTO = {
  message: "Date deleted successfully",
};

// Mock request bodies
export const mockCreateDateRequest = {
  start_time: "2024-01-17T10:00:00.000Z",
  end_time: "2024-01-17T11:00:00.000Z",
  status: "available",
  additional_info: {
    notes: "Regular lesson slot",
  },
};

export const mockUpdateDateRequest = {
  start_time: "2024-01-17T11:00:00.000Z",
  end_time: "2024-01-17T12:00:00.000Z",
  status: "available",
};

// Mock query parameters
export const mockQueryParams = {
  page: 1,
  limit: 10,
  teacherId: DEFAULT_USER_ID,
  date: "2024-01-15",
  status: "available",
};

// Mock error responses
export const mockErrorResponses = {
  validation: {
    error: "Invalid request data",
    details: "End time must be after start time",
  },
  notFound: {
    error: "Not found",
    message: "Date not found",
  },
  conflict: {
    error: "Conflict",
    message: "Time slot conflicts with existing date",
  },
  forbidden: {
    error: "Forbidden",
    message: "Insufficient permissions to update this date",
  },
  serverError: {
    error: "Internal server error",
    message: "Failed to create date",
  },
};

// Mock Supabase client for testing
// export const createMockSupabaseClient = () => {
//   const mockFrom = (table: string) => ({
//     select: (columns?: string, options?: any) => ({
//       eq: (column: string, value: any) => mockFrom(table),
//       neq: (column: string, value: any) => mockFrom(table),
//       gte: (column: string, value: any) => mockFrom(table),
//       lte: (column: string, value: any) => mockFrom(table),
//       or: (query: string) => mockFrom(table),
//       order: (column: string, options?: any) => mockFrom(table),
//       range: (from: number, to: number) => ({
//         then: (callback: (result: any) => void) => callback({ data: mockDates, error: null, count: mockDates.length }),
//       }),
//       single: () => ({
//         then: (callback: (result: any) => void) => callback({ data: mockDates[0], error: null }),
//       }),
//     }),
//     insert: (data: any) => ({
//       select: (columns?: string) => ({
//         single: () => ({
//           then: (callback: (result: any) => void) => callback({ data: { id: mockCreateDateResponse.id }, error: null }),
//         }),
//       }),
//     }),
//     update: (data: any) => ({
//       eq: (column: string, value: any) => ({
//         then: (callback: (result: any) => void) => callback({ data: null, error: null }),
//       }),
//     }),
//     delete: () => ({
//       eq: (column: string, value: any) => ({
//         then: (callback: (result: any) => void) => callback({ data: null, error: null }),
//       }),
//     }),
//   });

//   return {
//     from: mockFrom,
//   };
// };
