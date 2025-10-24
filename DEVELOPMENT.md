# AccountOS - Development Guidelines

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Code Style](#code-style)
3. [Project Structure](#project-structure)
4. [Naming Conventions](#naming-conventions)
5. [Git Workflow](#git-workflow)
6. [Testing Guidelines](#testing-guidelines)
7. [Performance Guidelines](#performance-guidelines)
8. [Security Guidelines](#security-guidelines)
9. [Accessibility](#accessibility)
10. [Browser Support](#browser-support)

---

## 🚀 Getting Started

### Prerequisites
```bash
Node.js >= 18.x
npm >= 9.x
```

### Installation
```bash
# Clone repository
git clone https://github.com/your-org/accountos.git
cd accountos

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables
Create `.env.local`:
```env
VITE_API_URL=http://localhost:7043/api/v1
VITE_APP_NAME=AccountOS
VITE_APP_VERSION=1.0.0
```

---

## 💅 Code Style

### TypeScript

**Use strict mode:**
```typescript
// ✅ Good
const user: User = { id: '1', name: 'John' };
const data: unknown = apiResponse;

// ❌ Bad
const user: any = { id: '1', name: 'John' };
```

**Prefer interfaces over types:**
```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
}

// ⚠️ Acceptable for unions/intersections
type Status = 'active' | 'inactive';
```

**Use enums for constants:**
```typescript
// ✅ Good
enum UserRole {
  Admin = 'admin',
  User = 'user'
}

// ❌ Bad
const USER_ROLE_ADMIN = 'admin';
const USER_ROLE_USER = 'user';
```

### React

**Functional components only:**
```typescript
// ✅ Good
export const MyComponent: React.FC<Props> = ({ title }) => {
  return <div>{title}</div>;
};

// ❌ Bad (class components)
export class MyComponent extends React.Component {
  render() {
    return <div>{this.props.title}</div>;
  }
}
```

**Custom hooks for logic reuse:**
```typescript
// ✅ Good
export const useUserData = () => {
  const [user, setUser] = useState<User | null>(null);
  // ... logic
  return { user, isLoading };
};
```

**ProComponents for complex UI:**
```typescript
// ✅ Good
import { ProTable, ProForm } from '@ant-design/pro-components';
```

### CSS

**Use CSS modules:**
```typescript
// ✅ Good
import styles from './MyComponent.module.css';
<div className={styles.container} />
```

**Mobile-first approach:**
```css
/* ✅ Good */
.container {
  width: 100%;
}

@media (min-width: 768px) {
  .container {
    width: 750px;
  }
}
```

**Use CSS variables for theming:**
```css
/* ✅ Good */
.button {
  background: var(--color-primary);
  color: var(--color-text);
}
```

### Comments

**All comments in Turkish:**
```typescript
// ✅ Good
/**
 * Kullanıcı bilgilerini getirir
 * @param userId - Kullanıcı ID'si
 * @returns Kullanıcı bilgileri
 */
export const getUser = (userId: string): Promise<User> => {
  // API'den kullanıcı verisi çek
  return api.get(`/users/${userId}`);
};
```

**Document complex logic:**
```typescript
// ✅ Good
// FIFO hesaplaması: İlk giren ilk çıkar mantığıyla stok maliyeti hesapla
const calculateFIFOCost = (movements: StockMovement[]) => {
  // Giriş hareketlerini tarihe göre sırala
  const sortedMovements = movements.sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  // ...
};
```

---

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Common components (Button, Input, etc.)
│   ├── header/         # Header-specific components
│   └── forms/          # Form components
├── pages/              # Page components (routes)
│   ├── dashboard/
│   ├── invoices/
│   └── partners/
├── layouts/            # Layout components
│   └── ProMainLayout.tsx
├── hooks/              # Custom React hooks
│   ├── useAuth.ts
│   └── useTheme.ts
├── services/           # API service layer
│   ├── api/
│   └── authService.ts
├── utils/              # Utility functions
│   ├── formatters.ts
│   └── validators.ts
├── types/              # TypeScript type definitions
│   ├── user.ts
│   └── invoice.ts
├── styles/             # Global styles
│   ├── global.css
│   └── themes.css
├── i18n/               # Internationalization
│   ├── locales/
│   └── config.ts
└── mocks/              # MSW mock handlers
    ├── handlers.ts
    └── browser.ts
```

---

## 📛 Naming Conventions

### Files
```
Components:    PascalCase.tsx       → UserProfile.tsx
Hooks:         useCamelCase.ts      → useUserData.ts
Utils:         camelCase.ts         → formatCurrency.ts
Types:         camelCase.ts         → user.ts
Styles:        kebab-case.css       → user-profile.css
Constants:     UPPER_SNAKE_CASE.ts  → API_ENDPOINTS.ts
```

### Variables & Functions
```typescript
// Components
const UserProfile: React.FC = () => {};

// Functions
const fetchUserData = () => {};
const handleSubmit = () => {};

// Constants
const MAX_FILE_SIZE = 5242880; // 5MB
const API_BASE_URL = 'https://api.example.com';

// Enums
enum UserRole {
  Admin = 'admin',
  User = 'user'
}
```

---

## 🌿 Git Workflow

### Branch Naming
```
feature/feature-name       → feature/user-authentication
bugfix/bug-description     → bugfix/invoice-calculation-error
hotfix/critical-fix        → hotfix/security-vulnerability
refactor/what-changed      → refactor/api-client-structure
docs/documentation-update  → docs/readme-improvements
```

### Commit Messages
```
[TYPE] Short description (Turkish)

Detailed description (optional, Turkish)

- Change 1
- Change 2
- Change 3

Refs: #123
```

**Types:**
- `[FEAT]` - New feature (Yeni özellik)
- `[FIX]` - Bug fix (Hata düzeltme)
- `[REFACTOR]` - Code refactoring (Kod iyileştirme)
- `[STYLE]` - Code formatting (Kod formatı)
- `[TEST]` - Tests (Testler)
- `[DOCS]` - Documentation (Dokümantasyon)
- `[CHORE]` - Build/config (Yapılandırma)
- `[PERF]` - Performance improvement (Performans)

**Examples:**
```bash
[FEAT] Fatura oluşturma modülü eklendi

- CreateInvoiceForm component'i oluşturuldu
- Invoice API servisi eklendi
- Fatura listesi sayfası güncellendi

Refs: #42

---

[FIX] Fatura toplam hesaplama hatası düzeltildi

KDV hesaplamasında ondalık sayılarla ilgili hata giderildi.

Refs: #58

---

[REFACTOR] API client yapısı iyileştirildi

- Axios interceptor'lar eklendi
- Error handling merkezi hale getirildi
- Token yenileme mekanizması eklendi
```

### Pull Request Template
```markdown
## 📝 Description
[Yapılan değişikliklerin açıklaması]

## 🎯 Type of Change
- [ ] Bug fix (hata düzeltme)
- [ ] New feature (yeni özellik)
- [ ] Breaking change (geriye uyumsuz değişiklik)
- [ ] Documentation update (dokümantasyon)

## ✅ Checklist
- [ ] Code follows style guidelines
- [ ] Turkish comments added
- [ ] Self-review completed
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No console errors
- [ ] Tested on Chrome/Firefox/Safari

## 📸 Screenshots (if applicable)
[Ekran görüntüleri]

## 🔗 Related Issues
Closes #[issue number]
```

---

## 🧪 Testing Guidelines

### Unit Tests
```typescript
// ✅ Good test structure
describe('formatCurrency', () => {
  it('should format Turkish Lira correctly', () => {
    expect(formatCurrency(1234.56)).toBe('₺1.234,56');
  });

  it('should handle zero values', () => {
    expect(formatCurrency(0)).toBe('₺0,00');
  });

  it('should handle negative values', () => {
    expect(formatCurrency(-100)).toBe('-₺100,00');
  });
});
```

### Integration Tests
```typescript
// Test API integrations
describe('InvoiceService', () => {
  it('should create invoice successfully', async () => {
    const invoice = await createInvoice(mockData);
    expect(invoice.id).toBeDefined();
    expect(invoice.status).toBe('draft');
  });
});
```

### E2E Tests
```typescript
// Test critical user flows
test('user can create invoice', async ({ page }) => {
  await page.goto('/invoices/create');
  await page.fill('[name="invoiceNumber"]', 'INV-001');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/invoices/list');
});
```

---

## ⚡ Performance Guidelines

### React Performance
```typescript
// ✅ Good - Memoize expensive components
export const ExpensiveList = React.memo(({ items }) => {
  return <div>{items.map(item => <Item key={item.id} {...item} />)}</div>;
});

// ✅ Good - useMemo for expensive calculations
const sortedData = useMemo(() => {
  return data.sort((a, b) => a.value - b.value);
}, [data]);

// ✅ Good - useCallback for event handlers
const handleClick = useCallback(() => {
  console.log('clicked');
}, []);
```

### Bundle Size
- Code splitting with React.lazy()
- Tree shaking (proper imports)
- Image optimization (WebP, lazy loading)
- Remove unused dependencies

### API Performance
- Implement caching (React Query)
- Use pagination for large lists
- Debounce search inputs (300ms)
- Optimize database queries

---

## 🔐 Security Guidelines

### Frontend Security
```typescript
// ✅ Good - Validate all inputs
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// ✅ Good - Sanitize user content
import DOMPurify from 'dompurify';
const cleanHTML = DOMPurify.sanitize(userInput);

// ✅ Good - Use HTTPS only
const API_URL = import.meta.env.VITE_API_URL;
if (!API_URL.startsWith('https://') && import.meta.env.PROD) {
  throw new Error('API URL must use HTTPS in production');
}
```

### Authentication
```typescript
// ✅ Good - Secure token storage
const storeToken = (token: string) => {
  localStorage.setItem('token', token);
  // Set token expiry
  const expiry = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
  localStorage.setItem('token_expiry', expiry.toString());
};

// ✅ Good - Auto logout on token expiry
const isTokenValid = (): boolean => {
  const expiry = localStorage.getItem('token_expiry');
  return expiry ? Date.now() < parseInt(expiry) : false;
};
```

### XSS Prevention
```typescript
// ❌ Bad - Direct innerHTML
element.innerHTML = userInput;

// ✅ Good - Use React (auto-escapes)
return <div>{userInput}</div>;

// ✅ Good - Sanitize if HTML needed
return <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />;
```

---

## ♿ Accessibility (a11y)

### Semantic HTML
```typescript
// ✅ Good
<nav>
  <ul>
    <li><a href="/home">Home</a></li>
  </ul>
</nav>

// ❌ Bad
<div className="nav">
  <div className="item" onClick={handleClick}>Home</div>
</div>
```

### ARIA Labels
```typescript
// ✅ Good
<button aria-label="Menüyü kapat">
  <CloseOutlined />
</button>

<input 
  type="text"
  aria-label="Fatura numarası"
  aria-required="true"
/>
```

### Keyboard Navigation
```typescript
// ✅ Good - Handle keyboard events
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    handleClick();
  }
};

<div 
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={handleKeyDown}
>
  Clickable
</div>
```

### Focus Management
```typescript
// ✅ Good - Focus visible
.button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

// ❌ Bad - Remove focus outline
.button:focus {
  outline: none; /* Never do this! */
}
```

---

## 🌐 Browser Support

### Desktop
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

### Mobile
- iOS Safari (latest 2 versions)
- Chrome Android (latest 2 versions)

### Testing
```bash
# Test on different browsers
npm run test:browsers

# Visual regression testing
npm run test:visual

# Cross-browser compatibility
npx browserslist
```

---

## 🚀 Deployment

### Environments
```
Development:  http://localhost:3001
Staging:      https://staging.accountos.com
Production:   https://app.accountos.com
```

### Build Process
```bash
# Development build
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Type check
npm run type-check

# Lint
npm run lint

# Format
npm run format
```

### Pre-deployment Checklist
- [ ] All tests passing
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Build successful
- [ ] Environment variables set
- [ ] API endpoints correct
- [ ] Performance tested
- [ ] Security headers configured
- [ ] HTTPS enabled
- [ ] Backup created

---

## 📊 Performance Monitoring

### Metrics to Track
```typescript
// Core Web Vitals
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

// Custom Metrics
- Time to Interactive (TTI): < 3.5s
- First Contentful Paint (FCP): < 1.8s
- Bundle Size: < 500KB (gzipped)
```

### Monitoring Tools
- Lighthouse CI
- Web Vitals
- Sentry (error tracking)
- Google Analytics (user behavior)

---

## 🐛 Debugging

### Development Tools
```typescript
// React DevTools - Component inspection
// Redux DevTools - State inspection (if using Redux)
// React Query DevTools - Query inspection

// Enable React Query DevTools in development
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<QueryClientProvider client={queryClient}>
  <App />
  {import.meta.env.DEV && <ReactQueryDevtools />}
</QueryClientProvider>
```

### Logging
```typescript
// ✅ Good - Structured logging
const logger = {
  info: (message: string, data?: any) => {
    console.log(`ℹ️ [INFO] ${message}`, data);
  },
  error: (message: string, error?: any) => {
    console.error(`❌ [ERROR] ${message}`, error);
  },
  warn: (message: string, data?: any) => {
    console.warn(`⚠️ [WARN] ${message}`, data);
  }
};

// Use throughout app
logger.info('User logged in', { userId: user.id });
logger.error('API call failed', { endpoint, error });
```

---

## 📚 Additional Resources

### Documentation
- [React Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Ant Design Pro](https://procomponents.ant.design/)
- [TanStack Query](https://tanstack.com/query/latest)

### Style Guides
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
- [Clean Code JavaScript](https://github.com/ryanmcdermott/clean-code-javascript)

### Tools
- [Can I Use](https://caniuse.com/) - Browser support
- [Bundlephobia](https://bundlephobia.com/) - Package size
- [npm trends](https://npmtrends.com/) - Package comparison

---

## 🤝 Contributing

### Before Starting
1. Create a GitHub issue
2. Discuss the change
3. Get approval
4. Fork the repository
5. Create a feature branch
6. Make changes
7. Add tests
8. Update documentation
9. Submit pull request

### Code Review Checklist
- [ ] Code follows style guide
- [ ] Turkish comments added
- [ ] Tests added/passing
- [ ] No console errors
- [ ] Performance impact considered
- [ ] Security implications reviewed
- [ ] Accessibility tested
- [ ] Documentation updated
- [ ] Breaking changes documented

---

## 📞 Support

### Getting Help
- 📖 Check documentation first
- 💬 Ask in team chat
- 🐛 Create GitHub issue
- 📧 Email: dev@accountos.com

### Reporting Bugs
Use the bug report template:
```markdown
## Bug Description
[Clear description of the bug]

## Steps to Reproduce
1. Go to...
2. Click on...
3. See error

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Screenshots
[If applicable]

## Environment
- Browser: Chrome 120
- OS: macOS 14
- Version: 1.0.0
```

---

**Last Updated:** 2025-01-19
**Version:** 1.0.0
