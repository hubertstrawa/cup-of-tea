# API Endpoint Implementation Plan: /api/dates

## 1. Przegląd punktu końcowego
Endpoint `/api/dates` służy do zarządzania terminami dostępności nauczycieli. Umożliwia:
- Pobieranie listy dostępnych terminów z opcjonalnymi filtrami (GET)
- Tworzenie nowego terminu (POST)
- Aktualizację istniejącego terminu (PUT)
- Usunięcie terminu (DELETE)  
Endpoint korzysta z walidacji danych, autoryzacji oraz logowania błędów, a także integruje się z bazą danych Supabase.

## 2. Szczegóły żądania
### GET /api/dates
- **Metoda HTTP:** GET
- **Struktura URL:** `/api/dates`
- **Parametry (query):**
  - Wymagane: `page`, `limit`
  - Opcjonalne: `teacherId`, `date`, `status`
- **Response:** Lista terminów z paginacją.
- **Kody statusu:** 200 (sukces), 400 (błędne zapytanie)

### POST /api/dates
- **Metoda HTTP:** POST
- **Struktura URL:** `/api/dates`
- **Request Body:**  
  ```json
  {
    "start_time": "timestamp",
    "end_time": "timestamp",
    "status": "dostępny",
    "additional_info": {}
  }
  ```
- **Walidacja:** `end_time` musi być większe niż `start_time`
- **Response:**  
  ```json
  { "message": "Date created successfully", "id": "UUID" }
  ```
- **Kody statusu:** 201 (utworzono), 400 (błędne dane), 409 (konflikt, np. kolizja terminów)

### PUT /api/dates/{id}
- **Metoda HTTP:** PUT
- **Struktura URL:** `/api/dates/{id}`
- **Request Body:** Pola do aktualizacji, np. `start_time`, `end_time`, `status`
- **Autoryzacja:** Tylko nauczyciel, który utworzył termin, może dokonać aktualizacji.
- **Response:**  
  ```json
  { "message": "Date updated successfully" }
  ```
- **Kody statusu:** 200 (sukces), 400 (błędne dane), 403 (brak uprawnień), 404 (nie znaleziono)

### DELETE /api/dates/{id}
- **Metoda HTTP:** DELETE
- **Struktura URL:** `/api/dates/{id}`
- **Autoryzacja:** Usuwanie możliwe tylko przez właściciela terminu.
- **Response:**  
  ```json
  { "message": "Date deleted successfully" }
  ```
- **Kody statusu:** 200 (sukces), 403 (brak uprawnień), 404 (nie znaleziono)

## 3. Wykorzystywane typy
- **DTO dla odpowiedzi GET:** `DateListItemDTO` (zawiera pola: `id`, `start_time`, `end_time`, `status`, `teacher_id`)
- **DTO dla paginacji:** `PaginationInfoDTO` oraz `PaginatedResponseDTO<DateListItemDTO>`
- **Command Model dla POST:** `CreateDateCommand` – zawiera: `start_time`, `end_time`, `status`, `additional_info`
- **Command Model dla PUT:** `UpdateDateCommand` – umożliwia aktualizację pól: `start_time`, `end_time`, `status`, `additional_info`

## 4. Przepływ danych
1. Klient wysyła żądanie do endpointu.
2. Warstwa API (np. Astro endpoint) odbiera żądanie i używa walidatora (zalecany: zod) do sprawdzenia poprawności danych.
3. Żądanie przekazywane jest do warstwy serwisowej (np. `datesService`) dedykowanej operacjom na tabeli `dates`.
4. Warstwa serwisowa wykonuje odpowiednie operacje na bazie danych Supabase, korzystając z odpowiednich klientów oraz zapytań SQL.
5. Wynik operacji jest zwracany do kontrolera, który formułuje odpowiedź w formacie JSON, wraz z odpowiednim kodem statusu HTTP.
6. W przypadku błędu, szczegóły są logowane do tabeli `error_logs`.

## 5. Względy bezpieczeństwa
- **Autentykacja i Autoryzacja:** Upewnij się, że użytkownik jest zalogowany. Endpointy POST, PUT i DELETE powinny sprawdzać, czy bieżący użytkownik (nauczyciel) jest właścicielem terminu.
- **Walidacja danych:** Użycie zod do walidacji danych wejściowych. Np. walidacja zakresu czasowego (czy `end_time` > `start_time`).
- **Bezpieczeństwo zapytań do bazy:** Używaj przygotowanych zapytań oraz supabase client z kontekstu żądania.
- **Rate Limiting i logowanie:** Rozważ wdrożenie mechanizmów ograniczenia częstotliwości zapytań oraz szczegółowego logowania błędów.

## 6. Obsługa błędów
- **400 (Bad Request):** Błędne parametry lub niewłaściwy format danych.
- **403 (Forbidden):** Próba modyfikacji lub usunięcia terminu przez użytkownika, który nie jest właścicielem.
- **404 (Not Found):** Termin o podanym `id` nie istnieje.
- **409 (Conflict):** Konflikty, np. próba stworzenia terminu, który koliduje z istniejącym.
- **500 (Internal Server Error):** Błędy nieprzewidziane, logowane w tabeli `error_logs` wraz z informacjami o module i nazwie funkcji.

## 7. Rozważania dotyczące wydajności
- **Indeksowanie:** Wykorzystanie indeksu na kolumnie `start_time` w tabeli `dates` przy operacjach filtrowania.
- **Paginacja:** Użycie paginacji, aby unikać zwracania bardzo dużej liczby rekordów.
- **Optymalizacja zapytań:** Korzystanie z ograniczeń zapytań oraz leniwego ładowania danych, gdy jest to możliwe.
- **Caching:** Rozważanie mechanizmów cache’owania wyników najczęściej wykonywanych zapytań.

## 8. Etapy wdrożenia
1. **Definicja i walidacja danych:**
   - Zdefiniować schemat walidacji wejść dla GET, POST, PUT, DELETE za pomocą zod.
   - Upewnić się, że typy DTO i Command Modele zgadzają się z danymi w bazie.

2. **Implementacja warstwy serwisowej:**
   - Utworzyć lub zaktualizować serwis (np. `src/lib/datesService.ts`) do obsługi operacji na tabeli `dates`.
   - Wydzielić logikę walidacji zakresu czasowego oraz autoryzacji użytkownika.

3. **Implementacja endpointów API:**
   - Utworzyć plik endpointu API (np. `src/pages/api/dates.ts`).
   - Podziel endpoint na obsługę metod GET, POST, PUT i DELETE.
   - Przekierować logikę operacji do warstwy serwisowej.

4. **Obsługa autoryzacji i sesji:**
   - W endpointach PUT oraz DELETE zweryfikować, czy bieżący użytkownik ma prawa do modyfikacji danego terminu.
   - Skorzystać z kontekstu Supabase (np. `context.locals.supabase`) do pobrania danych użytkownika.

5. **Logowanie błędów:**
   - W razie wystąpienia błędów zapisywać szczegóły w tabeli `error_logs` (moduł, funkcja, kod błędu, opis).

6. **Testowanie:**
   - Przygotować zestaw testów jednostkowych i integracyjnych dla wszystkich metod (GET, POST, PUT, DELETE).
   - Sprawdzić, czy walidacja, autoryzacja oraz paginacja działają poprawnie.

7. **Dokumentacja i kod przeglądu:**
   - Uzupełnić dokumentację endpointu oraz plan wdrożenia.
   - Przeprowadzić code review oraz omówić zmiany z zespołem.
