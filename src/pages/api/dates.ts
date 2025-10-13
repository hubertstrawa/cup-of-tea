import type { APIRoute } from "astro";
import { DatesService } from "../../lib/services/dates.service";
// import { DEFAULT_USER_ID } from "../../db/supabase.client";
import { ErrorHandler } from "../../lib/utils/error-handler";
import { datesListQuerySchema, createDateSchema } from "../../lib/validation/dates.schemas";

export const prerender = false;

/**
 * GET /api/dates - Get paginated list of dates with optional filters
 */
export const GET: APIRoute = async ({ request, locals }) => {
  try {
    // Get logged-in user info
    const {
      data: { user },
    } = await locals.supabase.auth.getUser();

    if (!user?.id) {
      return new Response(
        JSON.stringify({
          error: "Authentication required",
          message: "Użytkownik musi być zalogowany, aby pobrać daty.",
        }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams);

    // Validate query parameters
    const validatedQuery = datesListQuerySchema.parse({
      ...queryParams,
      teacherId: user.id, // Nadpisanie/zdefiniowanie teacherId jako logged-in user
    });

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
    const {
      data: { user },
    } = await locals.supabase.auth.getUser();

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

    console.log("user", user);

    const validatedData = createDateSchema.parse(body);

    console.log("validatedData", validatedData);

    if (!user?.id) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const datesService = new DatesService(locals.supabase);
    const result = await datesService.createDate(validatedData, user.id);
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
