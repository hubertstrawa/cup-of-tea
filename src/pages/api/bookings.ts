import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../db/supabase.client.ts";
import { z } from "zod";

export const prerender = false;

const BookingSchema = z.object({
  dateId: z.string().uuid("Invalid date ID"),
  teacherId: z.string().uuid("Invalid teacher ID"),
  notes: z.string().optional(),
  isFirstLesson: z.boolean(),
  languageLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
});

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // Sprawdź czy użytkownik jest zalogowany
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Authentication required",
        }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Walidacja danych wejściowych
    const body = await request.json();
    const validationResult = BookingSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid input data",
          details: validationResult.error.errors,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { dateId, teacherId, notes, isFirstLesson, languageLevel } = validationResult.data;

    // Sprawdź czy termin jest nadal dostępny
    const { data: dateSlot, error: dateError } = await supabase
      .from("dates")
      .select("*")
      .eq("id", dateId)
      .eq("status", "available")
      .eq("teacher_id", teacherId)
      .single();

    if (dateError || !dateSlot) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Selected time slot is no longer available",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Rozpocznij transakcję
    const { data: reservation, error: reservationError } = await supabase
      .from("reservations")
      .insert({
        student_id: user.id,
        term_id: dateId,
        notes: notes || null,
        status: "confirmed",
        reserved_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (reservationError) {
      console.error("Error creating reservation:", reservationError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to create reservation",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Zaktualizuj status terminu na "booked"
    const { error: updateDateError } = await supabase
      .from("dates")
      .update({ 
        status: "booked",
        student_id: user.id
      })
      .eq("id", dateId);

    if (updateDateError) {
      console.error("Error updating date status:", updateDateError);
      // Rollback - usuń rezerwację
      await supabase.from("reservations").delete().eq("id", reservation.id);
      
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to update time slot",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Jeśli to pierwsza lekcja, utwórz lub zaktualizuj relację teacher-student
    if (isFirstLesson) {
      const { error: relationError } = await supabase
        .from("teacher_students")
        .upsert({
          teacher_id: teacherId,
          student_id: user.id,
          lessons_completed: 0,
          lessons_reserved: 1,
        }, {
          onConflict: "teacher_id,student_id"
        });

      if (relationError) {
        console.error("Error creating/updating teacher-student relation:", relationError);
        // Nie przerywamy procesu, ale logujemy błąd
      }

      // Zapisz dodatkowe informacje o pierwszej lekcji
      if (languageLevel) {
        const { error: metadataError } = await supabase
          .from("reservations")
          .update({
            notes: notes ? `${notes}\n\nPoziom języka: ${languageLevel}` : `Poziom języka: ${languageLevel}`
          })
          .eq("id", reservation.id);

        if (metadataError) {
          console.error("Error updating reservation metadata:", metadataError);
        }
      }
    } else {
      // Zaktualizuj liczbę zarezerwowanych lekcji
      const { error: updateRelationError } = await supabase
        .rpc('increment_lessons_reserved', {
          p_teacher_id: teacherId,
          p_student_id: user.id
        });

      if (updateRelationError) {
        console.error("Error updating lessons reserved count:", updateRelationError);
      }
    }

    // Utwórz lekcję
    const { data: lesson, error: lessonError } = await supabase
      .from("lessons")
      .insert({
        reservation_id: reservation.id,
        teacher_id: teacherId,
        student_id: user.id,
        scheduled_at: dateSlot.start_time,
        duration_minutes: Math.round((new Date(dateSlot.end_time).getTime() - new Date(dateSlot.start_time).getTime()) / (1000 * 60)),
        status: "planned",
      })
      .select()
      .single();

    if (lessonError) {
      console.error("Error creating lesson:", lessonError);
      // Nie przerywamy procesu, ale logujemy błąd
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Reservation created successfully",
        data: {
          reservationId: reservation.id,
          lessonId: lesson?.id,
        },
      }),
      {
        status: 201,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Booking API error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal server error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
