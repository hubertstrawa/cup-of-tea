# Dokument wymagań produktu (PRD) - Cup of Tea

## 1. Przegląd produktu

Cup of Tea to aplikacja MVP zaprojektowana z myślą o lektorach i uczniach języków obcych, która upraszcza zarządzanie kalendarzem lekcji online. Aplikacja umożliwia lektorom łatwe dodawanie, edycję oraz usuwanie terminów, a także generowanie linku rejestracyjnego, za pomocą którego uczniowie mogą się zapisać. Użytkownicy korzystają z systemu autentykacji Supabase Auth, co zapewnia bezpieczny proces rejestracji i logowania z potwierdzeniem adresu email. Produkt został zaprojektowany z myślą o pełnej responsywności, aby działał na różnych urządzeniach, a także o intuicyjnym interfejsie ułatwiającym korzystanie z funkcji rezerwacji oraz zarządzania harmonogramem.

## 2. Problem użytkownika

Lektorzy języków obcych tracą czas na ręczne zarządzanie swoim kalendarzem i rezerwacjami. Proces ustalania dostępności, komunikacji z uczniami oraz koordynacji rezerwacji prowadzi do marnowania czasu i naraża na błędy przy planowaniu lekcji. Uczniowie natomiast mają trudności ze znalezieniem dostępnych terminów i zarezerwowaniem lekcji w prosty, przejrzysty sposób. Aplikacja ma za zadanie wyeliminować te problemy poprzez automatyzację rezerwacji i ułatwienie komunikacji między lektorem a uczniem.

## 3. Wymagania funkcjonalne

- Rejestracja i logowanie:
  - Lektor samodzielnie rejestruje się i loguje do aplikacji.
  - Uczeń rejestruje się poprzez unikalny link udostępniony przez lektora.
  - Uwierzytelnianie odbywa się z wykorzystaniem Supabase Auth oraz potwierdzenia adresu email.
- Zarządzanie kalendarzem przez lektora:
  - Dodawanie, edycja oraz usuwanie terminów lekcji.
  - Mechanizm automatycznego blokowania rezerwacji w przypadku konfliktów terminów.
- Rezerwacje terminów przez uczniów:
  - Uczniowie mają dostęp do wizualizacji dostępnych terminów (lista godzin z graficznym oznaczeniem dostępności, np. przekreślone godziny – niedostępne).
  - System umożliwia zarezerwowanie tylko maksymalnie dwóch darmowych lekcji przez ucznia (w przyszłości dojdzie obsługa subskrypcji np. przez Stripe).
- Powiadomienia i przypomnienia:
  - Wysyłanie powiadomień email z potwierdzeniami rezerwacji oraz przypomnieniami o nadchodzących lekcjach.
- Responsywność i wydajność:
  - Aplikacja musi być w pełni responsywna, zoptymalizowana do działania na urządzeniach mobilnych, tabletach oraz desktopach.
  - Przeprowadzane są testy użyteczności oraz obciążeniowe, aby zapewnić stabilność w krytycznych momentach rezerwacji.

## 4. Granice produktu

- Integration z zewnętrznymi kalendarzami (np. Google Calendar) nie wchodzi w zakres MVP.
- Funkcje społecznościowe, takie jak zapraszanie znajomych, czat oraz forum dyskusyjne, nie są częścią MVP.
- Dodatkowe funkcjonalności, takie jak daily quests, quizy, analizy tekstów oraz elementy gamifikacji, zostaną wyłączone na tym etapie rozwoju.
- Proces weryfikacji tożsamości ogranicza się do potwierdzenia adresu email, bez wdrażania dodatkowych zabezpieczeń, które mogą być rozbudowywane w przyszłości.

## 5. Historyjki użytkowników
- US-001
  - Tytuł: Rejestracja i logowanie lektora
  - Opis: Jako lektor chcę móc zarejestrować się i zalogować do systemu, aby uzyskać dostęp do zarządzania swoim kalendarzem lekcji.
  - Kryteria akceptacji:
    - Lektor może utworzyć konto przy użyciu formularza rejestracyjnego.
    - System wysyła potwierdzenie rejestracji na wskazany adres email.
    - Po pomyślnym logowaniu lektor widzi pulpit zarządzania kalendarzem.
- US-002
  - Tytuł: Rejestracja ucznia poprzez link
  - Opis: Jako uczeń chcę zarejestrować się za pomocą specjalnego linku udostępnionego przez lektora, aby uzyskać dostęp do harmonogramu i rezerwacji lekcji.
  - Kryteria akceptacji:
    - Uczeń inicjuje rejestrację poprzez otrzymany unikalny link.
    - Po rejestracji uczeń otrzymuje potwierdzenie email oraz możliwość uzupełnienia profilu.
    - System weryfikuje poprawność linku przed udostępnieniem opcji rezerwacji.
- US-003
  - Tytuł: Zarządzanie kalendarzem przez lektora
  - Opis: Jako lektor chcę mieć możliwość dodawania, edycji oraz usuwania terminów w moim kalendarzu, aby skutecznie zarządzać moją dostępnością.
  - Kryteria akceptacji:
    - Lektor może dodawać nowe terminy z określeniem daty, godziny i dostępności.
    - Lektor może edytować istniejące terminy, zmieniając daty lub godziny.
    - Lektor może usuwać terminy, co powoduje ich natychmiastowe usunięcie z widoku uczniów.
- US-004
  - Tytuł: Rezerwacja terminu przez ucznia
  - Opis: Jako uczeń chcę przeglądać dostępne terminy i rezerwować lekcje, aby łatwo zapisać się na wybraną sesję.
  - Kryteria akceptacji:
    - Uczeń widzi listę dostępnych terminów z czytelnym oznaczeniem dostępności (dostępne vs niedostępne).
    - Po kliknięciu na dostępny termin użytkownik przechodzi przez proces rezerwacji.
    - System uniemożliwia rezerwację terminu, który został już zarezerwowany lub jest nieaktualny.
    - Uczeń może zarezerwować maksymalnie dwa darmowe terminy.
- US-005
  - Tytuł: Powiadomienia o rezerwacjach i przypomnienia
  - Opis: Jako użytkownik chcę otrzymywać powiadomienia o potwierdzeniach rezerwacji i przypomnienia o nadchodzących lekcjach, aby być na bieżąco w kwestiach terminów.
  - Kryteria akceptacji:
    - Po dokonaniu rezerwacji użytkownik otrzymuje email z potwierdzeniem terminu.
    - System wysyła przypomnienia o lekcjach z odpowiednim wyprzedzeniem.
- US-006
  - Tytuł: Bezpieczny dostęp i uwierzytelnianie
  - Opis: Jako użytkownik chcę mieć pewność, że dostęp do mojego konta oraz proces rejestracji i logowania są bezpieczne, dzięki integracji z Supabase Auth oraz weryfikacji adresu email.
  - Kryteria akceptacji:
    - System wymusza potwierdzenie adresu email przy rejestracji.
    - Supabase Auth obsługuje proces uwierzytelniania użytkowników.
    - Dane użytkowników są przechowywane zgodnie ze standardami bezpieczeństwa.

## 6. Metryki sukcesu
- Minimum 90% lektorów korzysta z aplikacji do aktualizacji kalendarza przynajmniej kilka razy w miesiącu.
- Minimum 70% uczniów dokonuje rezerwacji co najmniej jednej lekcji miesięcznie.
- Wskaźnik udanych rezerwacji oraz liczba wykorzystanych darmowych lekcji są monitorowane w celu oceny efektywności działania systemu.
- Pozytywne opinie użytkowników dotyczące intuicyjności interfejsu oraz szybkości działania aplikacji.
- Stabilność aplikacji potwierdzona testami obciążeniowymi, zwłaszcza w momentach intensywnego korzystania z systemu rezerwacji