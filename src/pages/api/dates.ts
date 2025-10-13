import type { APIRoute } from "astro";
import { DatesService } from "../../lib/services/dates.service";
import { DEFAULT_USER_ID } from "../../db/supabase.client";
import { ErrorHandler } from "../../lib/utils/error-handler";
import { datesListQuerySchema, createDateSchema } from "../../lib/validation/dates.schemas";

export const prerender = false;

/**
 * GET /api/dates - Get paginated list of dates with optional filters
 */
export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams);

    // Validate query parameters
    const validatedQuery = datesListQuerySchema.parse(queryParams);

    const datesService = new DatesService(locals.supabase);
    const result = await datesService.getDates(validatedQuery);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    const errorHandler = new ErrorHandler(locals.supabase);
    return await errorHandler.handleApiError(error, "dates-api", "GET");
  }
};

/**
 * POST /api/dates - Create a new date entry
 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      return new Response(
        JSON.stringify({
          error: "Invalid JSON",
          message: "Request body must be valid JSON",
          details: jsonError instanceof Error ? jsonError.message : "Unknown JSON parsing error",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const validatedData = createDateSchema.parse(body);

    console.log("validatedData", validatedData);

    const datesService = new DatesService(locals.supabase);
    const result = await datesService.createDate(validatedData, DEFAULT_USER_ID);
    return new Response(JSON.stringify(result), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    const errorHandler = new ErrorHandler(locals.supabase);
    return await errorHandler.handleApiError(error, "dates-api", "POST");
  }
};
