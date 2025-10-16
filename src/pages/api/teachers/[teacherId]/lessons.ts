import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ params, locals }) => {
  const { teacherId } = params;
  const user = locals.user;
  const supabase = locals.supabase;

  console.log('Lessons API - teacherId:', teacherId, 'user:', user);

  // Check if user is authenticated and is the teacher or admin
  if (!user || (user.id !== teacherId)) {
    console.log('Lessons API - Unauthorized:', { user: user?.id, teacherId, role: user?.role });
    return new Response(JSON.stringify({ error: "Unauthorized", debug: { userId: user?.id, teacherId, role: user?.role } }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!teacherId) {
    return new Response(JSON.stringify({ error: "Teacher is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Get lessons for this teacher with student information
    const { data: lessons, error: lessonsError } = await supabase
      .from("lessons")
      .select(`
        id,
        scheduled_at,
        duration_minutes,
        status,
        reservation_id,
        student_id,
        users!lessons_student_id_fkey (
          id,
          first_name,
          last_name
        )
      `)
      .eq("teacher_id", teacherId)
      .order("scheduled_at", { ascending: false });

    if (lessonsError) {
      console.error("Error fetching lessons:", lessonsError);
      return new Response(JSON.stringify({ error: "Failed to fetch lessons" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get email addresses for students
    const studentIds = [...new Set(lessons?.map(lesson => lesson.student_id) || [])];
    const emailPromises = studentIds.map(async (studentId) => {
      const { data: emailData } = await supabase.rpc('get_user_email', { user_id: studentId });
      return { id: studentId, email: emailData || '' };
    });

    const emailResults = await Promise.all(emailPromises);
    const emailMap = emailResults.reduce((acc, { id, email }) => {
      acc[id] = email;
      return acc;
    }, {} as Record<string, string>);

    // Format the response
    const formattedLessons = lessons?.map(lesson => ({
      id: lesson.id,
      scheduledAt: lesson.scheduled_at,
      durationMinutes: lesson.duration_minutes,
      status: lesson.status,
      reservationId: lesson.reservation_id,
      student: {
        id: lesson.student_id,
        firstName: lesson.users?.first_name || '',
        lastName: lesson.users?.last_name || '',
        email: emailMap[lesson.student_id] || '',
      },
    })) || [];

    return new Response(JSON.stringify({ lessons: formattedLessons }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in lessons API:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
