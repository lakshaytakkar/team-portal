export type ExpenseStatus = "pending" | "approved" | "rejected" | "paid"
export type ExpenseCategory = "travel" | "meals" | "supplies" | "software" | "hardware" | "other"
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled"
export type PaymentStatus = "pending" | "processing" | "completed" | "failed"
export type TransactionType = "income" | "expense" | "transfer"
export type TaxType = "income" | "sales" | "payroll" | "property" | "other"
export type SalesOrderStatus = "pending" | "confirmed" | "in-progress" | "completed" | "cancelled"
export type VendorStatus = "active" | "inactive" | "suspended"

export interface FinanceUser {
  id: string
  name: string
  email?: string
  avatar?: string
}

export interface Expense {
  id: string
  description: string
  amount: number
  category: ExpenseCategory
  status: ExpenseStatus
  date: string
  submittedBy: FinanceUser
  approvedBy?: FinanceUser
  receipt?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Vendor {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  contactPerson?: string
  status: VendorStatus
  taxId?: string
  paymentTerms?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Invoice {
  id: string
  invoiceNumber: string
  clientName: string
  clientEmail: string
  amount: number
  tax: number
  total: number
  status: InvoiceStatus
  issueDate: string
  dueDate: string
  paidDate?: string
  items: InvoiceItem[]
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
}

export interface Tax {
  id: string
  name: string
  type: TaxType
  rate: number
  amount: number
  period: string // e.g., "2024-Q1"
  dueDate: string
  status: "pending" | "paid" | "overdue"
  paidDate?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Transaction {
  id: string
  description: string
  type: TransactionType
  amount: number
  date: string
  category?: string
  account?: string
  status: PaymentStatus
  reference?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface SalesOrder {
  id: string
  orderNumber: string
  clientName: string
  clientEmail: string
  amount: number
  status: SalesOrderStatus
  orderDate: string
  expectedDeliveryDate?: string
  items: SalesOrderItem[]
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface SalesOrderItem {
  description: string
  quantity: number
  unitPrice: number
}

export interface FinancialReport {
  id: string
  name: string
  type: "profit-loss" | "balance-sheet" | "cash-flow" | "custom"
  status: "draft" | "published" | "archived"
  period: string
  generatedAt: string
  generatedBy: FinanceUser
  fileUrl?: string
  createdAt: string
}

