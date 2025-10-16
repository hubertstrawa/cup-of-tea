import type { APIRoute } from "astro";
import { DatesService } from "../../../lib/services/dates.service";
// import { DEFAULT_USER_ID } from "../../../db/supabase.client";
import { ErrorHandler } from "../../../lib/utils/error-handler";
import { updateDateSchema, dateIdParamSchema } from "../../../lib/validation/dates.schemas";

/**
 * PUT /api/dates/{id} - Update an existing date entry
 */
export const PUT: APIRoute = async ({ params, request, locals }) => {
  try {
    console.log('params',params)
    // Validate URL parameters
    const {
      data: { user },
    } = await locals.supabase.auth.getUser();
    if (!user?.id) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    const validatedParams = dateIdParamSchema.parse(params);

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateDateSchema.parse(body);

    const datesService = new DatesService(locals.supabase);
    const result = await datesService.updateDate(validatedParams.id, validatedData, user.id);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    const errorHandler = new ErrorHandler(locals.supabase);
    return await errorHandler.handleApiError(error, "dates-api", "PUT");
  }
};

/**
 * DELETE /api/dates/{id} - Delete a date entry
 */
export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    const {
      data: { user },
    } = await locals.supabase.auth.getUser();
    if (!user?.id) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    // Validate URL parameters
    const validatedParams = dateIdParamSchema.parse(params);

    const datesService = new DatesService(locals.supabase);
    const result = await datesService.deleteDate(validatedParams.id, user.id);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    const errorHandler = new ErrorHandler(locals.supabase);
    return await errorHandler.handleApiError(error, "dates-api", "DELETE");
  }
};
