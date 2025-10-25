import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../../../db/supabase.client.ts";
import { format } from "date-fns";

export const prerender = false;

/**
 * GET /api/public/tutor/[id]/dates - Get available dates for a specific tutor (public access)
 */
export const GET: APIRoute = async ({ params, request, cookies }) => {
  try {
    const { id: tutorId } = params;
    
    if (!tutorId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Tutor ID is required",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // Sprawdź czy tutor istnieje
    const { data: tutor, error: tutorError } = await supabase
      .from("users")
      .select("id")
      .eq("id", tutorId)
      .eq("role", "tutor")
      .single();

    if (tutorError || !tutor) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Tutor not found",
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const url = new URL(request.url);
    const dateParam = url.searchParams.get("date");
    const statusParam = url.searchParams.get("status") || "available";
    const limitParam = url.searchParams.get("limit");
    const fromDateParam = url.searchParams.get("from_date");

    let query = supabase
      .from("dates")
      .select("*")
      .eq("teacher_id", tutorId)
      .eq("status", statusParam)
      .order("start_time", { ascending: true });

    // Filtruj po konkretnej dacie jeśli podana
    if (dateParam) {
      const startOfDay = `${dateParam}T00:00:00.000Z`;
      const endOfDay = `${dateParam}T23:59:59.999Z`;
      query = query.gte("start_time", startOfDay).lte("start_time", endOfDay);
    }
    
    // Filtruj od określonej daty jeśli podana (dla najbliższego terminu)
    if (fromDateParam) {
      const fromDateTime = `${fromDateParam}T00:00:00.000Z`;
      query = query.gte("start_time", fromDateTime);
    }

    // Ogranicz liczbę wyników jeśli podana
    if (limitParam) {
      const limit = parseInt(limitParam, 10);
      if (!isNaN(limit) && limit > 0) {
        query = query.limit(limit);
      }
    }

    const { data: dates, error } = await query;

    if (error) {
      console.error("Error fetching tutor dates:", error);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to fetch dates",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: dates || [],
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Public tutor dates API error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal server error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
