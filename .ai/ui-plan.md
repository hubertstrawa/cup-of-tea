# Architektura UI dla Cup of Tea

## 1. Przegląd struktury UI

Interfejs użytkownika dla Cup of Tea jest zaprojektowany z myślą o jasnym podziale widoków dla lektorów i uczniów. Struktura UI uwzględnia oddzielne ścieżki dla logowania, rejestracji, publicznego profilu lektora oraz dedykowanych dashboardów, gdzie każdy widok integruje kluczowe funkcjonalności systemu. Podejście modularne oraz wykorzystanie komponentów z Shadcn/ui i Tailwind CSS zapewnia spójność wizualną, responsywność oraz standardy dostępności.

## 2. Lista widoków

### Logowanie
- **Nazwa widoku:** Logowanie
- **Ścieżka widoku:** /login
- **Główny cel:** Umożliwienie użytkownikowi zalogowania się do systemu.
- **Kluczowe informacje do wyświetlenia:** Formularz z polami: email, hasło lub przyciski logowanie gmail/facebook, komunikaty błędów; opcjonalny link do rejestracji.
- **Kluczowe komponenty widoku:** Formularz logowania, przyciski, walidacja inline (z użyciem zod), toast messages.
- **UX, dostępność i względy bezpieczeństwa:** Zrozumiały przekaz błędów, odpowiednie aria-labels, zabezpieczenia przed nieautoryzowanym dostępem.

### Rejestracja
- **Nazwa widoku:** Rejestracja
- **Ścieżka widoku:** /register
- **Główny cel:** Pozwolić nowym użytkownikom (głównie lektorom) utworzyć konto.
- **Kluczowe informacje do wyświetlenia:** Formularz rejestracyjny, walidacja pól, komunikaty o sukcesie lub błędach.
- **Kluczowe komponenty widoku:** Formularz rejestracji, walidatory, informacje o wymaganiach haseł, toast messages.
- **UX, dostępność i względy bezpieczeństwa:** Jasne komunikaty walidacyjne, zabezpieczenia przed spamem i błędami, dostępność dla urządzeń mobilnych.

### Publiczny profil lektora
- **Nazwa widoku:** Profil lektora (widok publiczny)
- **Ścieżka widoku:** /profile/teacher/:id
- **Główny cel:** Prezentacja informacji o lektorze wraz z listą dostępnych terminów do rezerwacji.
- **Kluczowe informacje do wyświetlenia:** Dane lektora, opis, zdjęcie profilowe, informacje o rezerwacjach.
- **Kluczowe komponenty widoku:** Komponent profilu, lista terminów do rezerwacji (np. availability-checker.tsx) zaczynając od "Najblizszy wolny termin".
- **UX, dostępność i względy bezpieczeństwa:** Przejrzystość, responsywność, dostępność informacji dla uczniów bez konieczności logowania.

### Dashboard lektora
- **Nazwa widoku:** Panel lektora
- **Ścieżka widoku:** /dashboard/teacher
- **Główny cel:** Zarządzanie kalendarzem (dodawanie, edycja, usuwanie terminów) oraz przegląd statystyk i rezerwacji.
- **Kluczowe informacje do wyświetlenia:** Kalendarz z interaktywnymi opcjami zarządzania (np. CalendarWrapper.tsx), lista rezerwacji, statystyki (odbyte lekcje, zaplanowane terminy), powiadomienia.
- **Kluczowe komponenty widoku:** CalendarWrapper.tsx, formularze dodawania/edycji/usuwania terminów, dashboard statystyk, system powiadomień typu toast.
- **UX, dostępność i względy bezpieczeństwa:** Łatwa nawigacja po kalendarzu, szybka informacja zwrotna, integracja z React Context dla zarządzania stanem, ochrona danych i autoryzacja akcji.

### Dashboard ucznia
- **Nazwa widoku:** Panel ucznia
- **Ścieżka widoku:** /dashboard/student
- **Główny cel:** Umożliwienie uczniowi przeglądania dostępnych terminów oraz dokonywanie rezerwacji.
- **Kluczowe informacje do wyświetlenia:** Lista dostępnych terminów, szczegóły rezerwacji, historia lekcji, powiadomienia.
- **Kluczowe komponenty widoku:** Lista terminów, formularz rezerwacji, system walidacji przed rezerwacją, integracja z React Query do buforowania danych.
- **UX, dostępność i względy bezpieczeństwa:** Intuicyjny interfejs, czytelne komunikaty o stanie rezerwacji, dostępność na urządzeniach mobilnych.

### Widok profilu użytkownika
- **Nazwa widoku:** Profil użytkownika
- **Ścieżka widoku:** /dashboard/profile
- **Główny cel:** Prezentacja statystyk użytkownika (lektora lub ucznia) oraz zarządzanie ustawieniami profilu.
- **Kluczowe informacje do wyświetlenia:** Statystyki (odbyte lekcje, rezerwacje), dane osobowe, opcje zarządzania kontem, powiadomienia.
- **Kluczowe komponenty widoku:** Karty statystyk, formularze edycji profilu, lista powiadomień, komponenty wizualizujące dane (np. wykresy).
- **UX, dostępność i względy bezpieczeństwa:** Priorytet dla zabezpieczenia danych, responsywność, wysoka czytelność informacji.

## 3. Mapa podróży użytkownika

1. Użytkownik wchodzi na stronę główną i widzi opcje logowania oraz rejestracji.
2. Wybiera logowanie lub rejestrację w zależności od statusu (nowy użytkownik vs. już zarejestrowany).
3. Po udanej autoryzacji system przekierowuje:
   - Lektora do panelu lektora, gdzie może zarządzać kalendarzem, rezerwacjami i statystykami.
   - Ucznia do panelu ucznia, umożliwiającego rezerwację dostępnych terminów oraz przegląd historii lekcji.
4. Użytkownik może odwiedzić publiczny profil lektora aby zapoznać się z ofertą i dostępnymi terminami przed rejestracją.
5. Użytkownik może przejść do profilu, gdzie ma wgląd we własne dane i ustawienia.
6. System informuje użytkownika poprzez powiadomienia (toast messages) o sukcesach, błędach oraz ważnych aktualizacjach.

## 4. Układ i struktura nawigacji

- Główne menu dostępne w nagłówku, zawierające linki do: Strona główna, Logowanie, Rejestracja, Profil/Publiczny profil, Dashboard (dynamicznie w zależności od roli).
- Nawigacja boczna w dashboardach umożliwia szybki dostęp do sekcji: Kalendarza, Rezerwacji, Statystyk, Powiadomień.
- Ścieżki routingu zarządzane przez system routingowy Astro z wykorzystaniem modułu klienta (ClientRouter) dla płynnych przejść.
- Linki i przyciski posiadają atrybuty ARIA oraz są zoptymalizowane pod kątem responsywności i dostępności.

## 5. Kluczowe komponenty

- **Formularze autoryzacji:** Zarządzanie logowaniem i rejestracją z walidacją inline oraz mechanizmami bezpieczeństwa.
- **CalendarWrapper.tsx:** Centralny komponent do zarządzania wizualizacją i interakcją z kalendarzem w widokach lektora oraz ucznia.
- **Dashboard statystyk:** Komponenty prezentujące dane statystyczne, zintegrowane z React Query i React Context dla dynamicznej aktualizacji.
- **System powiadomień:** Toast messages i alert dialogi, które informują użytkowników o statusie operacji.
- **Komponenty list i formularzy:** Ułatwiające rezerwację terminów, edycję danych oraz realizację interakcji użytkownika.
- **Nawigacja:** Menu główne i boczne, zbudowane z komponentów nawigacyjnych uwzględniających responsywność i dostępność.

