import type { APIRoute } from "astro";

export const DELETE: APIRoute = async ({ params, locals }) => {
  const { teacherId, studentId } = params;
  const user = locals.user;
  const supabase = locals.supabase;

  // Check if user is authenticated and is the teacher
  if (!user || user.id !== teacherId || user.role !== "tutor") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!studentId) {
    return new Response(JSON.stringify({ error: "Student ID is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Remove student from teacher_students table
    const { error: deleteError } = await supabase
      .from("teacher_students")
      .delete()
      .eq("teacher_id", teacherId)
      .eq("student_id", studentId);

    if (deleteError) {
      console.error("Error removing student:", deleteError);
      return new Response(JSON.stringify({ error: "Failed to remove student" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in remove student API:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
