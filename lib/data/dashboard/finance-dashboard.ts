export interface Transaction {
  id: string
  type: string
  description: string
  amount: number
  date: string
  status: string
  category: string
}

export interface FinancialData {
  date: string
  revenue: number
  expenses: number
}

export interface ExpenseCategoryData {
  category: string
  amount: number
  color: string
}

export const financeDashboardStats = {
  totalRevenue: 2450000,
  totalRevenueChange: 12.5,
  totalExpenses: 1850000,
  totalExpensesChange: 8.2,
  profitMargin: 24.5,
  profitMarginChange: 2.3,
  pendingInvoices: 23,
  pendingInvoicesChange: -5.1,
}

export const financialData: FinancialData[] = [
  { date: "Jan", revenue: 180000, expenses: 145000 },
  { date: "Feb", revenue: 210000, expenses: 160000 },
  { date: "Mar", revenue: 195000, expenses: 155000 },
  { date: "Apr", revenue: 230000, expenses: 175000 },
  { date: "May", revenue: 245000, expenses: 185000 },
  { date: "Jun", revenue: 260000, expenses: 190000 },
]

export const expenseCategoryData: ExpenseCategoryData[] = [
  { category: "Salaries", amount: 1200000, color: "var(--chart-1)" },
  { category: "Office Rent", amount: 240000, color: "var(--chart-2)" },
  { category: "Marketing", amount: 180000, color: "var(--chart-3)" },
  { category: "Operations", amount: 150000, color: "var(--chart-4)" },
  { category: "Other", amount: 80000, color: "var(--chart-5)" },
]

export const recentTransactions: Transaction[] = [
  {
    id: "1",
    type: "Revenue",
    description: "Invoice #1234 - TechCorp Inc.",
    amount: 125000,
    date: "2025-06-15",
    status: "Paid",
    category: "Services",
  },
  {
    id: "2",
    type: "Expense",
    description: "Office Rent - June",
    amount: 20000,
    date: "2025-06-01",
    status: "Paid",
    category: "Rent",
  },
  {
    id: "3",
    type: "Revenue",
    description: "Invoice #1235 - Global Solutions",
    amount: 85000,
    date: "2025-06-10",
    status: "Pending",
    category: "Services",
  },
  {
    id: "4",
    type: "Expense",
    description: "Marketing Campaign - Q2",
    amount: 15000,
    date: "2025-06-05",
    status: "Paid",
    category: "Marketing",
  },
]
