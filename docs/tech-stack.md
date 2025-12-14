Frontend - Astro z React dla komponentów interaktywnych:
- Astro 5 pozwala na tworzenie szybkich, wydajnych stron i aplikacji z minimalną ilością JavaScript
- React 19 zapewni interaktywność tam, gdzie jest potrzebna
- TypeScript 5 dla statycznego typowania kodu i lepszego wsparcia IDE
- Tailwind 4 pozwala na wygodne stylowanie aplikacji
- Shadcn/ui zapewnia bibliotekę dostępnych komponentów React, na których oprzemy UI

Backend - Supabase jako kompleksowe rozwiązanie backendowe:
- Zapewnia bazę danych PostgreSQL
- Zapewnia SDK w wielu językach, które posłużą jako Backend-as-a-Service
- Jest rozwiązaniem open source, które można hostować lokalnie lub na własnym serwerze
- Posiada wbudowaną autentykację użytkowników

AI - Komunikacja z modelami przez usługę Openrouter.ai:
- Dostęp do szerokiej gamy modeli (OpenAI, Anthropic, Google i wiele innych), które pozwolą nam znaleźć rozwiązanie zapewniające wysoką efektywność i niskie koszta
- Pozwala na ustawianie limitów finansowych na klucze API

Testing - Kompleksowa strategia testowania dla zapewnienia jakości:
- Vitest jako główny framework testowy - nowoczesne, szybkie rozwiązanie zoptymalizowane dla Vite/TypeScript
- React Testing Library do testowania komponentów UI z fokusem na interakcje użytkownika
- jsdom do symulacji środowiska DOM w testach jednostkowych
- MSW (Mock Service Worker) do mockowania wywołań API w testach
- @testing-library/user-event do symulacji rzeczywistych interakcji użytkownika
- axe-core do automatycznego testowania dostępności (a11y)
- Supabase Test Client do testowania integracji z bazą danych
- Automatyczne raportowanie pokrycia kodu z progiem 90% dla logiki biznesowej
- Kontinualna integracja z automatycznym uruchamianiem testów w GitHub Actions

CI/CD i Hosting:
- Github Actions do tworzenia pipeline’ów CI/CD
- Automatyczne deployments tylko po pomyślnym przejściu wszystkich testów
- Raportowanie pokrycia kodu i jakości w pull requestach