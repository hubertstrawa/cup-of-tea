import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ params, locals }) => {
  const { teacherId } = params;
  const user = locals.user;
  const supabase = locals.supabase;

  console.log('Students API - teacherId:', teacherId, 'user:', user);

  // Check if user is authenticated and is the teacher or admin
  if (!user || (user.id !== teacherId )) {
    console.log('Students API - Unauthorized:', { user: user?.id, teacherId, role: user?.role });
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
    // Get students assigned to this teacher with their stats
    const { data: teacherStudents, error: teacherStudentsError } = await supabase
      .from("teacher_students")
      .select(`
        student_id,
        lessons_completed,
        lessons_reserved,
        users!fk_student (
          id,
          first_name,
          last_name,
          profile_created_at
        )
      `)
      .eq("teacher_id", teacherId);

    if (teacherStudentsError) {
      console.error("Error fetching teacher students:", teacherStudentsError);
      return new Response(JSON.stringify({ error: "Failed to fetch students" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get email addresses for students (from auth.users)
    const studentIds = teacherStudents?.map(ts => ts.student_id) || [];
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
    const students = teacherStudents?.map(ts => ({
      id: ts.student_id,
      firstName: ts.users?.first_name || '',
      lastName: ts.users?.last_name || '',
      email: emailMap[ts.student_id] || '',
      lessonsCompleted: ts.lessons_completed,
      lessonsReserved: ts.lessons_reserved,
      profileCreatedAt: ts.users?.profile_created_at || '',
    })) || [];

    return new Response(JSON.stringify({ students }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in students API:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const DELETE: APIRoute = async ({ params, url, locals }) => {
  const { teacherId } = params;
  const user = locals.user;
  const supabase = locals.supabase;
  const studentId = url.pathname.split('/').pop();

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
