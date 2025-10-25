# Duplicate Files Analysis Report

## 🔍 Found Duplicates

### Invoice Module - CRITICAL DUPLICATES
- [ ] `/src/features/invoices/InvoiceList.tsx` - ❌ DELETE (old features structure)
- [ ] `/src/pages/invoices/InvoiceList.tsx` - ✅ KEEP (main file)
- [ ] `/src/features/invoices/InvoiceDetail.tsx` - ❌ DELETE (old features structure)
- [ ] `/src/pages/invoices/InvoiceDetail.tsx` - ✅ KEEP (main file)
- [ ] `/src/features/invoices/InvoiceForm.tsx` - ❌ DELETE (old features structure)
- [ ] `/src/pages/invoices/InvoiceForm.tsx` - ✅ KEEP (main file)

### Dashboard Charts - DUPLICATES
- [ ] `/src/components/dashboard/SalesChart.tsx` - ❌ DELETE (old component structure)
- [ ] `/src/pages/dashboard/SalesChart.tsx` - ✅ KEEP (main file)

### Sales Reports - MULTIPLE DUPLICATES
- [ ] `/src/features/reports/components/SalesReport.tsx` - ❌ DELETE (component version)
- [ ] `/src/features/reports/SalesReport.tsx` - ❌ DELETE (old features structure)
- [ ] `/src/pages/reports/SalesReport.tsx` - ✅ KEEP (main file)

### Error Pages - DUPLICATES
- [ ] `/src/pages/403.tsx` - ❌ DELETE (duplicate)
- [ ] `/src/pages/errors/403.tsx` - ✅ KEEP (main file)
- [ ] `/src/pages/404.tsx` - ❌ DELETE (duplicate)
- [ ] `/src/pages/errors/404.tsx` - ✅ KEEP (main file)

### Category Lists - DUPLICATES
- [ ] `/src/features/products/CategoryList.tsx` - ❌ DELETE (wrong location)
- [ ] `/src/features/categories/CategoryList.tsx` - ✅ KEEP (correct location)

### Store Files - DUPLICATES
- [ ] `/src/stores/companyStore.ts` - ❌ DELETE (old stores directory)
- [ ] `/src/store/companyStore.ts` - ✅ KEEP (main file)

## 📁 Recommended Project Structure

```
frontend/src/
├── pages/                    # ✅ Keep - Main pages
│   ├── Dashboard.tsx
│   ├── invoices/
│   │   ├── InvoiceList.tsx      # ✅ KEEP
│   │   ├── InvoiceDetail.tsx    # ✅ KEEP
│   │   └── InvoiceForm.tsx      # ✅ KEEP
│   ├── dashboard/
│   │   ├── SalesChart.tsx       # ✅ KEEP
│   │   ├── TopProductsChart.tsx
│   │   ├── RevenueByCustomerChart.tsx
│   │   └── CashFlowChart.tsx
│   ├── reports/
│   │   └── SalesReport.tsx      # ✅ KEEP
│   ├── errors/
│   │   ├── 403.tsx              # ✅ KEEP
│   │   └── 404.tsx              # ✅ KEEP
│   └── common/
│       └── ComingSoon.tsx
│
├── features/                 # ✅ Keep - Feature modules (business logic)
│   ├── categories/
│   │   └── CategoryList.tsx     # ✅ KEEP
│   ├── reports/
│   │   ├── ReportsDashboard.tsx
│   │   └── ReportsPage.tsx
│   └── settings/
│       └── SettingsPage.tsx
│
├── components/               # ✅ Keep - Reusable components
│   ├── common/
│   ├── layout/
│   └── auth/
│
├── services/                 # ✅ Keep - API services
├── hooks/                    # ✅ Keep - Custom hooks
├── utils/                    # ✅ Keep - Utilities
├── types/                    # ✅ Keep - TypeScript types
├── locales/                  # ✅ Keep - i18n translations
├── store/                    # ✅ Keep - State management
│   └── companyStore.ts       # ✅ KEEP
└── routes/                   # ✅ Keep - Route definitions

❌ DELETE these directories/files entirely:
├── features/invoices/        # DUPLICATE - Use pages/invoices/
├── features/products/CategoryList.tsx  # WRONG LOCATION
├── stores/                   # OLD - Use store/
└── pages/403.tsx, pages/404.tsx  # DUPLICATE - Use pages/errors/
```

## 🗑️ Files to Delete

### Immediate Deletion List:
1. **Invoice Module Duplicates:**
   - `src/features/invoices/InvoiceList.tsx`
   - `src/features/invoices/InvoiceDetail.tsx`
   - `src/features/invoices/InvoiceForm.tsx`

2. **Dashboard Chart Duplicates:**
   - `src/components/dashboard/SalesChart.tsx`

3. **Sales Report Duplicates:**
   - `src/features/reports/components/SalesReport.tsx`
   - `src/features/reports/SalesReport.tsx`

4. **Error Page Duplicates:**
   - `src/pages/403.tsx`
   - `src/pages/404.tsx`

5. **Category List Duplicate:**
   - `src/features/products/CategoryList.tsx`

6. **Store Duplicate:**
   - `src/stores/companyStore.ts`

## 🔧 Import Fixes Needed

After deletion, these imports need to be updated:

1. **In route files:**
   - Change: `from '@/features/invoices/InvoiceList'`
   - To: `from '@/pages/invoices/InvoiceList'`

2. **In component imports:**
   - Change: `from '@/components/dashboard/SalesChart'`
   - To: `from '@/pages/dashboard/SalesChart'`

3. **In report imports:**
   - Change: `from '@/features/reports/SalesReport'`
   - To: `from '@/pages/reports/SalesReport'`

## ⚠️ Potential Issues

Files that might break after cleanup:
- Route definitions in `src/routes/index.tsx`
- Lazy imports in routes
- Any imports from deleted files

## 📊 Summary

**Total Duplicates Found:** 12 files
**Files to Delete:** 12 files
**Disk Space to Save:** ~50KB
**Import Updates Needed:** ~5-10 files

**Priority:**
1. **HIGH:** Invoice module duplicates (3 files)
2. **MEDIUM:** Dashboard chart duplicates (1 file)
3. **MEDIUM:** Sales report duplicates (2 files)
4. **LOW:** Error page duplicates (2 files)
5. **LOW:** Category list duplicate (1 file)
6. **LOW:** Store duplicate (1 file)
