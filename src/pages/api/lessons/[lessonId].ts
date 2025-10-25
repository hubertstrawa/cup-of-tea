import type { APIRoute } from "astro";

export const PATCH: APIRoute = async ({ params, request, locals }) => {
  const { lessonId } = params;
  const user = locals.user;
  const supabase = locals.supabase;

  if (!user || user.role !== "tutor") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!lessonId) {
    return new Response(JSON.stringify({ error: "Lesson is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await request.json();
    const { status, scheduledAt, durationMinutes } = body;

    // Verify that the lesson belongs to this teacher and get current data
    const { data: lesson, error: lessonError } = await supabase
      .from("lessons")
      .select("teacher_id, student_id, status")
      .eq("id", lessonId)
      .single();

    if (lessonError || !lesson) {
      return new Response(JSON.stringify({ error: "Lesson not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (lesson.teacher_id !== user.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Store old status for synchronization
    const oldStatus = lesson.status;

    // Update the lesson
    const updateData: any = {};
    if (status) updateData.status = status;
    if (scheduledAt) updateData.scheduled_at = scheduledAt;
    if (durationMinutes) updateData.duration_minutes = durationMinutes;

    const { error: updateError } = await supabase
      .from("lessons")
      .update(updateData)
      .eq("id", lessonId);

    if (updateError) {
      console.error("Error updating lesson:", updateError);
      return new Response(JSON.stringify({ error: "Failed to update lesson" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Synchronize teacher_students table if status changed
    if (status && status !== oldStatus) {
      const { error: syncError } = await supabase.rpc(
        'sync_teacher_students_on_lesson_status_change',
        {
          p_teacher_id: lesson.teacher_id,
          p_student_id: lesson.student_id,
          p_old_status: oldStatus,
          p_new_status: status
        }
      );

      if (syncError) {
        console.error("Error synchronizing teacher_students:", syncError);
        // Log the error but don't fail the request - lesson was updated successfully
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in lesson update API:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
