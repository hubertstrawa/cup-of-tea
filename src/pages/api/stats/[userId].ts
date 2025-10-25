import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ params, locals }) => {
  const { userId } = params;
  const user = locals.user;
  const supabase = locals.supabase;

  // Check if user is authenticated and is accessing their own stats
  if (!user || user.id !== userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!userId) {
    return new Response(JSON.stringify({ error: "User ID is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    if (user.role === "tutor") {
      // Get teacher statistics
      const { data: teacherStudents, error: studentsError } = await supabase
        .from("teacher_students")
        .select("student_id")
        .eq("teacher_id", userId);

      if (studentsError) {
        console.error("Error fetching teacher students:", studentsError);
        return new Response(JSON.stringify({ error: "Failed to fetch students" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }

      const activeStudents = teacherStudents?.length || 0;

      // Get current month lessons
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

      const { data: monthlyLessons, error: monthlyError } = await supabase
        .from("lessons")
        .select("id")
        .eq("teacher_id", userId)
        .eq("status", "completed")
        .gte("scheduled_at", startOfMonth)
        .lte("scheduled_at", endOfMonth);

      if (monthlyError) {
        console.error("Error fetching monthly lessons:", monthlyError);
        return new Response(JSON.stringify({ error: "Failed to fetch monthly lessons" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }

      const lessonsThisMonth = monthlyLessons?.length || 0;

      // Get planned lessons (future lessons with status planned)
      const { data: plannedLessons, error: plannedError } = await supabase
        .from("lessons")
        .select("id")
        .eq("teacher_id", userId)
        .eq("status", "planned")
        .gt("scheduled_at", now.toISOString());

      if (plannedError) {
        console.error("Error fetching planned lessons:", plannedError);
        return new Response(JSON.stringify({ error: "Failed to fetch planned lessons" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }

      const plannedLessonsCount = plannedLessons?.length || 0;

      return new Response(JSON.stringify({
        activeStudents,
        lessonsThisMonth,
        plannedLessons: plannedLessonsCount,
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });

    } else {
      // Get student statistics
      // Completed lessons
      const { data: completedLessons, error: completedError } = await supabase
        .from("lessons")
        .select("id, duration_minutes")
        .eq("student_id", userId)
        .eq("status", "completed");

      if (completedError) {
        console.error("Error fetching completed lessons:", completedError);
        return new Response(JSON.stringify({ error: "Failed to fetch completed lessons" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }

      const lessonsCompleted = completedLessons?.length || 0;
      const totalHours = completedLessons?.reduce((sum, lesson) => sum + (lesson.duration_minutes || 0), 0) || 0;

      // Planned lessons (future lessons with status planned)
      const { data: plannedLessons, error: plannedError } = await supabase
        .from("lessons")
        .select("id")
        .eq("student_id", userId)
        .eq("status", "planned")
        .gt("scheduled_at", new Date().toISOString());

      if (plannedError) {
        console.error("Error fetching planned lessons:", plannedError);
        return new Response(JSON.stringify({ error: "Failed to fetch planned lessons" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }

      const lessonsPlanned = plannedLessons?.length || 0;

      return new Response(JSON.stringify({
        lessonsCompleted,
        lessonsPlanned,
        totalHours: Math.round(totalHours / 60), // Convert minutes to hours
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

  } catch (error) {
    console.error("Error in stats API:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
