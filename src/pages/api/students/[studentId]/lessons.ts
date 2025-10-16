import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ params, locals }) => {
  const { studentId } = params;
  const user = locals.user;
  const supabase = locals.supabase;

  console.log('Student Lessons API - studentId:', studentId, 'user:', user);

  // Check if user is authenticated and is the student or admin
  if (!user || (user.id !== studentId && user.role !== "admin")) {
    console.log('Student Lessons API - Unauthorized:', { user: user?.id, studentId, role: user?.role });
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Get lessons for this student with teacher information
    const { data: lessons, error: lessonsError } = await supabase
      .from("lessons")
      .select(`
        id,
        scheduled_at,
        duration_minutes,
        status,
        reservation_id,
        teacher_id,
        users!lessons_teacher_id_fkey (
          id,
          first_name,
          last_name
        )
      `)
      .eq("student_id", studentId)
      .order("scheduled_at", { ascending: false });

    if (lessonsError) {
      console.error("Error fetching student lessons:", lessonsError);
      return new Response(JSON.stringify({ error: "Failed to fetch lessons" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get email addresses for teachers
    const teacherIds = [...new Set(lessons?.map(lesson => lesson.teacher_id) || [])];
    const emailPromises = teacherIds.map(async (teacherId) => {
      const { data: emailData } = await supabase.rpc('get_user_email', { user_id: teacherId });
      return { id: teacherId, email: emailData || '' };
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
      teacher: {
        id: lesson.teacher_id,
        firstName: lesson.users?.first_name || '',
        lastName: lesson.users?.last_name || '',
        email: emailMap[lesson.teacher_id] || '',
      }
    })) || [];

    // Separate upcoming and completed lessons
    const now = new Date().toISOString();
    const upcomingLessons = formattedLessons.filter(lesson => 
      lesson.scheduledAt > now && lesson.status !== 'cancelled'
    );
    const completedLessons = formattedLessons.filter(lesson => 
      lesson.scheduledAt <= now || lesson.status === 'completed'
    );

    return new Response(JSON.stringify({ 
      upcomingLessons, 
      completedLessons,
      totalLessons: formattedLessons.length 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in student lessons API:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
