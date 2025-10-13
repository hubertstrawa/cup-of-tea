import type { SupabaseClient } from "../../db/supabase.client";

export interface ErrorLogEntry {
  error_code?: string;
  module: string;
  function_name: string;
  details: string;
}

export class ErrorHandler {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Log error to the error_logs table
   */
  async logError(entry: ErrorLogEntry): Promise<void> {
    try {
      await this.supabase.from("error_logs").insert({
        error_code: entry.error_code,
        module: entry.module,
        function_name: entry.function_name,
        details: entry.details,
        occurred_at: new Date().toISOString(),
      });
    } catch (logError) {
      // If logging fails, at least log to console
      console.error("Failed to log error to database:", logError);
      console.error("Original error:", entry);
    }
  }

  /**
   * Handle API errors with proper HTTP responses and logging
   */
  async handleApiError(error: unknown, module: string, functionName: string): Promise<Response> {
    console.error(`${module}.${functionName} error:`, error);

    if (error instanceof Error) {
      // Log error to database
      await this.logError({
        error_code: error.cause as string,
        module,
        function_name: functionName,
        details: `${error.message}\n\nStack: ${error.stack}`,
      });

      // Validation errors (Zod)
      if (error.name === "ZodError") {
        return new Response(
          JSON.stringify({
            error: "Invalid request data",
            details: error.message,
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Business logic errors
      switch (error.cause) {
        case "NOT_FOUND":
          return new Response(
            JSON.stringify({
              error: "Not found",
              message: error.message,
            }),
            {
              status: 404,
              headers: { "Content-Type": "application/json" },
            }
          );

        case "FORBIDDEN":
          return new Response(
            JSON.stringify({
              error: "Forbidden",
              message: error.message,
            }),
            {
              status: 403,
              headers: { "Content-Type": "application/json" },
            }
          );

        case "CONFLICT":
          return new Response(
            JSON.stringify({
              error: "Conflict",
              message: error.message,
            }),
            {
              status: 409,
              headers: { "Content-Type": "application/json" },
            }
          );

        default:
          // Generic server error
          return new Response(
            JSON.stringify({
              error: "Internal server error",
              message: "An unexpected error occurred",
            }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            }
          );
      }
    }

    // Unknown error type
    await this.logError({
      error_code: "UNKNOWN_ERROR",
      module,
      function_name: functionName,
      details: `Unknown error type: ${typeof error}\n\nValue: ${JSON.stringify(error)}`,
    });

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: "An unexpected error occurred",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
