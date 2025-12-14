# Testing Guide - Cup of Tea MVP

## Overview

Ten projekt wykorzystuje komprehensywną strategię testowania z naciskiem na jakość i niezawodność aplikacji. Środowisko testowe jest oparte na Vitest, React Testing Library, MSW i innych nowoczesnych narzędziach.

## Tech Stack Testowy

- **Vitest** - Nowoczesny framework testowy zoptymalizowany dla Vite/TypeScript
- **React Testing Library** - Testowanie komponentów UI z fokusem na interakcje użytkownika
- **jsdom** - Symulacja środowiska DOM w testach jednostkowych
- **MSW (Mock Service Worker)** - Mockowanie wywołań API
- **@testing-library/user-event** - Symulacja rzeczywistych interakcji użytkownika
- **axe-core** - Automatyczne testowanie dostępności (a11y)
- **Happy DOM** - Alternatywne środowisko DOM (opcjonalne)

## Struktura Testów

```
src/
├── __tests__/                    # Testy integracyjne
│   └── integration/
├── lib/
│   ├── __tests__/               # Setup i narzędzia testowe
│   │   ├── setup/
│   │   │   ├── test-setup.ts    # Główny plik konfiguracji
│   │   │   └── test-utils.tsx   # Utility functions
│   │   └── __mocks__/
│   │       └── server.ts        # MSW server
│   ├── services/__tests__/      # Testy serwisów
│   └── utils/__tests__/         # Testy utility functions
├── components/
│   ├── hooks/__tests__/         # Testy custom hooks
│   └── ui/__tests__/            # Testy komponentów UI
```

## Skrypty NPM

```bash
# Podstawowe uruchamianie testów
npm run test

# Tryb watch dla development
npm run test:watch

# UI mode dla nawigacji testów
npm run test:ui

# Generowanie raportów pokrycia kodu
npm run test:coverage

# Pokrycie kodu z trybem watch
npm run test:coverage:watch

# Jednorazowe uruchomienie z verbose output
npm run test:run

# Sprawdzanie typów TypeScript
npm run type-check
```

## Progi Pokrycia Kodu

Zgodnie z tech-stack.md, projekt ma następujące progi:

- **Globalne**: 85% (branches, functions, lines, statements)
- **Logika biznesowa** (`src/lib/services/**`, `src/lib/validation/**`): 90%

## Guidelines i Best Practices

### Struktura Testów (AAA Pattern)

```typescript
describe('ComponentName', () => {
  it('should perform expected behavior', async () => {
    // Arrange - przygotowanie danych testowych
    const props = { /* test data */ };
    
    // Act - wykonanie akcji
    const { user } = render(<Component {...props} />);
    await user.click(screen.getByRole('button'));
    
    // Assert - sprawdzenie rezultatów
    expect(screen.getByText('Expected result')).toBeInTheDocument();
  });
});
```

### Mock Functions z Vitest

```typescript
import { vi } from 'vitest';

// Tworzenie mocków
const mockFn = vi.fn();
const spyFn = vi.spyOn(object, 'method');

// Mock całego modułu
vi.mock('@/lib/service', () => ({
  ServiceClass: vi.fn().mockImplementation(() => ({
    method: vi.fn().mockResolvedValue('mocked result')
  }))
}));
```

### Testing React Components

```typescript
import { render, screen } from '@/lib/__tests__/setup/test-utils';

// Wykorzystanie custom render z providers
const { user } = render(<Component />, {
  withRouter: true,
  initialEntries: ['/test-route']
});

// Testowanie interakcji użytkownika
await user.click(screen.getByRole('button'));
await user.type(screen.getByLabelText('Email'), 'test@example.com');
```

### MSW dla Mockowania API

```typescript
import { server } from '@/lib/__tests__/__mocks__/server';
import { http, HttpResponse } from 'msw';

// Override handler w konkretnym teście
server.use(
  http.get('/api/users', () => {
    return HttpResponse.json({ users: [] });
  })
);
```

### Custom Matchers i Utilities

```typescript
import { 
  expectElementToBeVisible,
  expectFormToHaveError,
  createMockUser 
} from '@/lib/__tests__/setup/test-utils';

// Wykorzystanie helper functions
const mockUser = createMockUser({ role: 'tutor' });
expectElementToBeVisible(screen.getByText('Welcome'));
```

## Przykłady Testów

### Test Jednostkowy (Utility Function)

```typescript
describe('Utils', () => {
  it('should merge class names correctly', () => {
    const result = cn('base-class', 'additional-class');
    expect(result).toBe('base-class additional-class');
  });
});
```

### Test Komponentu React

```typescript
describe('Button Component', () => {
  it('should call onClick when clicked', async () => {
    const handleClick = vi.fn();
    const { user } = render(<Button onClick={handleClick}>Click me</Button>);
    
    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Test Serwisu

```typescript
describe('AuthService', () => {
  it('should successfully authenticate user', async () => {
    mockSupabase.auth.signIn.mockResolvedValue({ 
      data: { user: mockUser }, 
      error: null 
    });
    
    const result = await authService.signIn(credentials);
    expect(result.success).toBe(true);
  });
});
```

### Test Integracyjny

```typescript
describe('Authentication Flow', () => {
  it('should complete full login process', async () => {
    const { user } = render(<AuthForm mode="login" />);
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(screen.queryByText(/signing in/i)).not.toBeInTheDocument();
    });
  });
});
```

## Debugowanie Testów

### Watch Mode
```bash
# Uruchom testy w trybie watch z filtrowaniem
npm run test:watch -- --t "Button"
```

### UI Mode
```bash
# Otwórz interfejs webowy do nawigacji testów
npm run test:ui
```

### Debug w VSCode
Dodano konfigurację launch.json dla debugowania testów w VSCode.

## Continuous Integration

Testy są automatycznie uruchamiane w:
- Pre-commit hooks (husky)
- GitHub Actions pipeline
- Przed każdym build

## Accessibility Testing

```typescript
import { axe } from '@axe-core/playwright';

it('should be accessible', async () => {
  const { container } = render(<Component />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## Troubleshooting

### Częste Problemy

1. **Import Errors**: Sprawdź aliasy w `tsconfig.json` i `vitest.config.ts`
2. **MSW Handlers**: Upewnij się, że server jest poprawnie skonfigurowany w setup
3. **React 19 Compatibility**: Używaj najnowszych wersji testing-library

### Performance

- Używaj `vi.fn()` zamiast pełnych mock implementations gdy to możliwe
- Ograniczaj liczbę DOM queries w testach
- Wykorzystuj `screen.getBy*` zamiast `container.querySelector`

## Dodatkowe Zasoby

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [MSW Documentation](https://mswjs.io/)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)

---

Środowisko testowe jest skonfigurowane zgodnie z najlepszymi praktykami i jest gotowe do użycia. Uruchom `npm run test` aby rozpocząć testowanie!