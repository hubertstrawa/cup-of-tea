import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ params, locals }) => {
  const { studentId } = params;
  const user = locals.user;
  const supabase = locals.supabase;

  console.log('Student Teachers API - studentId:', studentId, 'user:', user);

  // Check if user is authenticated and is the student
  if (!user || user.id !== studentId) {
    console.log('Student Teachers API - Unauthorized:', { user: user?.id, studentId, role: user?.role });
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Get teachers assigned to this student with their stats
    const { data: teacherStudents, error: teacherStudentsError } = await supabase
      .from("teacher_students")
      .select(`
        teacher_id,
        lessons_completed,
        lessons_reserved,
        users!fk_teacher (
          id,
          first_name,
          last_name,
          profile_created_at
        )
      `)
      .eq("student_id", studentId);

    if (teacherStudentsError) {
      console.error("Error fetching student teachers:", teacherStudentsError);
      return new Response(JSON.stringify({ error: "Failed to fetch teachers" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get email addresses and teacher info
    const teacherIds = teacherStudents?.map(ts => ts.teacher_id) || [];
    
    // Fetch emails
    const emailPromises = teacherIds.map(async (teacherId) => {
      const { data: emailData } = await supabase.rpc('get_user_email', { user_id: teacherId });
      return { id: teacherId, email: emailData || '' };
    });

    // Fetch teacher-specific info
    const { data: teachersInfo, error: teachersInfoError } = await supabase
      .from("teachers")
      .select(`
        teacher_id,
        bio,
        description,
        lessons_completed
      `)
      .in("teacher_id", teacherIds);

    if (teachersInfoError) {
      console.error("Error fetching teachers info:", teachersInfoError);
    }

    const emailResults = await Promise.all(emailPromises);
    const emailMap = emailResults.reduce((acc, { id, email }) => {
      acc[id] = email;
      return acc;
    }, {} as Record<string, string>);

    const teachersInfoMap = (teachersInfo || []).reduce((acc, teacher) => {
      acc[teacher.teacher_id] = teacher;
      return acc;
    }, {} as Record<string, any>);

    // Format the response
    const teachers = teacherStudents?.map(ts => {
      const teacherInfo = teachersInfoMap[ts.teacher_id];
      return {
        id: ts.teacher_id,
        firstName: ts.users?.first_name || '',
        lastName: ts.users?.last_name || '',
        email: emailMap[ts.teacher_id] || '',
        bio: teacherInfo?.bio || '',
        description: teacherInfo?.description || '',
        lessonsCompleted: ts.lessons_completed,
        lessonsReserved: ts.lessons_reserved,
        totalLessonsCompleted: teacherInfo?.lessons_completed || 0,
        profileCreatedAt: ts.users?.profile_created_at || '',
      };
    }) || [];

    return new Response(JSON.stringify({ teachers }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in student teachers API:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
