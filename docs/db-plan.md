# Schemat bazy danych dla Cup of Tea

## Tabele i kolumny

### 1. users
This table stores additional user profile information and extends the Supabase Auth's `auth.users` table.
- **id**: UUID, PRIMARY KEY, references `auth.users(id)` on delete cascade
- **first_name**: VARCHAR(255) NOT NULL
- **last_name**: VARCHAR(255) NOT NULL
- **role**: user_role enum, NOT NULL, CHECK (role IN ('lektor', 'uczeń'))
- **profile_created_at**: TIMESTAMPTZ, NOT NULL, DEFAULT NOW()
- **last_login_at**: TIMESTAMPTZ
- **student_id**: UUID, NOT NULL, REFERENCES `users(id)`
- **metadata**: JSONB, DEFAULT '{}'::jsonb

_Note: The Supabase Auth system manages core fields such as email and encrypted passwords._

### 2. dates
- **id**: UUID, PRIMARY KEY
- **start_time**: TIMESTAMPTZ, NOT NULL
- **end_time**: TIMESTAMPTZ, NOT NULL
- **status**: date_status enum, NOT NULL, default 'dostępny', CHECK (status IN ('dostępny', 'zarezerwowany', 'anulowany'))
- **teacher_id**: UUID, NOT NULL, REFERENCES `users(id)`
- **additional_info**: JSONB, DEFAULT '{}'::jsonb  
Additional constraint: `end_time > start_time`

### 3. reservations
- **id**: UUID, PRIMARY KEY
- **term_id**: UUID, NOT NULL, REFERENCES `dates(id)` ON DELETE CASCADE, UNIQUE (one reservation per time slot)
- **student_id**: UUID, NOT NULL, REFERENCES `users(id)`
- **reserved_at**: TIMESTAMPTZ, NOT NULL, DEFAULT NOW()
- **status**: reservation_status enum, NOT NULL, default 'potwierdzona', CHECK (status IN ('potwierdzona', 'anulowana'))
- **notes**: TEXT

### 4. notifications
- **id**: UUID, PRIMARY KEY
- **user_id**: UUID, NOT NULL, REFERENCES `users(id)`
- **content**: TEXT, NOT NULL
- **is_read**: BOOLEAN, NOT NULL, DEFAULT false
- **created_at**: TIMESTAMPTZ, NOT NULL, DEFAULT NOW()

### 5. lessons
- **id**: UUID, PRIMARY KEY
- **reservation_id**: UUID, NOT NULL, REFERENCES `reservations(id)` ON DELETE CASCADE
- **teacher_id**: UUID, NOT NULL, REFERENCES `users(id)`
- **student_id**: UUID, NOT NULL, REFERENCES `users(id)`
- **scheduled_at**: TIMESTAMPTZ, NOT NULL
- **duration_minutes**: INTEGER, NOT NULL, CHECK (duration_minutes > 0)
- **status**: lesson_status enum, NOT NULL, default 'zaplanowana', CHECK (status IN ('zaplanowana', 'zakończona', 'anulowana'))

### 6. error_logs
- **id**: BIGSERIAL, PRIMARY KEY
- **error_code**: VARCHAR(100)
- **occurred_at**: TIMESTAMPTZ, NOT NULL, DEFAULT NOW()
- **details**: TEXT
- **module**: VARCHAR(100)
- **function_name**: VARCHAR(100)

## Relacje między tabelami

- Tabela `dates` odnosi się do jednego lektora (kolumna `teacher_id`), który jest zdefiniowany w tabeli `users`.
- W tabeli `reservations`:
  - `term_id` nawiązuje do terminu z tabeli `dates`
  - `student_id` odnosi się do użytkownika z tabeli `users`
- Tabela `lessons` przechowuje szczegóły odbytych lub zaplanowanych lekcji, powiązanych zarówno z rezerwacjami, jak i identyfikatorami lektora oraz ucznia w tabeli `users`.
- Tabela `notifications` zawiera powiadomienia powiązane z użytkownikami.
- Tabela `error_logs` służy do rejestrowania błędów systemowych.

## Indeksy

- **users**: indeks na kolumnie `email` (zarządzanym przez Supabase Auth).
- **dates**: indeks na kolumnie `start_time` dla szybszych wyszukiwań wg daty/godziny.
- Indeksy na kluczach obcych w tabelach `dates`, `reservations`, `notifications` oraz `lessons`.

## Zasady PostgreSQL oraz RLS

- **Row-Level Security (RLS)** jest włączone dla wszystkich tabel (wyłączone na czas developmentu)
- Dla tabeli `dates`: lektorzy mogą widzieć i modyfikować jedynie swoje terminy (porównanie `teacher_id` z identyfikatorem użytkownika w sesji).
- Dla tabel `reservations` i `lessons`: uczniowie mają możliwość modyfikacji jedynie swoich rezerwacji i lekcji, podczas gdy lektorzy dostęp do rezerwacji dotyczących ich terminów.
- W tabeli `users` wdrożono integrację z `auth.users` – polityki RLS korzystają z funkcji `auth.uid()`.

## Dodatkowe uwagi

- Schemat został zaprojektowany z myślą o przyszłym partycjonowaniu, szczególnie w tabelach zawierających duże ilości danych (np. `error_logs`).
- Użycie typu `JSONB` w kolumnach `metadata` (w `users`) oraz `additional_info` (w `dates`) umożliwia elastyczne przechowywanie dodatkowych danych bez konieczności modyfikacji schematu.
- Wszystkie ograniczenia, takie jak NOT NULL, UNIQUE, CHECK oraz klucze obce, zostały zastosowane w celu zapewnienia spójności danych.
