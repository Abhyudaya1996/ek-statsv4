# EK Stats - Lead Analytics Dashboard PRD

## Project Overview

**Product Name:** EK Stats - Lead Analytics Dashboard  
**Platform:** Web Application (Mobile-First)  
**Target Users:** EarnKaro Credit Card Affiliate Influencers  
**Tech Stack:** Next.js 14, TypeScript, Supabase, React Query, Tailwind CSS  
**Launch Timeline:** 8-10 weeks  
**Document Version:** 1.0  
**Last Updated:** December 2024  

### Vision Statement
Transform EarnKaro influencers' lead performance with intelligent analytics, providing actionable insights to maximize credit card affiliate earnings through comprehensive lead tracking and conversion optimization.

## Problem Statement

EarnKaro influencers currently face:
- **Limited Visibility:** Long confirmation cycles (40-75 days) create uncertainty about lead status
- **Poor Analytics:** Basic tracking in main EarnKaro app without detailed conversion insights
- **Revenue Forecasting:** Difficulty predicting earnings due to inflated commission displays
- **Performance Optimization:** Lack of bank-wise, card-wise performance analytics
- **Mobile Experience:** Need for mobile-optimized dashboard for on-the-go monitoring

## Success Metrics

### Primary KPIs
- **User Engagement:** 80% monthly active users among target influencers
- **Lead Conversion:** 15% improvement in approval rates within 6 months
- **Revenue Impact:** 25% increase in confirmed commissions per user
- **Platform Adoption:** 90% user satisfaction score

### Secondary KPIs
- Average session duration > 5 minutes
- Daily active users > 60% of registered base
- Export feature usage > 40%
- Mobile usage > 70% of total sessions

## Target Users

### Primary Persona: High-Performance Influencers
- **Profile:** Earning ₹30,000-₹50,000+ monthly through credit card affiliates  
- **Pain Points:** Need detailed analytics for optimization, revenue forecasting  
- **Goals:** Maximize approval rates, optimize bank/card selection  

### Secondary Persona: Growing Influencers  
- **Profile:** Earning ₹5,000-₹25,000 monthly, growing their affiliate business  
- **Pain Points:** Understanding lead performance, improving conversion  
- **Goals:** Scale earnings, learn from performance data  

## Technical Architecture

### Project Structure & Organization
```
ek-stats/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── ui/              # Base UI components (buttons, inputs)
│   │   ├── charts/          # Chart components (funnel, bar, KPI cards)
│   │   ├── filters/         # Filter system components
│   │   ├── tables/          # Data table components
│   │   └── layout/          # Layout components (navigation, headers)
│   ├── pages/               # Next.js pages (dashboard, reports)
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities and configurations
│   ├── store/               # State management (React Query, Context)
│   ├── types/               # TypeScript type definitions
│   ├── constants/           # App constants (colors, breakpoints)
│   ├── utils/               # Utility functions (formatting, dates)
│   └── styles/              # Global styles and Tailwind config
├── tests/                   # Comprehensive test suite
│   ├── components/          # Component unit tests
│   ├── api/                 # API integration tests
│   ├── e2e/                 # End-to-end tests with Playwright
│   └── utils/               # Test utilities and mocks
└── docs/                    # Technical documentation
```

### Database Schema & Relationships

#### Core Tables
```sql
-- Raw Applications Table (Primary Data Source)
create table public."Raw" (
  application_id text not null,
  applicant_name text null,
  application_date text null, -- dd-mm-yyyy format
  application_month text null, -- yyyy-mm format
  decision_date text null,
  decision_month text null,
  bank text null,
  card_name text null,
  etb_ntb text null,
  application_quality text null,
  stage text null,
  sub_stage text null,
  rejection_reason text null,
  rejection_category text null,
  ck_crm_status text null,
  ek_crm_status text null,
  ops_status text null, -- pending/paid
  activation_status text null,
  total_commission bigint null,
  commission_for_validations text null,
  stage_code text null, -- a,b,c,d,e,f,r,w,z,y
  sub_stage_code text null,
  clean_exit text null,
  pid text null,
  vendor text null,
  user_id bigint null,
  store_name text null,
  final_commission bigint null,
  current_status text null,
  journey_status text null,
  constraint Raw_pkey primary key (application_id),
  constraint Raw_user_id_fkey foreign KEY (user_id) references users (user_id)
) TABLESPACE pg_default;

-- Users Table
create table public.users (
  sr bigint not null,
  user_id bigint null,
  username text null,
  constraint user_id_pkey primary key (sr),
  constraint unique_user_id unique (user_id)
) TABLESPACE pg_default;

-- Exit Clicks Table (Traffic Data)
create table public.exitclicks (
  exit_id text not null,
  userid bigint null,
  store_name text null,
  voucher_title text null,
  product_id text null,  
  device text null,
  network text null,
  ip_address text null,
  clickdate text null,
  clicktime text null,
  shareid text null,
  clicktype text null,
  referr_url text null,
  landing_url text null,
  report_storename text null,
  report_store_categoryname text null,
  last_pushed_date timestamp with time zone null,
  storeid bigint null,
  source text null,
  constraint exitclicks_pkey primary key (exit_id),
  constraint exitclicks_userid_fkey foreign key (userid) references users (user_id)
) TABLESPACE pg_default;
```

#### Database Optimization Strategy
```sql
-- Critical indexes for performance
CREATE INDEX idx_raw_application_month ON "Raw"(application_month);
CREATE INDEX idx_raw_user_id ON "Raw"(user_id);
CREATE INDEX idx_raw_stage_code ON "Raw"(stage_code);
CREATE INDEX idx_raw_bank ON "Raw"(bank);
CREATE INDEX idx_raw_ops_status ON "Raw"(ops_status);
CREATE INDEX idx_exitclicks_clean_exit ON exitclicks(clean_exit);
CREATE INDEX idx_exitclicks_userid ON exitclicks(userid);
CREATE INDEX idx_exitclicks_clickdate ON exitclicks(clickdate);
```

#### Stage Code System (Universal Across All Reports)
```typescript
export const STAGE_DEFINITIONS = {
  INCOMPLETE: ['a', 'b'],           // User pending actions
  KYC: ['c', 'd'],                 // KYC verification stage
  UNDERWRITING: ['e'],             // Underwriting stage
  CURING: ['f'],                   // Curing stage  
  WAITING_APPROVAL: ['w'],         // Waiting for approval
  APPROVED: ['z'],                 // Card approved
  REJECTED: ['r', 'r2'],           // Application rejected, underwriting reject
  EXPIRED: ['y'],                  // Application expired
  NON_COMMISSIONABLE: ['x']        // Non commissionable
} as const;

// KYC Done Logic: Applications that have completed KYC process
export const KYC_DONE_STAGES = ['e', 'f', 'w', 'z', 'r2', 'x'] as const;

export const STAGE_LABELS = {
  INCOMPLETE: 'Incomplete Applications',
  KYC: 'KYC',
  UNDERWRITING: 'Underwriting',
  CURING: 'Curing',
  WAITING_APPROVAL: 'Waiting Approval',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  EXPIRED: 'Expired',
  NON_COMMISSIONABLE: 'Non Commissionable'
} as const;
```

### Component Architecture

#### Global Filter System
```typescript
// Centralized filter state management
interface FilterOptions {
  timeRange: {
    start: string;
    end: string;
    preset?: 'current_month' | 'last_3_months' | 'last_6_months' | 'custom';
  };
  banks: string[];
  cards: string[];
  users: number[];
  stages: StageCode[];
  applicationQuality: string[]; // Credit score quality filter - NULL values shown as "Unknown Credit Score"
  search?: string;
}

// Context provider for global filter state
export const FilterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [filters, dispatch] = useReducer(filterReducer, getDefaultFilters());
  // Filter logic implementation
};

// Reusable filter components
export const TimeRangeFilter: React.FC = () => {...}
export const MultiSelectFilter: React.FC = () => {...}
export const SearchFilter: React.FC = () => {...}
```

#### Reusable Chart Components
```typescript
// Base chart container with loading states
export const BaseChart: React.FC<BaseChartProps> = ({ title, children, loading }) => {...}

// Specialized chart components
export const FunnelChart: React.FC<FunnelChartProps> = ({ data, loading }) => {...}
export const KPICard: React.FC<KPICardProps> = ({ data, loading }) => {...}
export const DataTable: React.FC<DataTableProps> = ({ data, columns, pagination }) => {...}
```

#### Mobile-First Responsive Design
```typescript
// Responsive utilities
export const useBreakpoint = () => {...}    // Detect current breakpoint
export const useIsMobile = () => {...}      // Mobile detection
export const useIsTouch = () => {...}       // Touch device detection

// Mobile-optimized components
const DataTable = () => (
  <>
    {/* Desktop: Traditional table */}
    <div className="hidden lg:block">
      <table>...</table>
    </div>
    
    {/* Mobile: Card-based layout */}
    <div className="lg:hidden">
      {data.map(row => <MobileCard key={row.id} data={row} />)}
    </div>
  </>
);
```

### API Architecture & Data Layer

#### Structured API Classes
```typescript
// Base API class with common functionality
class BaseAPI {
  protected async executeQuery<T>(query: Promise<any>): Promise<APIResponse<T>> {
    // Error handling, logging, response formatting
  }
  
  protected buildFilterQuery(baseQuery: any, filters: FilterOptions) {
    // Universal filter application logic
  }
}

// Specialized API classes
export class DashboardAPI extends BaseAPI {
  async getKPIs(filters: FilterOptions): Promise<APIResponse<KPIData>> {...}
  async getCommissionBreakdown(filters: FilterOptions): Promise<APIResponse<CommissionData>> {...}
}

export class LeadsAPI extends BaseAPI {
  async getFunnelData(filters: FilterOptions): Promise<APIResponse<FunnelData>> {...}
  async getDetailedLeads(filters: FilterOptions, page: number): Promise<APIResponse<RawApplication[]>> {...}
}
```

#### Core API Endpoints
```
GET /api/dashboard/kpis?month=2025-07&user_id=123
GET /api/dashboard/commission?filters={timeRange,banks,users}
GET /api/leads/funnel?filters={...}&include_clicks=true
GET /api/leads/detailed?search=&filters={...}&page=1&limit=50
GET /api/reports/approval?bank=&time_range=&user_id=
GET /api/reports/rejection?filters={...}
GET /api/analytics/timeline?view=month&drill=day&month=2025-07
GET /api/analytics/bank-performance?metrics=approval_rate,leads,commission
```

#### React Query Integration
```typescript
// Custom hooks for data fetching with caching
export const useDashboardKPIs = (filters: FilterOptions) => {
  return useQuery({
    queryKey: ['dashboard', 'kpis', filters],
    queryFn: () => dashboardAPI.getKPIs(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    refetchOnWindowFocus: false
  });
};

export const useDetailedLeads = (filters: FilterOptions, page: number) => {
  return useQuery({
    queryKey: ['leads', 'detailed', filters, page],
    queryFn: () => leadsAPI.getDetailedLeads(filters, page),
    keepPreviousData: true,
    staleTime: 1 * 60 * 1000
  });
};
```

### Performance Optimization Strategy

#### Frontend Optimizations
```typescript
// Debounced search to reduce API calls
export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T, delay: number
): T => {
  // Debounce implementation
};

// Virtual scrolling for large datasets
export const useVirtualList = <T>(items: T[], itemHeight: number, containerHeight: number) => {
  // Virtual scrolling logic for performance
};

// Memoized computations
export const useFilteredData = <T>(data: T[], filters: FilterOptions, filterFn: Function) => {
  return useMemo(() => data.filter(item => filterFn(item, filters)), [data, filters, filterFn]);
};
```

#### Database Performance
- **Cursor-based pagination** for large datasets
- **Indexed queries** on frequently filtered columns
- **Optimized joins** between Raw, Users, and ExitClicks tables
- **Query result caching** with appropriate TTL

### Utility Functions & Helpers

#### Date & Number Formatting
```typescript
// Date utilities with proper Indian format handling
export const dateUtils = {
  formatDate: (date: string | Date, formatStr = 'dd-MM-yyyy'): string => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr);
  },
  
  getCurrentMonth: (): string => format(new Date(), 'yyyy-MM'),
  
  getMonthsRange: (months: number): { start: string; end: string } => {
    const end = new Date();
    const start = subMonths(end, months - 1);
    return {
      start: format(start, 'yyyy-MM'),
      end: format(end, 'yyyy-MM')
    };
  },
  
  parseApplicationDate: (dateStr: string): Date | null => {
    if (!dateStr) return null;
    const [day, month, year] = dateStr.split('-');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }
};

// Number formatting with Indian locale
export const formatUtils = {
  formatNumber: (num: number): string => 
    new Intl.NumberFormat('en-IN').format(num),
    
  formatCurrency: (amount: number): string => 
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount),
    
  formatPercentage: (value: number): string => `${value.toFixed(1)}%`,
  
  calculateTrend: (current: number, previous: number): {
    direction: 'up' | 'down' | 'neutral';
    percentage: number;
  } => {
    if (previous === 0) return { direction: 'neutral', percentage: 0 };
    const change = ((current - previous) / previous) * 100;
    return {
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
      percentage: Math.abs(change)
    };
  }
};

// Stage utilities for consistent logic
export const stageUtils = {
  getStageLabel: (stageCode: StageCode): string => {
    for (const [label, codes] of Object.entries(STAGE_DEFINITIONS)) {
      if (codes.includes(stageCode)) return label;
    }
    return 'Unknown';
  },
  
  isApproved: (stageCode: StageCode): boolean => 
    STAGE_DEFINITIONS.APPROVED.includes(stageCode),
    
  isRejected: (stageCode: StageCode): boolean => 
    STAGE_DEFINITIONS.REJECTED.includes(stageCode),
    
  isPending: (stageCode: StageCode): boolean => 
    [...STAGE_DEFINITIONS.INCOMPLETE, ...STAGE_DEFINITIONS.KYC, ...STAGE_DEFINITIONS.VERIFICATION]
      .includes(stageCode)
};
```

### Design Specifications

#### Brand Guidelines & Color System
```typescript
export const COLORS = {
  primary: {
    50: '#E8F5E8',
    500: '#2E7D32',  // EarnKaro Primary Green
    600: '#1B5E20',
    700: '#1A5319'
  },
  secondary: {
    50: '#E3F2FD',
    500: '#1976D2',  // Secondary Blue
    600: '#1565C0'
  },
  success: '#4CAF50',
  warning: '#FF9800', 
  error: '#F44336',
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    500: '#9E9E9E',
    700: '#616161',
    900: '#212121'
  }
} as const;

export const BREAKPOINTS = {
  mobile: '320px',
  tablet: '768px', 
  desktop: '1024px',
  wide: '1440px'
} as const;
```

#### Mobile-First Responsive Design
```typescript
// Responsive utilities
export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState<'mobile' | 'tablet' | 'desktop' | 'wide'>('mobile');
  
  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width >= 1440) setBreakpoint('wide');
      else if (width >= 1024) setBreakpoint('desktop');
      else if (width >= 768) setBreakpoint('tablet');
      else setBreakpoint('mobile');
    };
    
    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);
  
  return breakpoint;
};

// Touch-friendly component implementations
const MobileOptimizedComponent = () => (
  <div className="
    /* Mobile: Stack vertically, full width */
    flex flex-col space-y-4
    
    /* Tablet: 2x2 grid */
    md:grid md:grid-cols-2 md:gap-6 md:space-y-0
    
    /* Desktop: 4x1 horizontal layout */
    lg:grid-cols-4
    
    /* Wide: Enhanced spacing */
    xl:gap-8
  ">
    {/* Responsive components */}
  </div>
);
```

#### Component Layout Strategy

#### KPI Cards Responsive Behavior
- **Mobile (320px-768px):** Stack vertically with full width, touch-optimized spacing
- **Tablet (768px-1024px):** 2x2 grid layout with balanced spacing  
- **Desktop (1024px+):** 4x1 horizontal layout for dashboard overview
- **Wide (1440px+):** Enhanced spacing and larger touch targets

#### Charts & Data Visualization
- **Mobile:** Full-width with horizontal scroll, simplified legends
- **Tablet:** Optimized aspect ratios, interactive tooltips
- **Desktop:** Full feature set with hover states and detailed tooltips
- **Accessibility:** High contrast mode, keyboard navigation, screen reader support

#### Navigation & Filters
- **Mobile:** Bottom navigation bar, collapsible filter drawer
- **Tablet:** Side navigation with expandable sections
- **Desktop:** Persistent sidebar with advanced filter options
- **Touch:** Minimum 44px touch targets, gesture support

## Feature Specifications

### 1. Homepage Dashboard

#### KPI Tiles
**Total Leads**
- **Calculation:** COUNT(application_id) WHERE application_month = current_month
- **Indicator:** Percentage change from previous month
- **Mobile:** Prominent display with trend arrow

**Potential Commission** 
- **Calculation:** 10% of SUM(total_commission) for current month
- **Tooltip:** "Based on approval rate, your potential commission is calculated"
- **Previous Name:** Total Commission (renamed for accuracy)

**Approval Rate**
- **Calculation:** COUNT(stage_code IN ('w','z')) / COUNT(application_id) * 100
- **Indicator:** Month-over-month change
- **Display:** Percentage with trend indicator

**Card Outs**
- **Calculation:** COUNT(stage_code IN ('z', 'w'))
- **Tooltip:** "Cards approved and waiting for approval"
- **Action:** Link to detailed view with approved filter

#### Commission Breakdown Chart
- **Total Commission:** SUM(total_commission)
- **Potential Commission:** 10% of total (as above)
- **Pending:** SUM(total_commission) WHERE ops_status = 'pending'
- **Paid:** SUM(total_commission) WHERE ops_status = 'paid'
- **Visualization:** Donut/Bar chart with clear legends

#### Time Filters (Quick Access)
- **Current Month:** July 2025
- **Last 3 Months:** May, June, July 2025
- **Last 6 Months:** Feb, Mar, Apr, May, Jun, Jul 2025
- **Custom Range:** Date picker for specific periods

### 2. Lead Funnel Report

#### Filters
- **Time Range:** Date picker with quick filters
- **Bank:** Multi-select dropdown
- **Card:** Dependent on bank selection
- **Username:** Multi-select with search

#### KPI Summary
**Total Clicks**
- **Source:** COUNT(exit_id) from exitclicks table
- **Relation:** exitclicks.clean_exit = raw.clean_exit

**Leads**
- **Calculation:** Same as homepage
- **Comparison:** Month-over-month percentage

**Approval Rate** 
- **Display:** Percentage + absolute numbers
- **Format:** "18.6% (223 of 1,200)"

**Rejection Rate**
- **Calculation:** COUNT(stage_code = 'r') / COUNT(application_id) * 100

#### Funnel Visualization
**Stage Breakdown:**
1. **Clicks:** COUNT(exitclicks.exit_id)
2. **Leads:** COUNT(raw.application_id) 
3. **Incomplete:** COUNT(stage_code IN ('a','b'))
4. **KYC:** COUNT(stage_code IN ('c','d'))
5. **Verification:** COUNT(stage_code IN ('e','f'))
6. **Expired:** COUNT(stage_code = 'y')
7. **Rejected:** COUNT(stage_code = 'r')
8. **Approved:** COUNT(stage_code IN ('w','z'))

**Chart Type:** Horizontal bar chart with percentages and absolute numbers

### 3. Detailed Lead Level Report

#### Search Functionality
- **Fields:** application_id, applicant_name, card_name, bank
- **Type:** Real-time search with debouncing
- **Mobile:** Sticky search bar

#### Filters
- **Time:** Date range picker
- **Bank:** Multi-select
- **Stage:** Based on stage buckets
- **Username:** Multi-select with autocomplete

#### Quick Filters (Tabs)
- All Leads
- Incomplete Applications  
- Verification
- Approved
- Rejected
- Expired

#### KPI Row
**New Leads**
- **Calculation:** Current month vs previous month (same date range)
- **Indicator:** Percentage and absolute change

**At KYC**
- **Calculation:** COUNT(stage_code IN ('c','d'))
- **No indicator required**

**Approval Rate & Rejection Rate**
- Same calculations as funnel report

#### Data Table Structure
| Lead Information | Bank & Card | Status | Description | Commission |
|-----------------|-------------|---------|-------------|------------|
| App ID, Date, Name | Bank, Card | Stage Bucket | Raw Description | Amount, Status |

**Pagination:** 50 records per page with infinite scroll option on mobile

### 4. Lead Approval Report

#### Filters
- **Time:** Date range selector
- **Bank:** Multi-select dropdown  
- **Cards:** Conditional on bank selection
- **Users:** Multi-select with search

#### KPI Tiles
**Highest Bank Rate**
- **Display:** Bank name with approval percentage
- **Calculation:** MAX(approval_rate) by bank

**Average Processing Time**
- **Calculation:** AVG(decision_date - application_date) in days
- **Format:** "X.X days"

#### Visualization
**Bank Performance Chart**
- **Type:** Horizontal bar chart
- **Sorting:** By total leads (default), switchable to approval rate
- **Data:** Total leads vs approved leads per bank
- **Colors:** Clear distinction between total and approved

#### Top Performing Banks Table
**Sorting Options:**
- Approval Rate (default)
- Number of Approvals  
- Total Leads

**Columns:** Rank, Bank, Leads, Approvals, Rate, Avg Time

### 5. Lead Rejection Report

#### KPI Updates
- **Remove:** Revenue Impact
- **Add:** Rejection Rate (as calculated above)

#### Visualization  
**Rejection Analysis Chart**
- **Type:** Bar chart showing rejected vs total leads by bank
- **Clear Labels:** Absolute numbers and percentages
- **Sorting:** By rejection count (descending)

#### Detailed Rejection Analysis Table
**Columns:**
- **Category:** rejection_category
- **Reason:** rejection_reason  
- **Count:** Number of rejections
- **% of Total Leads:** Percentage of all applications

**Remove:** Impact column and % of Rejects column

### 6. Day/Month Drill-Down View

#### Navigation Structure
1. **Month View:** application_month level (yyyy-mm)
2. **Day View:** Drill down to specific dates within month
3. **Toggle:** Percentage view vs absolute numbers

#### Month View
**Display:** Monthly progression table
**Columns:** Month, Clicks, Leads, Incomplete, KYC, Verification, Approved, Rejected
**Interaction:** Click month to drill down to daily view

#### Day View  
**Display:** Daily breakdown for selected month
**Columns:** Date, Clicks, Leads, [Same buckets as month view]
**Toggle:** Switch between numbers and percentages

**Date Format:** DD-MM-YYYY for application_date, YYYY-MM for application_month

### Testing Strategy & Quality Assurance

#### Comprehensive Testing Architecture
```typescript
// Test setup with proper mocking
import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// Mock Supabase for consistent testing
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: [], error: null })),
        in: jest.fn(() => Promise.resolve({ data: [], error: null })),
        gte: jest.fn(() => Promise.resolve({ data: [], error: null })),
        range: jest.fn(() => Promise.resolve({ data: [], error: null }))
      }))
    }))
  }))
}));

// Custom render function with providers
const renderWithProviders = (ui: React.ReactElement, options = {}) => {
  const { queryClient = createTestQueryClient(), ...renderOptions } = options;
  
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <FilterProvider>
        {children}
      </FilterProvider>
    </QueryClientProvider>
  );
  
  return render(ui, { wrapper: Wrapper, ...renderOptions });
};
```

#### Unit Testing Strategy
```typescript
// Component testing with comprehensive coverage
describe('KPICard Component', () => {
  const mockKPIData = {
    label: 'Total Leads',
    value: 1200,
    format: 'number' as const,
    trend: { direction: 'up' as const, percentage: 15.5, period: 'vs last month' }
  };
  
  it('renders KPI data correctly', () => {
    renderWithProviders(<KPICard data={mockKPIData} />);
    expect(screen.getByText('Total Leads')).toBeInTheDocument();
    expect(screen.getByText('1,200')).toBeInTheDocument();
    expect(screen.getByText('15.5%')).toBeInTheDocument();
  });
  
  it('shows loading state with skeleton', () => {
    renderWithProviders(<KPICard data={mockKPIData} loading={true} />);
    expect(screen.getByTestId('kpi-skeleton')).toBeInTheDocument();
  });
  
  it('formats currency correctly for commission data', () => {
    const commissionData = { ...mockKPIData, format: 'currency' as const, value: 50000 };
    renderWithProviders(<KPICard data={commissionData} />);
    expect(screen.getByText('₹50,000')).toBeInTheDocument();
  });
  
  it('displays tooltip on hover interaction', async () => {
    const dataWithTooltip = { ...mockKPIData, tooltip: 'Based on approval rate' };
    renderWithProviders(<KPICard data={dataWithTooltip} />);
    
    const tooltipButton = screen.getByRole('button');
    fireEvent.mouseOver(tooltipButton);
    expect(screen.getByText('Based on approval rate')).toBeInTheDocument();
  });
});

// Filter system testing
describe('FilterBar Component', () => {
  it('renders all filter components correctly', () => {
    renderWithProviders(<FilterBar />);
    expect(screen.getByText('Time Range')).toBeInTheDocument();
    expect(screen.getByText('Banks')).toBeInTheDocument();
    expect(screen.getByText('Cards')).toBeInTheDocument();
  });
  
  it('toggles mobile filter panel on button click', () => {
    renderWithProviders(<FilterBar />);
    const toggleButton = screen.getByText('Filters');
    fireEvent.click(toggleButton);
    expect(screen.getByText('Reset Filters')).toBeInTheDocument();
  });
  
  it('applies quick time filters and updates context', () => {
    renderWithProviders(<FilterBar />);
    const currentMonthButton = screen.getByText('Current Month');
    fireEvent.click(currentMonthButton);
    expect(currentMonthButton).toHaveClass('bg-primary-500');
  });
});
```

#### API Integration Testing
```typescript
describe('Dashboard API Integration', () => {
  beforeEach(() => jest.clearAllMocks());
  
  it('fetches KPI data successfully with proper filters', async () => {
    const mockFilters = {
      timeRange: { start: '2025-07', end: '2025-07' },
      banks: ['axis', 'hdfc'],
      cards: [],
      users: [],
      stages: []
    };
    
    const result = await dashboardAPI.getKPIs(mockFilters);
    expect(result.error).toBeUndefined();
    expect(result.data).toHaveProperty('totalLeads');
    expect(result.data).toHaveProperty('approvalRate');
    expect(result.data).toHaveProperty('potentialCommission');
  });
  
  it('handles API errors gracefully with user-friendly messages', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const result = await dashboardAPI.getKPIs({} as any);
    expect(result.error).toBeDefined();
    expect(result.error).toContain('Failed to fetch');
    consoleSpy.mockRestore();
  });
  
  it('applies filters correctly in database queries', async () => {
    const filters = { banks: ['axis'], timeRange: { start: '2025-06', end: '2025-07' } };
    await dashboardAPI.getKPIs(filters);
    // Verify query was called with correct parameters
  });
});
```

#### End-to-End Testing with Playwright
```typescript
import { test, expect } from '@playwright/test';

test.describe('Complete Dashboard User Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });
  
  test('loads dashboard and displays all KPI cards', async ({ page }) => {
    await expect(page.locator('[data-testid="total-leads-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="approval-rate-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="potential-commission-card"]')).toBeVisible();
    
    // Verify numerical values are displayed
    await expect(page.locator('[data-testid="total-leads-value"]')).toContainText(/\d+/);
  });
  
  test('filter interactions work correctly across components', async ({ page }) => {
    // Test mobile filter toggle if on mobile
    if (await page.locator('[data-testid="mobile-filter-toggle"]').isVisible()) {
      await page.click('[data-testid="mobile-filter-toggle"]');
    }
    
    // Apply bank filter
    await page.click('[data-testid="bank-filter"]');
    await page.click('[data-testid="bank-option-axis"]');
    await page.click('[data-testid="bank-filter"]'); // Close dropdown
    
    // Apply time filter
    await page.click('[data-testid="last-3-months-filter"]');
    
    // Wait for data to update
    await page.waitForLoadState('networkidle');
    
    // Verify filters are applied
    await expect(page.locator('[data-testid="last-3-months-filter"]')).toHaveClass(/bg-primary-500/);
    await expect(page.locator('[data-testid="bank-filter"]')).toContainText('1 selected');
  });
  
  test('navigation between reports works seamlessly', async ({ page, isMobile }) => {
    if (isMobile) {
      // Test bottom navigation on mobile
      await page.click('[data-testid="funnel-nav-button"]');
      await expect(page).toHaveURL('/funnel');
      
      await page.click('[data-testid="detailed-nav-button"]');
      await expect(page).toHaveURL('/leads/detailed');
    } else {
      // Test sidebar navigation on desktop
      await page.click('[data-testid="sidebar-funnel-link"]');
      await expect(page).toHaveURL('/funnel');
    }
  });
  
  test('data export functionality works correctly', async ({ page }) => {
    await page.goto('/leads/detailed');
    await page.waitForLoadState('networkidle');
    
    // Click export button
    await page.click('[data-testid="export-button"]');
    await expect(page.locator('[data-testid="export-modal"]')).toBeVisible();
    
    // Test CSV export
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="export-csv-button"]');
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.csv');
  });
  
  test('mobile responsiveness and touch interactions', async ({ page, isMobile }) => {
    if (!isMobile) return;
    
    // Test swipe gestures on charts
    const chart = page.locator('[data-testid="funnel-chart"]');
    await chart.hover();
    
    // Test mobile table interactions
    await page.goto('/leads/detailed');
    const firstRow = page.locator('[data-testid="mobile-lead-card"]').first();
    await firstRow.tap();
    
    // Verify mobile card layout
    await expect(firstRow.locator('[data-testid="application-id"]')).toBeVisible();
  });
});
```

#### Performance Testing
```typescript
test.describe('Performance Benchmarks', () => {
  test('dashboard loads within performance thresholds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000); // 3 second threshold
  });
  
  test('API responses meet performance requirements', async ({ page }) => {
    const responses = [];
    
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        responses.push({
          url: response.url(),
          time: response.timing()
        });
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verify API response times
    responses.forEach(response => {
      expect(response.time).toBeLessThan(1000); // 1 second threshold
    });
  });
});
```

### Security Implementation

#### Data Security & Privacy
```typescript
// Row Level Security (RLS) policies in Supabase
-- Enable RLS on all tables
ALTER TABLE "Raw" ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE exitclicks ENABLE ROW LEVEL SECURITY;

-- User can only access their own data
CREATE POLICY "Users can view own data" ON "Raw"
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own clicks" ON exitclicks
    FOR SELECT USING (auth.uid()::text = userid::text);

-- Input validation and sanitization
export const validateFilters = (filters: FilterOptions): FilterOptions => {
  return {
    timeRange: {
      start: sanitizeMonthInput(filters.timeRange.start),
      end: sanitizeMonthInput(filters.timeRange.end),
      preset: validatePreset(filters.timeRange.preset)
    },
    banks: filters.banks.filter(bank => ALLOWED_BANKS.includes(bank)),
    cards: filters.cards.filter(card => isValidCardName(card)),
    users: filters.users.filter(id => Number.isInteger(id) && id > 0),
    stages: filters.stages.filter(stage => Object.values(STAGE_DEFINITIONS).flat().includes(stage)),
    search: sanitizeSearchInput(filters.search)
  };
};

// API rate limiting
export const rateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
```

#### Authentication & Authorization
```typescript
// Supabase Auth integration
export const authConfig = {
  providers: ['email'],
  redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
  appearance: {
    theme: ThemeSupa,
    variables: {
      default: {
        colors: {
          brand: '#2E7D32',
          brandAccent: '#1B5E20',
        }
      }
    }
  }
};

// Protected route middleware
export const withAuth = (handler: NextApiHandler): NextApiHandler => {
  return async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      
      // Add user to request context
      (req as any).user = user;
      return handler(req, res);
    } catch (error) {
      return res.status(500).json({ error: 'Authentication error' });
    }
  };
};
```

### Deployment Configuration

#### Production Environment Setup
```typescript
// next.config.js - Production optimizations
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Performance optimizations
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
  
  // PWA configuration
  pwa: {
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development'
  },
  
  // Image optimization
  images: {
    domains: ['images.unsplash.com'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
    ];
  },
  
  // Environment variables validation
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
};

module.exports = nextConfig;
```

#### Monitoring & Analytics Setup
```typescript
// Error tracking with Sentry
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
  beforeSend(event) {
    // Filter sensitive data
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
    }
    return event;
  }
});

// Performance monitoring
export const usePerformanceTracking = () => {
  useEffect(() => {
    // Track page load times
    const startTime = performance.now();
    
    return () => {
      const loadTime = performance.now() - startTime;
      analytics.track('page_load_time', {
        page: window.location.pathname,
        loadTime,
        userAgent: navigator.userAgent
      });
    };
  }, []);
};

// User analytics (privacy-compliant)
export const analytics = {
  track: (event: string, properties?: Record<string, any>) => {
    if (process.env.NODE_ENV === 'production') {
      // Send to analytics service without PII
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event,
          properties: sanitizeAnalyticsData(properties),
          timestamp: new Date().toISOString()
        })
      });
    }
  }
};
```

## Development Task Breakdown

### Phase 1: Foundation Setup (Weeks 1-2)

#### TASK 1: Project Initialization & Environment Setup
**Priority:** Critical | **Estimated Time:** 4-6 hours

**Subtasks:**
1. **Initialize Next.js Project with TypeScript**
   - Create new Next.js app with TypeScript template
   - Configure ESLint, Prettier, and Husky for code quality
   - Set up folder structure: `/pages`, `/components`, `/lib`, `/types`, `/api`

2. **Supabase Configuration**
   - Create Supabase project and obtain API keys
   - Set up environment variables (.env.local)
   - Configure Supabase client with TypeScript types
   - Test database connection with sample query

3. **UI Framework & Styling Setup**
   - Install and configure Tailwind CSS with EarnKaro colors
   - Set up UI components library (Shadcn/UI recommended)
   - Create responsive breakpoint system
   - Configure mobile-first design utilities

4. **Additional Dependencies**
   - Install chart libraries (Chart.js/Recharts)
   - Install date manipulation (date-fns)
   - Install state management (Zustand/React Query)
   - Install form validation (React Hook Form + Zod)

**Test Cases:**
- [ ] Project builds without errors
- [ ] Database connection established
- [ ] Environment variables loaded correctly
- [ ] All dependencies installed and working
- [ ] TypeScript compilation successful

#### TASK 2: Database Schema Creation & Optimization
**Priority:** Critical | **Estimated Time:** 3-4 hours

**Subtasks:**
1. **Create Database Tables**
   - Execute Raw table creation with all specified columns
   - Create Users table with proper relationships
   - Create ExitClicks table with foreign key constraints
   - Verify all relationships and data integrity

2. **Database Indexing for Performance**
   ```sql
   CREATE INDEX idx_raw_application_month ON "Raw"(application_month);
   CREATE INDEX idx_raw_user_id ON "Raw"(user_id);
   CREATE INDEX idx_raw_stage_code ON "Raw"(stage_code);
   CREATE INDEX idx_raw_bank ON "Raw"(bank);
   CREATE INDEX idx_raw_ops_status ON "Raw"(ops_status);
   CREATE INDEX idx_exitclicks_clean_exit ON exitclicks(clean_exit);
   ```

3. **Row Level Security (RLS) Setup**
   - Configure RLS policies for user-specific data access
   - Test data isolation between different users
   - Set up service role for admin access if needed

4. **Sample Data Creation**
   - Create test data generator script for consistent testing
   - Insert sample data covering all stage codes and scenarios
   - Verify data relationships and integrity constraints

**Test Cases:**
- [ ] All tables created successfully with proper schema
- [ ] Foreign key relationships working correctly
- [ ] Indexes improving query performance measurably
- [ ] RLS policies functioning correctly
- [ ] Sample data accessible through API queries

#### TASK 3: Core API Endpoints Development
**Priority:** Critical | **Estimated Time:** 8-10 hours

**Subtasks:**
1. **Authentication & User Context**
   - Set up Supabase Auth integration with email/password
   - Create user context provider for global state
   - Implement protected route middleware
   - Add user session management and token refresh

2. **Dashboard KPIs API**
   ```typescript
   GET /api/dashboard/kpis?month=2025-07&user_id=123
   ```
   - Total leads calculation with month-over-month comparison
   - Potential commission calculation (10% of total commission)
   - Approval rate calculation using stage codes w,z
   - Incomplete applications count using stage codes a,b

3. **Lead Funnel API**
   ```typescript
   GET /api/leads/funnel?filters={bank,card,user,timeRange}
   ```
   - Funnel stage calculations (clicks → leads → approved)
   - Filter implementation for bank, card, user, time range
   - Percentage calculations for each stage
   - Integration with exitclicks table for click data

4. **Detailed Leads API with Pagination**
   ```typescript
   GET /api/leads/detailed?search=&filters={...}&page=1&limit=50
   ```
   - Cursor-based pagination implementation for performance
   - Search functionality across application_id, applicant_name, card_name, bank
   - Advanced filter combinations support
   - Sorting options for different columns

5. **Reports APIs**
   ```typescript
   GET /api/reports/approval?bank=&time_range=&user_id=
   GET /api/reports/rejection?filters={...}
   GET /api/analytics/timeline?view=month&drill=day&month=2025-07
   ```

**Test Cases:**
- [ ] Authentication working correctly with proper token validation
- [ ] All API endpoints return correct data structure
- [ ] Pagination working efficiently for large datasets
- [ ] Filters applying correctly and in combination
- [ ] Performance under expected load (response times < 1s)
- [ ] Error handling for edge cases and invalid inputs

### Phase 2: Core Components (Weeks 3-4)

#### TASK 4: Reusable UI Components Development
**Priority:** High | **Estimated Time:** 6-8 hours

**Subtasks:**
1. **Layout Components**
   - Mobile-first navigation bar with user profile
   - Responsive sidebar for desktop navigation
   - Bottom navigation for mobile with active states
   - Loading states and error boundaries for graceful failures

2. **Chart Components**
   - Reusable bar chart component with customizable colors
   - Donut/pie chart for commission breakdown visualization
   - Funnel visualization component with stage progression
   - Responsive chart container with mobile optimizations

3. **Data Display Components**
   - KPI card component with trend indicators and tooltips
   - Data table with sorting, filtering, and pagination
   - Quick filter tabs component with active states
   - Search input with debouncing and clear functionality

4. **Filter Components**
   - Date range picker component with presets
   - Multi-select dropdown with search and virtualization
   - Quick time filter buttons (current month, last 3/6 months)
   - Collapsible filter drawer for mobile

5. **Utility Components**
   - Tooltip component with proper positioning
   - Export button with loading states and progress
   - Percentage toggle switch for data views
   - Status badge component for different stages

**Test Cases:**
- [ ] Components render correctly on all screen sizes
- [ ] Interactive components work as expected
- [ ] Loading and error states display properly
- [ ] Accessibility standards met (ARIA labels, keyboard navigation)
- [ ] Touch targets meet mobile usability standards (44px minimum)

#### TASK 5: Global Filter System Implementation
**Priority:** High | **Estimated Time:** 6-8 hours

**Subtasks:**
1. **Filter Context Setup**
   - Create React Context for global filter state
   - Implement useReducer for complex filter logic
   - Add filter validation and sanitization
   - Create custom hooks for filter management

2. **Time Range Filter**
   - Quick filter buttons (Current Month, Last 3/6 Months)
   - Custom date range picker with validation
   - Proper date format handling (yyyy-mm for months)
   - Filter state persistence across route changes

3. **Advanced Filters**
   - Bank multi-select with search functionality
   - Card filter dependent on bank selection
   - User multi-select with autocomplete
   - Stage filter with predefined stage buckets

4. **Mobile Filter Experience**
   - Collapsible filter drawer with smooth animations
   - Touch-friendly filter controls
   - Filter summary display with clear indicators
   - Reset filters functionality

**Test Cases:**
- [ ] Filter state managed correctly across components
- [ ] Filters work independently and in combination
- [ ] Mobile filter drawer opens and closes smoothly
- [ ] Filter validation prevents invalid inputs
- [ ] Filter state persists during navigation

#### TASK 6: Homepage Dashboard Implementation
**Priority:** High | **Estimated Time:** 6-8 hours

**Subtasks:**
1. **KPI Cards Section**
   - Total leads card with month-over-month trend indicator
   - Potential commission card with explanatory tooltip
   - Approval rate card with percentage and trend arrow
   - Incomplete applications card with action link to detailed view

2. **Commission Breakdown Visualization**
   - Interactive donut chart showing commission distribution
   - Legend with color coding and percentages
   - Hover states with detailed information
   - Mobile-friendly chart sizing and touch interactions

3. **Time Filter Integration**
   - Quick filter buttons affecting all dashboard components
   - Custom date range picker with month selection
   - Filter state management across KPIs and charts
   - Loading states during filter changes

4. **Mobile Dashboard Optimization**
   - KPI cards stack vertically on mobile devices
   - Swipeable charts for better mobile interaction
   - Optimized touch targets and spacing
   - Sticky filter bar for easy access

**Test Cases:**
- [ ] All KPIs calculate correctly with proper formatting
- [ ] Charts display accurate data with proper scaling
- [ ] Time filters update all dashboard sections simultaneously
- [ ] Mobile layout works seamlessly on various devices
- [ ] Loading states provide good user feedback

### Phase 3: Advanced Features (Weeks 5-6)

#### TASK 7: Lead Funnel Report Implementation
**Priority:** High | **Estimated Time:** 8-10 hours

**Subtasks:**
1. **Advanced Filter Panel**
   - Time range filter with calendar integration
   - Bank multi-select with search and clear options
   - Card filter that updates based on selected banks
   - Username multi-select with autocomplete functionality

2. **KPI Summary Section**
   - Total clicks calculation from exitclicks table
   - Leads count with month-over-month comparison indicators
   - Approval rate display with absolute numbers (18.6% of 1,200)
   - Rejection rate calculation and display

3. **Funnel Visualization**
   - 8-stage funnel chart implementation (Clicks → Approved)
   - Percentage and absolute number display for each stage
   - Interactive hover states with detailed information
   - Mobile-optimized horizontal bar layout

4. **Smart Insights Generation**
   - Automated insights based on funnel performance
   - Comparison with historical data and benchmarks
   - Bank-wise performance highlights and recommendations
   - Trend analysis and actionable recommendations

**Test Cases:**
- [ ] Filters work independently and in all combinations
- [ ] Funnel calculations are mathematically accurate
- [ ] Chart displays correctly on all device sizes
- [ ] Insights are relevant and provide actionable information

#### TASK 8: Detailed Lead Report Implementation
**Priority:** High | **Estimated Time:** 10-12 hours

**Subtasks:**
1. **Advanced Search Implementation**
   - Real-time search with 300ms debouncing
   - Multi-field search across application_id, applicant_name, card_name, bank
   - Search result highlighting for better UX
   - Search history and suggestions for power users

2. **Quick Filter Tabs**
   - All Leads, Incomplete, Verification, Approved, Rejected, Expired tabs
   - Active tab state management with URL synchronization
   - Filter count badges on tabs showing result numbers
   - Smooth transitions between different filtered views

3. **Advanced Data Table**
   - Paginated table with 50 records per page
   - Sortable columns with visual indicators
   - Sticky header on mobile for better navigation
   - Horizontal scroll with frozen first column

4. **Table Data Structure**
   - Lead Information: Application ID, Date, Applicant Name
   - Bank & Card: Card Name, Bank with proper formatting
   - Status: Stage bucket mapping with color coding
   - Description: Truncated description with expand option
   - Commission: Amount formatting and ops_status display

5. **Mobile Table Optimization**
   - Card-based layout replacing table on mobile
   - Collapsible rows for detailed information
   - Swipe actions for common operations
   - Touch-friendly interaction areas

**Test Cases:**
- [ ] Search returns accurate results quickly (< 300ms)
- [ ] Pagination handles large datasets efficiently
- [ ] Filters apply correctly to table data
- [ ] Mobile table layout is fully functional
- [ ] Sorting maintains current filter state

### Phase 4: Reports & Analytics (Weeks 7-8)

#### TASK 9: Approval & Rejection Reports
**Priority:** Medium | **Estimated Time:** 8-10 hours

**Subtasks:**
1. **Lead Approval Report**
   - Bank performance horizontal bar chart with clear legends
   - Highest bank rate KPI calculation and display
   - Average processing time calculation (decision_date - application_date)
   - Top performing banks table with sortable columns

2. **Lead Rejection Report**
   - Rejection rate KPI replacing revenue impact
   - Bank-wise rejection chart with clear data labels
   - Detailed rejection analysis table with categories
   - Reason breakdown with count and percentage distribution

3. **Interactive Filtering**
   - Time range filtering affecting both reports
   - Bank-specific card filtering with dependency logic
   - User-specific filtering for performance analysis
   - Export functionality for both reports

4. **Data Visualization Enhancements**
   - Clear chart labeling with percentages and absolute numbers
   - Interactive tooltips with comprehensive information
   - Color coding for easy interpretation
   - Mobile-optimized chart layouts

**Test Cases:**
- [ ] Charts display accurate bank performance comparisons
- [ ] KPI calculations match expected mathematical results
- [ ] Filtering updates all chart sections simultaneously
- [ ] Rejection analysis categories are comprehensive and accurate

#### TASK 10: Timeline Analytics Implementation
**Priority:** Medium | **Estimated Time:** 8-10 hours

**Subtasks:**
1. **Month View Implementation**
   - Monthly progression table with all funnel stages
   - Click-to-drill functionality for detailed day view
   - Percentage vs absolute number toggle
   - Export functionality for monthly data

2. **Day View Implementation**
   - Daily breakdown for selected month with navigation
   - Same funnel buckets as other reports for consistency
   - Date navigation within month (previous/next day)
   - Drill-back to month view functionality

3. **Navigation & State Management**
   - Breadcrumb navigation showing current drill level
   - URL state management for bookmarking specific views
   - Browser back/forward navigation support
   - Loading states during drill-down operations

4. **Data Aggregation Logic**
   - Proper date grouping using application_month for month view
   - Daily aggregation using application_date for day view
   - Percentage calculations for toggle mode
   - Performance optimization for large date ranges

**Test Cases:**
- [ ] Month-to-day drill-down works smoothly without delays
- [ ] Percentage toggle updates all data accurately
- [ ] Navigation maintains proper context and state
- [ ] Date grouping produces accurate aggregations

### Phase 5: Testing & Deployment (Weeks 9-10)

#### TASK 11: Comprehensive Testing Implementation
**Priority:** High | **Estimated Time:** 10-12 hours

**Subtasks:**
1. **Unit Testing**
   - Component testing with Jest and React Testing Library
   - API endpoint testing with proper mocking
   - Utility function testing with edge cases
   - State management testing for filter context

2. **Integration Testing**
   - Complete user flow testing (login → dashboard → reports)
   - API integration testing with real database calls
   - Database query testing with performance benchmarks
   - Filter interaction testing across components

3. **End-to-End Testing**
   - Critical user journeys with Playwright
   - Cross-browser compatibility testing (Chrome, Firefox, Safari)
   - Mobile device testing on real devices
   - Performance testing under load conditions

4. **Data Accuracy Testing**
   - KPI calculation verification with known datasets
   - Funnel math validation across all stages
   - Commission calculation testing with various scenarios
   - Date range filtering accuracy verification

**Test Cases:**
- [ ] Unit test coverage exceeds 80% threshold
- [ ] All critical user flows pass E2E tests
- [ ] Cross-browser compatibility verified on target browsers
- [ ] Mobile responsiveness tested on various real devices
- [ ] Data calculations match expected results with high precision

#### TASK 12: Performance Optimization & Monitoring
**Priority:** High | **Estimated Time:** 6-8 hours

**Subtasks:**
1. **Frontend Performance**
   - Bundle size optimization with code splitting
   - Lazy loading for charts and heavy components
   - Image optimization and lazy loading implementation
   - Service worker setup for offline functionality

2. **API Performance**
   - Database query optimization with explain plans
   - Response caching strategies implementation
   - API rate limiting to prevent abuse
   - Request/response compression setup

3. **Monitoring Setup**
   - Error tracking with Sentry integration
   - Performance monitoring with Vercel Analytics
   - Database monitoring and alerting setup
   - User analytics (privacy-compliant) implementation

4. **Mobile Performance**
   - Touch-friendly interactions with proper feedback
   - Swipe gestures for navigation enhancement
   - Progressive Web App features implementation
   - Offline capability with cached data

**Test Cases:**
- [ ] Page load times consistently under 3 seconds
- [ ] API responses meet specified performance targets
- [ ] Mobile interactions feel responsive and native
- [ ] Error tracking captures and reports issues accurately

#### TASK 13: Deployment & Production Setup
**Priority:** High | **Estimated Time:** 4-6 hours

**Subtasks:**
1. **Environment Configuration**
   - Production Supabase database setup with proper scaling
   - Environment variables configuration and validation
   - Domain setup and SSL certificate configuration
   - CDN configuration for static assets

2. **Deployment Pipeline**
   - Vercel deployment configuration with build optimization
   - Automated deployment from main branch with testing
   - Preview deployments for feature branches
   - Rollback procedures for failed deployments

3. **Security Implementation**
   - Security headers configuration (CSP, HSTS, etc.)
   - API rate limiting and DDoS protection
   - Input validation and SQL injection prevention
   - User data encryption and privacy compliance

4. **Production Monitoring**
   - Uptime monitoring with alerting system
   - Performance monitoring and optimization
   - Error tracking and notification setup
   - User analytics and behavior tracking

**Test Cases:**
- [ ] Production deployment completes successfully
- [ ] All environment variables function correctly
- [ ] Monitoring systems actively track metrics
- [ ] Security measures are active and effective

## Task Dependencies & Critical Path

### Development Timeline
```
Week 1-2: Foundation (Tasks 1-3)
├── Task 1: Project Setup → Task 2: Database → Task 3: API
└── Critical Path: Complete foundation before building features

Week 3-4: Core Features (Tasks 4-6)  
├── Task 4: Components → Task 5: Filters → Task 6: Dashboard
└── Dependencies: Task 4 must complete before Tasks 5-6

Week 5-6: Advanced Features (Tasks 7-8)
├── Task 7: Funnel Report (depends on Tasks 4-5)
└── Task 8: Detailed Report (depends on Tasks 4-5)

Week 7-8: Reports & Analytics (Tasks 9-10)
├── Task 9: Approval/Rejection Reports (depends on Task 4)
└── Task 10: Timeline Analytics (depends on Task 4)

Week 9-10: Quality & Launch (Tasks 11-13)
├── Task 11: Testing (can start after each feature completion)
├── Task 12: Performance (parallel with Task 11)
└── Task 13: Deployment (depends on Tasks 11-12)
```

### Risk Mitigation Strategies
- **Technical Risks:** Regular code reviews, automated testing, performance monitoring
- **Timeline Risks:** Parallel development where possible, MVP-first approach
- **Quality Risks:** Continuous testing, stakeholder feedback loops
- **Performance Risks:** Early optimization, load testing, monitoring setup

## Success Criteria & Launch Metrics

### Phase-wise Success Metrics

#### Phase 1: Foundation (Weeks 1-2)
**Technical Milestones:**
- [ ] TypeScript project builds without errors
- [ ] Database schema created with proper relationships
- [ ] All core API endpoints functional with < 1s response time
- [ ] Authentication system working with user isolation
- [ ] Test coverage > 60% for core utilities

**Success Criteria:**
- Development environment fully functional
- Database performance meets benchmarks
- API layer handles expected load (100 concurrent users)

#### Phase 2: Core Features (Weeks 3-4)
**User Experience Milestones:**
- [ ] Dashboard loads in < 3 seconds on mobile
- [ ] All KPI calculations accurate within 0.1% margin
- [ ] Filter system works across all components
- [ ] Mobile responsiveness tested on 5+ devices
- [ ] Accessibility score > 90 on Lighthouse

**Success Criteria:**
- Users can complete core workflows without assistance
- Mobile experience feels native and responsive
- Data accuracy verified against known test cases

#### Phase 3: Advanced Features (Weeks 5-6)
**Functionality Milestones:**
- [ ] Funnel report displays all 8 stages correctly
- [ ] Search returns results in < 300ms
- [ ] Pagination handles 10,000+ records smoothly
- [ ] Export functionality works for CSV and Excel
- [ ] Advanced filters work in all combinations

**Success Criteria:**
- Power users can perform complex analysis tasks
- Reports provide actionable insights
- System handles production data volumes

#### Phase 4: Reports & Analytics (Weeks 7-8)
**Analytics Milestones:**
- [ ] Bank performance comparisons accurate
- [ ] Timeline drill-down works seamlessly
- [ ] Rejection analysis provides clear insights
- [ ] All calculations match manual verification
- [ ] Charts render correctly on all screen sizes

**Success Criteria:**
- Business stakeholders can make data-driven decisions
- Reports replace current manual analysis processes
- User feedback indicates value from insights

#### Phase 5: Production Launch (Weeks 9-10)
**Production Milestones:**
- [ ] 99.9% uptime during launch week
- [ ] < 2% error rate across all endpoints
- [ ] Page load times consistently < 3 seconds
- [ ] Zero critical security vulnerabilities
- [ ] User support requests < 5% of user base

**Success Criteria:**
- Successful production deployment with minimal issues
- User adoption > 80% of target audience within 2 weeks
- Performance meets all specified benchmarks

### Key Performance Indicators (KPIs)

#### User Engagement Metrics
```typescript
interface UserEngagementKPIs {
  monthlyActiveUsers: {
    target: 500; // 80% of 625 target users
    current: number;
    trend: 'up' | 'down' | 'stable';
  };
  dailyActiveUsers: {
    target: 300; // 60% of MAU
    current: number;
    averageSessionDuration: number; // Target: > 5 minutes
  };
  userRetention: {
    day1: number; // Target: > 80%
    day7: number; // Target: > 60%
    day30: number; // Target: > 40%
  };
  featureAdoption: {
    dashboardUsage: number; // Target: 95%
    reportGeneration: number; // Target: 70%
    exportFeature: number; // Target: 40%
    mobileUsage: number; // Target: > 70%
  };
}
```

#### Technical Performance KPIs
```typescript
interface TechnicalKPIs {
  performance: {
    pageLoadTime: number; // Target: < 3 seconds
    apiResponseTime: number; // Target: < 1 second
    timeToInteractive: number; // Target: < 5 seconds
    coreWebVitals: {
      LCP: number; // Target: < 2.5s
      FID: number; // Target: < 100ms
      CLS: number; // Target: < 0.1
    };
  };
  reliability: {
    uptime: number; // Target: 99.9%
    errorRate: number; // Target: < 1%
    crashFreeUsers: number; // Target: > 99.5%
  };
  scalability: {
    concurrentUsers: number; // Target: Handle 500+
    dataProcessingTime: number; // Target: < 2s for 10k records
    databaseQueryTime: number; // Target: < 500ms
  };
}
```

#### Business Impact KPIs
```typescript
interface BusinessKPIs {
  userProductivity: {
    timeToInsight: number; // Target: < 30 seconds
    reportsGenerated: number; // Target: 2x current manual process
    decisionsInfluenced: number; // Track via user feedback
  };
  platformValue: {
    approvalRateImprovement: number; // Target: 15% within 6 months
    commissionOptimization: number; // Target: 25% increase per user
    userSatisfactionScore: number; // Target: > 4.5/5
  };
  adoption: {
    weeklyActiveUsers: number; // Target: 80% of registered users
    powerUserPercentage: number; // Target: 30% use advanced features
    supportTicketReduction: number; // Target: 50% reduction in queries
  };
}
```

### User Acceptance Criteria

#### Primary User Persona: High-Performance Influencers
**Must-Have Requirements:**
- [ ] View real-time lead status across all banks
- [ ] Generate comprehensive performance reports
- [ ] Export data for external analysis
- [ ] Access historical data for trend analysis
- [ ] Receive insights for optimization

**Success Indicators:**
- Users spend > 10 minutes per session analyzing data
- 90% of high-performers use the platform weekly
- Support tickets related to lead tracking reduce by 60%

#### Secondary User Persona: Growing Influencers
**Must-Have Requirements:**
- [ ] Understand their current performance vs benchmarks
- [ ] Identify which banks/cards perform best for them
- [ ] Learn from performance insights and recommendations
- [ ] Track progress over time
- [ ] Access mobile-optimized experience

**Success Indicators:**
- Users discover actionable insights within 5 minutes
- 70% of growing influencers check platform daily
- User feedback indicates improved understanding of performance

### Quality Assurance Standards

#### Code Quality Requirements
```typescript
interface QualityStandards {
  codeQuality: {
    testCoverage: 80; // Minimum percentage
    linting: 0; // Zero ESLint warnings/errors
    typeScript: 100; // 100% TypeScript, no 'any' types
    bundleSize: 500; // Max initial bundle size in KB
  };
  performance: {
    lighthouseScore: 90; // Minimum Lighthouse performance score
    mobileScore: 85; // Minimum mobile performance score
    accessibilityScore: 95; // WCAG compliance score
  };
  security: {
    vulnerabilities: 0; // Zero high/critical vulnerabilities
    dataEncryption: true; // All sensitive data encrypted
    inputValidation: 100; // All inputs validated and sanitized
  };
}
```

#### User Experience Standards
- **Mobile-First:** All features must work seamlessly on mobile devices
- **Accessibility:** WCAG 2.1 AA compliance for inclusive design
- **Performance:** Sub-3-second load times on 3G connections
- **Usability:** New users can complete core tasks without training

### Launch Strategy & Rollout Plan

#### Soft Launch (Week 1)
**Target Audience:** 50 beta users (top performers)
**Objectives:**
- Validate core functionality under real usage
- Gather initial feedback and identify critical issues
- Test system performance with actual data
- Refine user experience based on feedback

**Success Criteria:**
- < 5% critical bug reports
- Average user session > 8 minutes
- 90% of beta users complete onboarding

#### Gradual Rollout (Weeks 2-3)
**Target Audience:** 200 active influencers
**Objectives:**
- Scale system performance testing
- Validate analytics accuracy with larger dataset
- Collect feature usage patterns
- Optimize based on usage data

**Success Criteria:**
- System handles increased load without degradation
- User engagement metrics meet targets
- Feature adoption rates align with expectations

#### Full Launch (Week 4)
**Target Audience:** All EarnKaro credit card affiliates
**Objectives:**
- Complete platform rollout to entire user base
- Establish baseline metrics for future optimization
- Launch user education and support programs
- Begin collecting long-term success metrics

**Success Criteria:**
- 80% user adoption within 2 weeks
- 99.9% system uptime maintained
- User satisfaction score > 4.0/5

### Long-term Success Roadmap

#### 3-Month Goals
- **User Adoption:** 90% of active affiliates using platform monthly
- **Performance Impact:** 10% average improvement in user approval rates
- **Platform Reliability:** 99.9% uptime with < 0.5% error rate
- **Feature Completeness:** All core features tested and optimized

#### 6-Month Goals  
- **Business Impact:** 15% improvement in affiliate approval rates
- **Revenue Growth:** 25% increase in confirmed commissions per user
- **Platform Evolution:** Advanced features based on user feedback
- **Competitive Advantage:** Industry-leading affiliate analytics platform

#### 12-Month Vision
- **Market Position:** #1 affiliate analytics platform in Indian fintech
- **Advanced Analytics:** ML-powered insights and recommendations
- **Platform Expansion:** Integration with other affiliate categories
- **Ecosystem Integration:** API access for third-party integrations

### Post-Launch Optimization Plan

#### Continuous Improvement Framework
```typescript
interface OptimizationPlan {
  dataCollection: {
    userBehaviorAnalytics: 'Daily tracking and analysis';
    performanceMetrics: 'Real-time monitoring and alerting';
    businessImpactMeasurement: 'Monthly cohort analysis';
    feedbackCollection: 'In-app feedback and user interviews';
  };
  
  optimizationCycles: {
    weekly: 'Performance optimization and bug fixes';
    biweekly: 'Feature improvements based on usage data';
    monthly: 'Major feature releases and UX enhancements';
    quarterly: 'Strategic feature additions and platform evolution';
  };
  
  successTracking: {
    userSatisfaction: 'NPS surveys and satisfaction ratings';
    businessMetrics: 'ROI tracking and commission growth';
    technicalHealth: 'System performance and reliability metrics';
    competitivePosition: 'Market analysis and feature comparison';
  };
}
```

## Risk Assessment & Mitigation

### Technical Risks

#### High-Risk Areas
1. **Database Performance at Scale**
   - **Risk:** Query performance degradation with large datasets
   - **Mitigation:** Comprehensive indexing, query optimization, caching layer
   - **Monitoring:** Real-time query performance tracking

2. **Mobile Performance**
   - **Risk:** Poor performance on low-end devices
   - **Mitigation:** Progressive loading, bundle optimization, lite mode
   - **Testing:** Regular testing on various device configurations

3. **Data Accuracy**
   - **Risk:** Calculation errors in KPIs and reports
   - **Mitigation:** Comprehensive test coverage, manual verification process
   - **Validation:** Parallel calculation verification system

#### Medium-Risk Areas
1. **API Rate Limiting**
   - **Risk:** Performance bottlenecks during peak usage
   - **Mitigation:** Intelligent caching, request optimization
   - **Scaling:** Auto-scaling infrastructure setup

2. **Cross-Browser Compatibility**
   - **Risk:** Feature inconsistencies across browsers
   - **Mitigation:** Comprehensive testing matrix, progressive enhancement
   - **Support:** Clear browser support policy

### Business Risks

#### User Adoption Challenges
- **Risk:** Low initial adoption due to change management
- **Mitigation:** Comprehensive onboarding, user training, gradual rollout
- **Success Factors:** Clear value demonstration, user success stories

#### Data Privacy & Security
- **Risk:** Data breaches or privacy violations
- **Mitigation:** Robust security measures, compliance checks, regular audits
- **Compliance:** GDPR-ready features, user data controls

### Future Enhancement Roadmap

#### Q4 2025 Planned Features
- **Push Notifications:** Real-time status updates via web notifications
- **Advanced Filtering:** AI-powered smart filters and recommendations
- **Competitive Analysis:** Benchmarking against industry averages
- **Automated Reporting:** Scheduled email reports with insights

#### 2026 Vision Features
- **Predictive Analytics:** ML models for lead scoring and optimization
- **Integration Ecosystem:** WhatsApp/Telegram bots for status updates
- **White-label Solution:** Platform licensing for other affiliate networks
- **Advanced Insights:** Natural language query interface for data exploration

This comprehensive PRD serves as both a business specification and technical implementation guide, ensuring alignment between stakeholder expectations and development execution while maintaining focus on user value and technical excellence.

## Global Rate Denominator
All rates in EK Stats use the same denominator: total leads after the current GlobalFilters are applied. 
Examples: approvalRate = approved_final / total_leads; rejectionRate = rejected / total_leads.

## Cardouts Definitions
Definitions:
- cardouts_total = COUNT(stage_code IN ('w','z'))
- approved_final = COUNT(stage_code = 'z')
All charts and KPIs must label which is used.

## API Null Handling
Rules:
- When a metric cannot be computed (e.g., denominator=0), return null in API. 
- Clients must render null as "—".

## Timeline Defaults
Timezone: Asia/Kolkata. Include dates with no activity as zero rows to preserve continuity.

## Admin Access
Admins: API routes may use Supabase service role to bypass RLS only when `filters.users` is present and caller has role=admin in JWT. Otherwise, user scope applies.

## Export Policy
Export policy: Influencer exports exclude applicant_name unless explicitly enabled by compliance. Admin exports include full schema.