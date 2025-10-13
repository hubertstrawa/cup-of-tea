# Dates API Documentation

## Overview
The `/api/dates` endpoint manages teacher availability slots. It supports full CRUD operations with proper validation, error handling, and logging.

## Endpoints

### GET /api/dates
Retrieve a paginated list of dates with optional filters.

**Query Parameters:**
- `page` (optional): Page number (default: 1, min: 1)
- `limit` (optional): Items per page (default: 10, min: 1, max: 100)
- `teacherId` (optional): Filter by teacher UUID
- `date` (optional): Filter by specific date (YYYY-MM-DD format)
- `status` (optional): Filter by status ("available", "booked", "canceled")

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "start_time": "2024-01-15T10:00:00.000Z",
      "end_time": "2024-01-15T11:00:00.000Z",
      "status": "available",
      "teacher_id": "uuid"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25
  }
}
```

### POST /api/dates
Create a new date entry.

**Request Body:**
```json
{
  "start_time": "2024-01-17T10:00:00.000Z",
  "end_time": "2024-01-17T11:00:00.000Z",
  "status": "available",
  "additional_info": {
    "notes": "Regular lesson slot"
  }
}
```

**Response (201):**
```json
{
  "message": "Date created successfully",
  "id": "uuid"
}
```

### PUT /api/dates/{id}
Update an existing date entry.

**URL Parameters:**
- `id`: UUID of the date to update

**Request Body:**
```json
{
  "start_time": "2024-01-17T11:00:00.000Z",
  "end_time": "2024-01-17T12:00:00.000Z",
  "status": "available"
}
```

**Response (200):**
```json
{
  "message": "Date updated successfully"
}
```

### DELETE /api/dates/{id}
Delete a date entry.

**URL Parameters:**
- `id`: UUID of the date to delete

**Response (200):**
```json
{
  "message": "Date deleted successfully"
}
```

## Error Responses

### 400 Bad Request
Invalid request data or validation errors.
```json
{
  "error": "Invalid request data",
  "details": "End time must be after start time"
}
```

### 403 Forbidden
Insufficient permissions to perform the operation.
```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions to update this date"
}
```

### 404 Not Found
Requested resource not found.
```json
{
  "error": "Not found",
  "message": "Date not found"
}
```

### 409 Conflict
Business logic conflicts (e.g., time slot conflicts).
```json
{
  "error": "Conflict",
  "message": "Time slot conflicts with existing date"
}
```

### 500 Internal Server Error
Unexpected server errors.
```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred"
}
```

## Business Rules

1. **Time Validation**: `end_time` must be after `start_time`
2. **Conflict Detection**: No overlapping time slots for the same teacher
3. **Ownership**: Only the teacher who created a date can modify or delete it
4. **Reservation Protection**: Dates with confirmed reservations cannot be deleted
5. **Status Management**: Status changes follow business logic constraints

## Error Logging

All errors are automatically logged to the `error_logs` table with:
- Error code and message
- Module and function name
- Detailed stack trace
- Timestamp

## Testing

Mock data and test utilities are available in:
- `src/lib/mocks/dates.mocks.ts` - Mock data and Supabase client
- `src/lib/services/__tests__/dates.service.test.ts` - Unit tests

## Usage Examples

### Fetch available dates for a specific teacher on a date
```
GET /api/dates?teacherId=uuid&date=2024-01-15&status=available&page=1&limit=10
```

### Create a new availability slot
```
POST /api/dates
Content-Type: application/json

{
  "start_time": "2024-01-20T14:00:00.000Z",
  "end_time": "2024-01-20T15:00:00.000Z",
  "status": "available"
}
```

### Update a time slot
```
PUT /api/dates/550e8400-e29b-41d4-a716-446655440001
Content-Type: application/json

{
  "start_time": "2024-01-20T15:00:00.000Z",
  "end_time": "2024-01-20T16:00:00.000Z"
}
```

### Delete a time slot
```
DELETE /api/dates/550e8400-e29b-41d4-a716-446655440001
```
