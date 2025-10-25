# Frontend Project Structure Guide

## Naming Conventions

### Files
- **Pages**: PascalCase (Dashboard.tsx, InvoiceList.tsx)
- **Components**: PascalCase (Button.tsx, Modal.tsx)
- **Utilities**: camelCase (formatCurrency.ts, validators.ts)
- **Hooks**: camelCase with 'use' prefix (useAuth.ts, useInvoices.ts)
- **Services**: camelCase with 'Service' suffix (invoiceService.ts)

### Directories
- **Feature modules**: lowercase plural (invoices/, customers/, products/)
- **Generic folders**: lowercase (components/, utils/, hooks/)

## Directory Structure Rules

1. **Pages** → `/src/pages/`
   - Top-level pages directly in pages/ (Dashboard.tsx, Login.tsx)
   - Module pages in subdirectories (invoices/InvoiceList.tsx)

2. **Components** → `/src/components/`
   - Shared components only
   - Module-specific components in pages/[module]/components/

3. **Features** → `/src/features/`
   - Business logic components
   - Complex feature modules
   - NOT for simple page components

4. **No duplicate locations**
   - ❌ Do NOT use /src/views/
   - ❌ Do NOT create pages/dashboard/Dashboard.tsx
   - ✅ Use pages/Dashboard.tsx directly

## Import Path Standard

Always use absolute imports with `@/`:

```typescript
// ✅ CORRECT
import { Dashboard } from '@/pages/Dashboard';
import { InvoiceList } from '@/pages/invoices/InvoiceList';

// ❌ WRONG
import { Dashboard } from '../pages/Dashboard';
import { Dashboard } from './Dashboard';
```

## Current Clean Structure

```
frontend/src/
├── pages/                    # ✅ Main pages
│   ├── Dashboard.tsx
│   ├── invoices/
│   │   ├── InvoiceList.tsx
│   │   ├── InvoiceDetail.tsx
│   │   └── InvoiceForm.tsx
│   ├── dashboard/
│   │   ├── SalesChart.tsx
│   │   ├── TopProductsChart.tsx
│   │   ├── RevenueByCustomerChart.tsx
│   │   └── CashFlowChart.tsx
│   ├── reports/
│   │   └── SalesReport.tsx
│   └── errors/
│       ├── 403.tsx
│       └── 404.tsx
│
├── features/                 # ✅ Business logic
│   ├── categories/
│   ├── reports/
│   └── settings/
│
├── components/               # ✅ Reusable components
│   ├── common/
│   ├── layout/
│   └── auth/
│
├── services/                 # ✅ API services
├── hooks/                    # ✅ Custom hooks
├── utils/                    # ✅ Utilities
├── types/                    # ✅ TypeScript types
├── locales/                  # ✅ i18n translations
├── store/                    # ✅ State management
└── routes/                   # ✅ Route definitions
```

## Cleanup Results

### Files Deleted (12 total):
1. ✅ `src/features/invoices/InvoiceList.tsx`
2. ✅ `src/features/invoices/InvoiceDetail.tsx`
3. ✅ `src/features/invoices/InvoiceForm.tsx`
4. ✅ `src/components/dashboard/SalesChart.tsx`
5. ✅ `src/features/reports/components/SalesReport.tsx`
6. ✅ `src/features/reports/SalesReport.tsx`
7. ✅ `src/pages/403.tsx`
8. ✅ `src/pages/404.tsx`
9. ✅ `src/features/products/CategoryList.tsx`
10. ✅ `src/stores/companyStore.ts`
11. ✅ `src/features/invoices/` (empty directory)
12. ✅ `src/stores/` (empty directory)

### Import Updates Made:
1. ✅ `src/routes/index.tsx` - SalesReport import path updated

### Disk Space Saved:
- **Backup size**: 284KB
- **Files deleted**: ~50KB
- **Directories cleaned**: 2 empty directories

## Best Practices

1. **Single Source of Truth**: Only ONE version of each page exists
2. **Consistent Naming**: PascalCase for all page components
3. **Logical Grouping**: Related pages in subdirectories
4. **No Duplicates**: Regular cleanup to prevent duplicates
5. **Clear Imports**: Always use `@/` absolute imports

## Maintenance

- **Monthly**: Check for new duplicates
- **Before major features**: Clean up old files
- **After refactoring**: Update import paths
- **Regular**: Remove unused files

## Success Criteria

✅ **Structure:**
- Only ONE version of each page exists
- All pages in correct locations
- No duplicate files
- PascalCase naming for all pages

✅ **Imports:**
- All imports use `@/pages/` path
- No broken import references
- TypeScript compiles without errors

✅ **Functionality:**
- All pages load correctly
- All routes work
- No 404 errors
- No console errors
