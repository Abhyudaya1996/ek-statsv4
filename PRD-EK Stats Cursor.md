# EK Stats - Lead Analytics Dashboard PRD (Cursor Analysis)

## Project Overview

**Product Name:** EK Stats - Lead Analytics Dashboard  
**Platform:** Web Application (Mobile-First)  
**Target Users:** EarnKaro Credit Card Affiliate Influencers  
**Tech Stack:** Next.js 14, TypeScript, Supabase, React Query, Tailwind CSS  
**Current Status:** In Development (Phase 1 - UI with Mock Data)  
**Document Version:** 1.1 (Cursor Analysis)  
**Last Updated:** January 2025  

### Vision Statement
Transform EarnKaro influencers' lead performance with intelligent analytics, providing actionable insights to maximize credit card affiliate earnings through comprehensive lead tracking and conversion optimization.

## Current Implementation Status

Based on the codebase analysis, the project is currently in **Phase 1 - UI with Mock Data** implementation, with the following components completed:

### ✅ Completed Features

#### 1. **Core Infrastructure**
- Next.js 14 project setup with TypeScript
- Tailwind CSS configuration with mobile-first approach
- Supabase client configuration
- React Query setup for data fetching
- Filter provider and context management

#### 2. **Dashboard Implementation**
- Homepage dashboard with KPI cards
- Commission breakdown chart (donut chart)
- Commission KPI cards component
- Real-time data integration with API endpoints
- Loading and error states

#### 3. **Chart Components**
- **Commission Chart**: Interactive donut chart with mobile tooltip support
- **Conversion Funnel**: Horizontal funnel visualization with stage progression
- **Conversion Flow Cards**: Card-based funnel display with breakdowns
- **Bank Performance**: Bar charts for approval/rejection analysis

#### 4. **Filter System**
- Global filter context with React Context
- Time range filters (Current, Last 3, Last 6 months)
- Custom date range picker
- Bank, card, and quality multi-select filters
- Search functionality with debouncing
- Filter validation and error handling

#### 5. **API Layer**
- RESTful API endpoints under `/api/v1/`
- Dashboard KPIs endpoint
- Commission data endpoint
- Funnel data endpoint
- Detailed leads endpoint with pagination
- Approval and rejection reports endpoints
- Timeline analytics endpoint

#### 6. **Data Management**
- Custom React Query hooks for all API calls
- Proper caching strategies (5min for dashboard, 1min for detailed data)
- Filter serialization and state management
- Type-safe API responses with Zod validation

### 🚧 In Progress Features

#### 1. **Reports Section**
- Approval reports with bank performance analysis
- Rejection reports with reason categorization
- Timeline analytics with month/day drill-down

#### 2. **Advanced Components**
- Data tables with sorting and pagination
- Export functionality (CSV/Excel)
- Mobile-optimized layouts

### 📋 Planned Features (Phase 2)

#### 1. **Database Integration**
- Supabase database schema implementation
- Row Level Security (RLS) policies
- Database indexing for performance
- Real data integration replacing mock data

#### 2. **Authentication System**
- Supabase Auth integration
- User session management
- Protected route middleware

#### 3. **Advanced Analytics**
- Predictive insights
- Performance benchmarking
- Automated recommendations

## Technical Architecture

### Frontend Stack
```typescript
// Core Dependencies
- Next.js 14 (App Router)
- TypeScript 5.3+
- Tailwind CSS 3.4+
- React 18.3
- React Query 5.51 (@tanstack/react-query)

// UI & Charts
- Recharts 2.10 (Chart library)
- Lucide React 0.447 (Icons)
- React DatePicker 8.4
- Custom UI components

// Data & Validation
- Zod 3.23 (Schema validation)
- date-fns 3.6 (Date utilities)
- Supabase JS 2.39
```

### Database Schema (Planned)
```sql
-- Core Tables Structure
Raw Applications Table:
- application_id (Primary Key)
- applicant_name, application_date, bank, card_name
- stage_code, sub_stage, rejection_reason
- total_commission, ops_status
- user_id (Foreign Key)

Users Table:
- user_id (Primary Key)
- username, role

Exit Clicks Table:
- exit_id (Primary Key)
- userid (Foreign Key)
- clickdate, store_name, product_id
```

### API Architecture
```typescript
// API Endpoint Structure
GET /api/v1/dashboard/kpis         // Dashboard KPIs
GET /api/v1/dashboard/commission   // Commission breakdown
GET /api/v1/leads/funnel          // Funnel analytics
GET /api/v1/leads/detailed        // Detailed leads with pagination
GET /api/v1/reports/approval      // Approval reports
GET /api/v1/reports/rejection     // Rejection reports
GET /api/v1/analytics/timeline    // Timeline analytics

// Response Format
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}
```

### State Management
```typescript
// Filter Context Structure
interface FilterOptions {
  timeRange: {
    start: string;        // YYYY-MM format
    end: string;
    preset?: 'current_month' | 'last_3_months' | 'last_6_months' | 'custom';
  };
  banks: string[];
  cards: string[];
  users: number[];
  stages: StageCode[];
  applicationQuality: string[];
  search?: string;
}

// Stage Code System
const STAGE_CODES = {
  INCOMPLETE: ['a', 'b'],
  KYC: ['c', 'd'],
  UNDERWRITING: ['e'],
  CURING: ['f'],
  WAITING_APPROVAL: ['w'],
  APPROVED: ['z'],
  REJECTED: ['r', 'r2'],
  EXPIRED: ['y'],
  NON_COMMISSIONABLE: ['x'],
};
```

## Feature Specifications

### 1. Dashboard Overview

#### KPI Cards
- **Total Leads**: Count of applications for current time filter
- **Potential Commission**: 10% of total commission (configurable)
- **Approval Rate**: Percentage of approved applications
- **Card Outs**: Total approved and waiting approval cards

#### Commission Breakdown
- Interactive donut chart showing commission distribution
- Categories: Pending, Confirmed, Paid, Requested, Cancelled
- Mobile-optimized with touch interactions
- Center display showing total commission

### 2. Funnel Analytics

#### Conversion Flow
- 8-stage funnel: Clicks → Leads → Incomplete → KYC → Verification → Approved/Rejected
- Horizontal bar chart with percentages and absolute numbers
- Quality breakdown table (Good/Avg/Bad/Unknown)
- Interactive tooltips with detailed information

#### Flow Cards
- Card-based display for mobile optimization
- Stage-by-stage breakdown with sub-categories
- Color-coded progress indicators
- Hover states and animations

### 3. Filter System

#### Global Filters
- **Time Range**: Quick presets (Current, Last 3, Last 6 months) + custom range
- **Banks**: Multi-select dropdown with search
- **Cards**: Dependent on bank selection
- **Quality**: Credit score quality filters
- **Search**: Real-time search across multiple fields

#### Filter Management
- Persistent state across route changes
- URL synchronization for bookmarking
- Validation with error messages
- Reset functionality

### 4. Data Visualization

#### Chart Components
- **Responsive Design**: Optimized for all screen sizes
- **Interactive Elements**: Hover states, click actions, tooltips
- **Accessibility**: ARIA labels, keyboard navigation
- **Performance**: Lazy loading, efficient re-renders

#### Mobile Optimization
- Touch-friendly interactions
- Swipe gestures for navigation
- Collapsible sections
- Bottom navigation bar

## Business Logic & Calculations

### Commission Calculations
```typescript
// Potential Commission = 10% of total_commission
potentialCommission = totalCommission * 0.1;

// Approval Rate = (Approved + Waiting) / Total Leads * 100
approvalRate = (countStages(['w', 'z']) / totalLeads) * 100;

// Card Outs = Approved + Waiting Approval
cardOuts = countStages(['w', 'z']);
```

### Stage Mapping
```typescript
// Stage buckets for consistent reporting
const STAGE_BUCKETS = {
  incomplete: ['a', 'b'],      // User action pending
  kyc: ['c', 'd'],             // KYC verification
  verification: ['e', 'f'],     // Document verification
  approved: ['w', 'z'],        // Approved/waiting
  rejected: ['r', 'r2'],       // Rejected
  expired: ['y'],              // Expired applications
  nonCommissionable: ['x']     // Non-commissionable
};
```

### Data Formatting Rules
- **Dates**: Display DD-MM-YYYY, store YYYY-MM for filtering
- **Currency**: INR format using Intl.NumberFormat('en-IN')
- **Percentages**: 1 decimal place with "%" suffix
- **Division by zero**: Display "—" instead of 0% or error
- **NULL quality**: Display as "Unknown"

## User Experience Design

### Mobile-First Approach
- **Breakpoints**: 320px (mobile), 768px (tablet), 1024px (desktop)
- **Touch Targets**: Minimum 44px for interactive elements
- **Navigation**: Bottom navigation bar on mobile
- **Gestures**: Swipe support for charts and navigation

### Accessibility (WCAG AA)
- **Contrast**: 4.5:1 minimum contrast ratio
- **Focus Management**: Visible focus rings, logical tab order
- **Screen Readers**: ARIA labels, live regions for updates
- **Keyboard Navigation**: Full keyboard accessibility

### Performance Targets
- **Page Load**: < 3 seconds on 3G connections
- **API Response**: < 1 second for all endpoints
- **Bundle Size**: < 500KB initial bundle
- **Core Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1

## Development Workflow

### Current Phase: Phase 1 - UI with Mock Data
```typescript
// Development approach
1. Build UI components with mock data
2. Implement all interactive states (loading, error, success)
3. Test responsive design across devices
4. Validate business logic with mock calculations
5. Prepare for API integration in Phase 2
```

### Quality Standards
- **TypeScript**: 100% typed, no 'any' types
- **Testing**: Unit tests for components and utilities
- **Linting**: Zero ESLint warnings/errors
- **Performance**: Lighthouse score > 90

### Code Organization
```
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable UI components
│   ├── charts/         # Chart components
│   ├── dashboard/      # Dashboard-specific components
│   ├── filters/        # Filter components
│   └── ui/             # Base UI components
├── hooks/              # Custom React hooks
├── lib/                # Utilities and configurations
├── providers/          # React Context providers
└── mock-data/          # Mock data for development
```

## Risk Assessment & Mitigation

### Technical Risks
1. **Database Performance**: Large datasets may cause slow queries
   - **Mitigation**: Proper indexing, query optimization, pagination
   
2. **Mobile Performance**: Complex charts on low-end devices
   - **Mitigation**: Progressive loading, simplified mobile views
   
3. **Data Accuracy**: Complex business logic calculations
   - **Mitigation**: Comprehensive testing, validation checks

### Business Risks
1. **User Adoption**: Learning curve for new analytics platform
   - **Mitigation**: Intuitive design, onboarding flow, training materials
   
2. **Data Privacy**: Handling sensitive financial information
   - **Mitigation**: RLS policies, encryption, compliance measures

## Success Metrics

### User Engagement
- **Monthly Active Users**: Target 80% of registered influencers
- **Session Duration**: Average > 5 minutes
- **Feature Adoption**: 70% use reports, 40% use export

### Business Impact
- **Approval Rate Improvement**: 15% within 6 months
- **Commission Growth**: 25% increase per user
- **User Satisfaction**: > 4.5/5 rating

### Technical Performance
- **Uptime**: 99.9% availability
- **Error Rate**: < 1% of requests
- **Load Time**: < 3 seconds on mobile

## Future Roadmap

### Q2 2025
- Complete Phase 2: Database integration and authentication
- Advanced filtering and search capabilities
- Export functionality (CSV/Excel)

### Q3 2025
- Predictive analytics and ML insights
- Push notifications for status updates
- Advanced reporting features

### Q4 2025
- API for third-party integrations
- White-label solution capabilities
- Advanced user management

## Conclusion

The EK Stats project represents a comprehensive analytics solution for EarnKaro influencers, built with modern web technologies and a mobile-first approach. The current implementation demonstrates strong technical foundation with React/Next.js, comprehensive state management, and well-structured component architecture.

Key strengths of the current implementation:
- **Solid Technical Foundation**: Modern stack with TypeScript, React Query, and Tailwind
- **Mobile-First Design**: Responsive components optimized for all devices
- **Comprehensive Filter System**: Advanced filtering with proper state management
- **Interactive Visualizations**: Rich charts and data displays
- **Performance Focused**: Caching strategies and optimization techniques

The project is well-positioned to deliver significant value to EarnKaro influencers by providing the analytics and insights they need to optimize their credit card affiliate performance.
