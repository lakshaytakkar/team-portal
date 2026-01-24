'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { resolveProfileId, resolveOrganizationId, normalizeOptional } from '@/lib/utils/foreign-keys'
import { getUserFriendlyErrorMessage, logDatabaseError } from '@/lib/utils/errors'
import type { Invoice, Expense, Transaction, Vendor, Tax, SalesOrder, InvoiceStatus, ExpenseStatus, TransactionType, PaymentStatus, TaxType, SalesOrderStatus, VendorStatus, FinanceUser } from '@/lib/types/finance'
import { getAvatarForUser } from '@/lib/utils/avatars'

// ============================================================================
// TYPES
// ============================================================================

export interface CreateInvoiceInput {
  invoiceNumber: string
  clientName: string
  clientEmail: string
  clientAddress?: string
  amount: number
  tax?: number
  total: number
  status?: InvoiceStatus
  issueDate: string
  dueDate: string
  items?: Array<{ description: string; quantity: number; unitPrice: number }>
  notes?: string
  organizationId?: string
}

export interface UpdateInvoiceInput {
  invoiceNumber?: string
  clientName?: string
  clientEmail?: string
  clientAddress?: string
  amount?: number
  tax?: number
  total?: number
  status?: InvoiceStatus
  issueDate?: string
  dueDate?: string
  paidDate?: string
  items?: Array<{ description: string; quantity: number; unitPrice: number }>
  notes?: string
  organizationId?: string
}

export interface CreateExpenseInput {
  description: string
  amount: number
  category: string
  status?: ExpenseStatus
  expenseDate: string
  receiptUrl?: string
  notes?: string
}

export interface UpdateExpenseInput {
  description?: string
  amount?: number
  category?: string
  status?: ExpenseStatus
  expenseDate?: string
  receiptUrl?: string
  notes?: string
  approvedById?: string
}

export interface CreateTransactionInput {
  description: string
  type: TransactionType
  amount: number
  transactionDate: string
  category?: string
  account?: string
  status?: PaymentStatus
  reference?: string
  notes?: string
  organizationId?: string
}

export interface UpdateTransactionInput {
  description?: string
  type?: TransactionType
  amount?: number
  transactionDate?: string
  category?: string
  account?: string
  status?: PaymentStatus
  reference?: string
  notes?: string
  organizationId?: string
}

export interface CreateVendorInput {
  name: string
  email?: string
  phone?: string
  address?: string
  contactPerson?: string
  status?: VendorStatus
  taxId?: string
  paymentTerms?: string
  notes?: string
}

export interface UpdateVendorInput {
  name?: string
  email?: string
  phone?: string
  address?: string
  contactPerson?: string
  status?: VendorStatus
  taxId?: string
  paymentTerms?: string
  notes?: string
}

export interface CreateTaxInput {
  name: string
  type: TaxType
  rate: number
  amount: number
  period: string
  dueDate: string
  status?: 'pending' | 'paid' | 'overdue'
  paidDate?: string
  notes?: string
}

export interface UpdateTaxInput {
  name?: string
  type?: TaxType
  rate?: number
  amount?: number
  period?: string
  dueDate?: string
  status?: 'pending' | 'paid' | 'overdue'
  paidDate?: string
  notes?: string
}

export interface CreateSalesOrderInput {
  orderNumber: string
  clientName: string
  clientEmail: string
  amount: number
  status?: SalesOrderStatus
  orderDate: string
  expectedDeliveryDate?: string
  items?: Array<{ description: string; quantity: number; unitPrice: number }>
  notes?: string
}

export interface UpdateSalesOrderInput {
  orderNumber?: string
  clientName?: string
  clientEmail?: string
  amount?: number
  status?: SalesOrderStatus
  orderDate?: string
  expectedDeliveryDate?: string
  items?: Array<{ description: string; quantity: number; unitPrice: number }>
  notes?: string
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    throw new Error('Not authenticated')
  }
  
  return user
}

function toFinanceUser(profile: { id: string; full_name: string | null; email: string; avatar_url: string | null } | null): FinanceUser | undefined {
  if (!profile) return undefined
  return {
    id: profile.id,
    name: profile.full_name ?? 'Unknown',
    email: profile.email,
    avatar: profile.avatar_url ?? getAvatarForUser(profile.full_name ?? 'U'),
  }
}

// ============================================================================
// INVOICES
// ============================================================================

export async function getInvoices(): Promise<Invoice[]> {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
    
    if (error) {
      logDatabaseError(error, 'getInvoices')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    return (data || []).map((row: any) => ({
      id: row.id,
      invoiceNumber: row.invoice_number,
      clientName: row.client_name,
      clientEmail: row.client_email,
      amount: Number(row.amount),
      tax: Number(row.tax || 0),
      total: Number(row.total),
      status: row.status as InvoiceStatus,
      issueDate: row.issue_date,
      dueDate: row.due_date,
      paidDate: row.paid_date || undefined,
      items: (row.items || []) as Array<{ description: string; quantity: number; unitPrice: number }>,
      notes: row.notes || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))
  } catch (error) {
    logDatabaseError(error, 'getInvoices')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

export async function getInvoice(id: string): Promise<Invoice | null> {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null
      logDatabaseError(error, 'getInvoice')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    if (!data) return null
    
    return {
      id: data.id,
      invoiceNumber: data.invoice_number,
      clientName: data.client_name,
      clientEmail: data.client_email,
      amount: Number(data.amount),
      tax: Number(data.tax || 0),
      total: Number(data.total),
      status: data.status as InvoiceStatus,
      issueDate: data.issue_date,
      dueDate: data.due_date,
      paidDate: data.paid_date || undefined,
      items: (data.items || []) as Array<{ description: string; quantity: number; unitPrice: number }>,
      notes: data.notes || undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  } catch (error) {
    logDatabaseError(error, 'getInvoice')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

export async function createInvoice(input: CreateInvoiceInput) {
  const supabase = await createClient()
  
  if (!supabase) throw new Error('Database not connected')
  
  try {
    const user = await getCurrentUser()
    
    // Normalize optional fields
    const clientAddress = normalizeOptional(input.clientAddress)
    const notes = normalizeOptional(input.notes)
    
    // Resolve foreign keys
    const organizationId = input.organizationId ? await resolveOrganizationId(input.organizationId, false) : null
    
    // Validate required fields
    if (!input.invoiceNumber || !input.clientName || !input.clientEmail || !input.amount || !input.total) {
      throw new Error('Invoice number, client name, client email, amount, and total are required')
    }
    
    const { data: newInvoice, error } = await supabase
      .from('invoices')
      .insert({
        invoice_number: input.invoiceNumber,
        client_name: input.clientName,
        client_email: input.clientEmail,
        client_address: clientAddress,
        amount: Number(input.amount),
        tax: input.tax ? Number(input.tax) : 0,
        total: Number(input.total),
        status: input.status || 'draft',
        issue_date: input.issueDate,
        due_date: input.dueDate,
        items: input.items ? JSON.stringify(input.items) : '[]',
        notes,
        organization_id: organizationId,
        created_by: user.id,
        updated_by: user.id,
      })
      .select()
      .single()
    
    if (error) {
      logDatabaseError(error, 'createInvoice')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/finance/invoices')
    return newInvoice
  } catch (error) {
    logDatabaseError(error, 'createInvoice')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

export async function updateInvoice(id: string, input: UpdateInvoiceInput) {
  const supabase = await createClient()
  
  if (!supabase) throw new Error('Database not connected')
  
  try {
    const user = await getCurrentUser()
    
    // Normalize optional fields
    const clientAddress = input.clientAddress !== undefined ? normalizeOptional(input.clientAddress) : undefined
    const notes = input.notes !== undefined ? normalizeOptional(input.notes) : undefined
    
    // Resolve foreign keys
    const organizationId = input.organizationId !== undefined
      ? (input.organizationId ? await resolveOrganizationId(input.organizationId, false) : null)
      : undefined
    
    const updateData: any = {
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    }
    
    if (input.invoiceNumber !== undefined) updateData.invoice_number = input.invoiceNumber
    if (input.clientName !== undefined) updateData.client_name = input.clientName
    if (input.clientEmail !== undefined) updateData.client_email = input.clientEmail
    if (clientAddress !== undefined) updateData.client_address = clientAddress
    if (input.amount !== undefined) updateData.amount = Number(input.amount)
    if (input.tax !== undefined) updateData.tax = Number(input.tax)
    if (input.total !== undefined) updateData.total = Number(input.total)
    if (input.status !== undefined) updateData.status = input.status
    if (input.issueDate !== undefined) updateData.issue_date = input.issueDate
    if (input.dueDate !== undefined) updateData.due_date = input.dueDate
    if (input.paidDate !== undefined) updateData.paid_date = input.paidDate || null
    if (input.items !== undefined) updateData.items = JSON.stringify(input.items)
    if (notes !== undefined) updateData.notes = notes
    if (organizationId !== undefined) updateData.organization_id = organizationId
    
    const { data: updatedInvoice, error } = await supabase
      .from('invoices')
      .update(updateData)
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single()
    
    if (error) {
      logDatabaseError(error, 'updateInvoice')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/finance/invoices')
    revalidatePath(`/finance/invoices/${id}`)
    return updatedInvoice
  } catch (error) {
    logDatabaseError(error, 'updateInvoice')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

export async function deleteInvoice(id: string) {
  const supabase = await createClient()
  
  if (!supabase) throw new Error('Database not connected')
  
  try {
    const user = await getCurrentUser()
    
    const { error } = await supabase
      .from('invoices')
      .update({
        deleted_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .eq('id', id)
    
    if (error) {
      logDatabaseError(error, 'deleteInvoice')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/finance/invoices')
  } catch (error) {
    logDatabaseError(error, 'deleteInvoice')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

// ============================================================================
// EXPENSES
// ============================================================================

export async function getExpenses(): Promise<Expense[]> {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select(`
        *,
        submitted_by_profile:profiles!expenses_submitted_by_id_fkey(id, full_name, email, avatar_url),
        approved_by_profile:profiles!expenses_approved_by_id_fkey(id, full_name, email, avatar_url)
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
    
    if (error) {
      logDatabaseError(error, 'getExpenses')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    return (data || []).map((row: any) => ({
      id: row.id,
      description: row.description,
      amount: Number(row.amount),
      category: row.category as any,
      status: row.status as ExpenseStatus,
      date: row.expense_date,
      submittedBy: toFinanceUser(row.submitted_by_profile) || {
        id: row.submitted_by_id,
        name: 'Unknown',
      },
      approvedBy: toFinanceUser(row.approved_by_profile) || undefined,
      receipt: row.receipt_url || undefined,
      notes: row.notes || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))
  } catch (error) {
    logDatabaseError(error, 'getExpenses')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

export async function getExpense(id: string): Promise<Expense | null> {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select(`
        *,
        submitted_by_profile:profiles!expenses_submitted_by_id_fkey(id, full_name, email, avatar_url),
        approved_by_profile:profiles!expenses_approved_by_id_fkey(id, full_name, email, avatar_url)
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null
      logDatabaseError(error, 'getExpense')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    if (!data) return null
    
    return {
      id: data.id,
      description: data.description,
      amount: Number(data.amount),
      category: data.category as any,
      status: data.status as ExpenseStatus,
      date: data.expense_date,
      submittedBy: toFinanceUser(data.submitted_by_profile) || {
        id: data.submitted_by_id,
        name: 'Unknown',
      },
      approvedBy: toFinanceUser(data.approved_by_profile) || undefined,
      receipt: data.receipt_url || undefined,
      notes: data.notes || undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  } catch (error) {
    logDatabaseError(error, 'getExpense')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

export async function createExpense(input: CreateExpenseInput) {
  const supabase = await createClient()
  
  if (!supabase) throw new Error('Database not connected')
  
  try {
    const user = await getCurrentUser()
    
    // Normalize optional fields
    const receiptUrl = normalizeOptional(input.receiptUrl)
    const notes = normalizeOptional(input.notes)
    
    // Validate required fields
    if (!input.description || !input.amount || !input.category || !input.expenseDate) {
      throw new Error('Description, amount, category, and expense date are required')
    }
    
    const { data: newExpense, error } = await supabase
      .from('expenses')
      .insert({
        description: input.description,
        amount: Number(input.amount),
        category: input.category,
        status: input.status || 'pending',
        expense_date: input.expenseDate,
        receipt_url: receiptUrl,
        submitted_by_id: user.id,
        notes,
        created_by: user.id,
        updated_by: user.id,
      })
      .select()
      .single()
    
    if (error) {
      logDatabaseError(error, 'createExpense')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/finance/expenses')
    return newExpense
  } catch (error) {
    logDatabaseError(error, 'createExpense')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

export async function updateExpense(id: string, input: UpdateExpenseInput) {
  const supabase = await createClient()
  
  if (!supabase) throw new Error('Database not connected')
  
  try {
    const user = await getCurrentUser()
    
    // Normalize optional fields
    const receiptUrl = input.receiptUrl !== undefined ? normalizeOptional(input.receiptUrl) : undefined
    const notes = input.notes !== undefined ? normalizeOptional(input.notes) : undefined
    
    // Resolve foreign keys
    const approvedById = input.approvedById ? await resolveProfileId(input.approvedById, false) : undefined
    
    const updateData: any = {
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    }
    
    if (input.description !== undefined) updateData.description = input.description
    if (input.amount !== undefined) updateData.amount = Number(input.amount)
    if (input.category !== undefined) updateData.category = input.category
    if (input.status !== undefined) {
      updateData.status = input.status
      if (input.status === 'approved' && approvedById) {
        updateData.approved_by_id = approvedById
        updateData.approved_at = new Date().toISOString()
      }
    }
    if (input.expenseDate !== undefined) updateData.expense_date = input.expenseDate
    if (receiptUrl !== undefined) updateData.receipt_url = receiptUrl
    if (notes !== undefined) updateData.notes = notes
    
    const { data: updatedExpense, error } = await supabase
      .from('expenses')
      .update(updateData)
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single()
    
    if (error) {
      logDatabaseError(error, 'updateExpense')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/finance/expenses')
    revalidatePath(`/finance/expenses/${id}`)
    return updatedExpense
  } catch (error) {
    logDatabaseError(error, 'updateExpense')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

export async function deleteExpense(id: string) {
  const supabase = await createClient()
  
  if (!supabase) throw new Error('Database not connected')
  
  try {
    const user = await getCurrentUser()
    
    const { error } = await supabase
      .from('expenses')
      .update({
        deleted_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .eq('id', id)
    
    if (error) {
      logDatabaseError(error, 'deleteExpense')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/finance/expenses')
  } catch (error) {
    logDatabaseError(error, 'deleteExpense')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

// ============================================================================
// TRANSACTIONS
// ============================================================================

export async function getTransactions(): Promise<Transaction[]> {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .is('deleted_at', null)
      .order('transaction_date', { ascending: false })
    
    if (error) {
      logDatabaseError(error, 'getTransactions')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    return (data || []).map((row: any) => ({
      id: row.id,
      description: row.description,
      type: row.type as TransactionType,
      amount: Number(row.amount),
      date: row.transaction_date,
      category: row.category || undefined,
      account: row.account || undefined,
      status: row.status as PaymentStatus,
      reference: row.reference || undefined,
      notes: row.notes || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))
  } catch (error) {
    logDatabaseError(error, 'getTransactions')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

export async function getTransaction(id: string): Promise<Transaction | null> {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null
      logDatabaseError(error, 'getTransaction')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    if (!data) return null
    
    return {
      id: data.id,
      description: data.description,
      type: data.type as TransactionType,
      amount: Number(data.amount),
      date: data.transaction_date,
      category: data.category || undefined,
      account: data.account || undefined,
      status: data.status as PaymentStatus,
      reference: data.reference || undefined,
      notes: data.notes || undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  } catch (error) {
    logDatabaseError(error, 'getTransaction')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

export async function createTransaction(input: CreateTransactionInput) {
  const supabase = await createClient()
  
  if (!supabase) throw new Error('Database not connected')
  
  try {
    const user = await getCurrentUser()
    
    // Normalize optional fields
    const category = normalizeOptional(input.category)
    const account = normalizeOptional(input.account)
    const reference = normalizeOptional(input.reference)
    const notes = normalizeOptional(input.notes)
    
    // Resolve foreign keys
    const organizationId = input.organizationId ? await resolveOrganizationId(input.organizationId, false) : null
    
    // Validate required fields
    if (!input.description || !input.type || !input.amount || !input.transactionDate) {
      throw new Error('Description, type, amount, and transaction date are required')
    }
    
    const { data: newTransaction, error } = await supabase
      .from('transactions')
      .insert({
        description: input.description,
        type: input.type,
        amount: Number(input.amount),
        transaction_date: input.transactionDate,
        category,
        account,
        status: input.status || 'pending',
        reference,
        notes,
        organization_id: organizationId,
        created_by: user.id,
        updated_by: user.id,
      })
      .select()
      .single()
    
    if (error) {
      logDatabaseError(error, 'createTransaction')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/finance/transactions')
    return newTransaction
  } catch (error) {
    logDatabaseError(error, 'createTransaction')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

export async function updateTransaction(id: string, input: UpdateTransactionInput) {
  const supabase = await createClient()
  
  if (!supabase) throw new Error('Database not connected')
  
  try {
    const user = await getCurrentUser()
    
    // Normalize optional fields
    const category = input.category !== undefined ? normalizeOptional(input.category) : undefined
    const account = input.account !== undefined ? normalizeOptional(input.account) : undefined
    const reference = input.reference !== undefined ? normalizeOptional(input.reference) : undefined
    const notes = input.notes !== undefined ? normalizeOptional(input.notes) : undefined
    
    // Resolve foreign keys
    const organizationId = input.organizationId !== undefined
      ? (input.organizationId ? await resolveOrganizationId(input.organizationId, false) : null)
      : undefined
    
    const updateData: any = {
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    }
    
    if (input.description !== undefined) updateData.description = input.description
    if (input.type !== undefined) updateData.type = input.type
    if (input.amount !== undefined) updateData.amount = Number(input.amount)
    if (input.transactionDate !== undefined) updateData.transaction_date = input.transactionDate
    if (category !== undefined) updateData.category = category
    if (account !== undefined) updateData.account = account
    if (input.status !== undefined) updateData.status = input.status
    if (reference !== undefined) updateData.reference = reference
    if (notes !== undefined) updateData.notes = notes
    if (organizationId !== undefined) updateData.organization_id = organizationId
    
    const { data: updatedTransaction, error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single()
    
    if (error) {
      logDatabaseError(error, 'updateTransaction')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/finance/transactions')
    revalidatePath(`/finance/transactions/${id}`)
    return updatedTransaction
  } catch (error) {
    logDatabaseError(error, 'updateTransaction')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

export async function deleteTransaction(id: string) {
  const supabase = await createClient()
  
  if (!supabase) throw new Error('Database not connected')
  
  try {
    const user = await getCurrentUser()
    
    const { error } = await supabase
      .from('transactions')
      .update({
        deleted_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .eq('id', id)
    
    if (error) {
      logDatabaseError(error, 'deleteTransaction')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/finance/transactions')
  } catch (error) {
    logDatabaseError(error, 'deleteTransaction')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

// ============================================================================
// VENDORS
// ============================================================================

export async function getVendors(): Promise<Vendor[]> {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .is('deleted_at', null)
      .order('name', { ascending: true })
    
    if (error) {
      logDatabaseError(error, 'getVendors')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    return (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      email: row.email || undefined,
      phone: row.phone || undefined,
      address: row.address || undefined,
      contactPerson: row.contact_person || undefined,
      status: row.status as VendorStatus,
      taxId: row.tax_id || undefined,
      paymentTerms: row.payment_terms || undefined,
      notes: row.notes || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))
  } catch (error) {
    logDatabaseError(error, 'getVendors')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

export async function getVendor(id: string): Promise<Vendor | null> {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null
      logDatabaseError(error, 'getVendor')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    if (!data) return null
    
    return {
      id: data.id,
      name: data.name,
      email: data.email || undefined,
      phone: data.phone || undefined,
      address: data.address || undefined,
      contactPerson: data.contact_person || undefined,
      status: data.status as VendorStatus,
      taxId: data.tax_id || undefined,
      paymentTerms: data.payment_terms || undefined,
      notes: data.notes || undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  } catch (error) {
    logDatabaseError(error, 'getVendor')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

export async function createVendor(input: CreateVendorInput) {
  const supabase = await createClient()
  
  if (!supabase) throw new Error('Database not connected')
  
  try {
    const user = await getCurrentUser()
    
    // Normalize optional fields
    const email = normalizeOptional(input.email)
    const phone = normalizeOptional(input.phone)
    const address = normalizeOptional(input.address)
    const contactPerson = normalizeOptional(input.contactPerson)
    const taxId = normalizeOptional(input.taxId)
    const paymentTerms = normalizeOptional(input.paymentTerms)
    const notes = normalizeOptional(input.notes)
    
    // Validate required fields
    if (!input.name) {
      throw new Error('Vendor name is required')
    }
    
    const { data: newVendor, error } = await supabase
      .from('vendors')
      .insert({
        name: input.name,
        email,
        phone,
        address,
        contact_person: contactPerson,
        status: input.status || 'active',
        tax_id: taxId,
        payment_terms: paymentTerms,
        notes,
        created_by: user.id,
        updated_by: user.id,
      })
      .select()
      .single()
    
    if (error) {
      logDatabaseError(error, 'createVendor')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/finance/vendors')
    return newVendor
  } catch (error) {
    logDatabaseError(error, 'createVendor')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

export async function updateVendor(id: string, input: UpdateVendorInput) {
  const supabase = await createClient()
  
  if (!supabase) throw new Error('Database not connected')
  
  try {
    const user = await getCurrentUser()
    
    // Normalize optional fields
    const email = input.email !== undefined ? normalizeOptional(input.email) : undefined
    const phone = input.phone !== undefined ? normalizeOptional(input.phone) : undefined
    const address = input.address !== undefined ? normalizeOptional(input.address) : undefined
    const contactPerson = input.contactPerson !== undefined ? normalizeOptional(input.contactPerson) : undefined
    const taxId = input.taxId !== undefined ? normalizeOptional(input.taxId) : undefined
    const paymentTerms = input.paymentTerms !== undefined ? normalizeOptional(input.paymentTerms) : undefined
    const notes = input.notes !== undefined ? normalizeOptional(input.notes) : undefined
    
    const updateData: any = {
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    }
    
    if (input.name !== undefined) updateData.name = input.name
    if (email !== undefined) updateData.email = email
    if (phone !== undefined) updateData.phone = phone
    if (address !== undefined) updateData.address = address
    if (contactPerson !== undefined) updateData.contact_person = contactPerson
    if (input.status !== undefined) updateData.status = input.status
    if (taxId !== undefined) updateData.tax_id = taxId
    if (paymentTerms !== undefined) updateData.payment_terms = paymentTerms
    if (notes !== undefined) updateData.notes = notes
    
    const { data: updatedVendor, error } = await supabase
      .from('vendors')
      .update(updateData)
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single()
    
    if (error) {
      logDatabaseError(error, 'updateVendor')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/finance/vendors')
    revalidatePath(`/finance/vendors/${id}`)
    return updatedVendor
  } catch (error) {
    logDatabaseError(error, 'updateVendor')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

export async function deleteVendor(id: string) {
  const supabase = await createClient()
  
  if (!supabase) throw new Error('Database not connected')
  
  try {
    const user = await getCurrentUser()
    
    const { error } = await supabase
      .from('vendors')
      .update({
        deleted_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .eq('id', id)
    
    if (error) {
      logDatabaseError(error, 'deleteVendor')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/finance/vendors')
  } catch (error) {
    logDatabaseError(error, 'deleteVendor')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

// ============================================================================
// TAXES
// ============================================================================

export async function getTaxes(): Promise<Tax[]> {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('taxes')
      .select('*')
      .is('deleted_at', null)
      .order('due_date', { ascending: false })
    
    if (error) {
      logDatabaseError(error, 'getTaxes')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    return (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      type: row.type as TaxType,
      rate: Number(row.rate),
      amount: Number(row.amount),
      period: row.period,
      dueDate: row.due_date,
      status: row.status as 'pending' | 'paid' | 'overdue',
      paidDate: row.paid_date || undefined,
      notes: row.notes || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))
  } catch (error) {
    logDatabaseError(error, 'getTaxes')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

export async function getTax(id: string): Promise<Tax | null> {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('taxes')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null
      logDatabaseError(error, 'getTax')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    if (!data) return null
    
    return {
      id: data.id,
      name: data.name,
      type: data.type as TaxType,
      rate: Number(data.rate),
      amount: Number(data.amount),
      period: data.period,
      dueDate: data.due_date,
      status: data.status as 'pending' | 'paid' | 'overdue',
      paidDate: data.paid_date || undefined,
      notes: data.notes || undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  } catch (error) {
    logDatabaseError(error, 'getTax')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

export async function createTax(input: CreateTaxInput) {
  const supabase = await createClient()
  
  if (!supabase) throw new Error('Database not connected')
  
  try {
    const user = await getCurrentUser()
    
    // Normalize optional fields
    const notes = normalizeOptional(input.notes)
    
    // Validate required fields
    if (!input.name || !input.type || !input.rate || !input.amount || !input.period || !input.dueDate) {
      throw new Error('Name, type, rate, amount, period, and due date are required')
    }
    
    const { data: newTax, error } = await supabase
      .from('taxes')
      .insert({
        name: input.name,
        type: input.type,
        rate: Number(input.rate),
        amount: Number(input.amount),
        period: input.period,
        due_date: input.dueDate,
        status: input.status || 'pending',
        paid_date: input.paidDate || null,
        notes,
        created_by: user.id,
        updated_by: user.id,
      })
      .select()
      .single()
    
    if (error) {
      logDatabaseError(error, 'createTax')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/finance/taxes')
    return newTax
  } catch (error) {
    logDatabaseError(error, 'createTax')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

export async function updateTax(id: string, input: UpdateTaxInput) {
  const supabase = await createClient()
  
  if (!supabase) throw new Error('Database not connected')
  
  try {
    const user = await getCurrentUser()
    
    // Normalize optional fields
    const notes = input.notes !== undefined ? normalizeOptional(input.notes) : undefined
    
    const updateData: any = {
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    }
    
    if (input.name !== undefined) updateData.name = input.name
    if (input.type !== undefined) updateData.type = input.type
    if (input.rate !== undefined) updateData.rate = Number(input.rate)
    if (input.amount !== undefined) updateData.amount = Number(input.amount)
    if (input.period !== undefined) updateData.period = input.period
    if (input.dueDate !== undefined) updateData.due_date = input.dueDate
    if (input.status !== undefined) updateData.status = input.status
    if (input.paidDate !== undefined) updateData.paid_date = input.paidDate || null
    if (notes !== undefined) updateData.notes = notes
    
    const { data: updatedTax, error } = await supabase
      .from('taxes')
      .update(updateData)
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single()
    
    if (error) {
      logDatabaseError(error, 'updateTax')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/finance/taxes')
    revalidatePath(`/finance/taxes/${id}`)
    return updatedTax
  } catch (error) {
    logDatabaseError(error, 'updateTax')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

export async function deleteTax(id: string) {
  const supabase = await createClient()
  
  if (!supabase) throw new Error('Database not connected')
  
  try {
    const user = await getCurrentUser()
    
    const { error } = await supabase
      .from('taxes')
      .update({
        deleted_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .eq('id', id)
    
    if (error) {
      logDatabaseError(error, 'deleteTax')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/finance/taxes')
  } catch (error) {
    logDatabaseError(error, 'deleteTax')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

// ============================================================================
// SALES ORDERS
// ============================================================================

export async function getSalesOrders(): Promise<SalesOrder[]> {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('sales_orders')
      .select('*')
      .is('deleted_at', null)
      .order('order_date', { ascending: false })
    
    if (error) {
      logDatabaseError(error, 'getSalesOrders')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    return (data || []).map((row: any) => ({
      id: row.id,
      orderNumber: row.order_number,
      clientName: row.client_name,
      clientEmail: row.client_email,
      amount: Number(row.amount),
      status: row.status as SalesOrderStatus,
      orderDate: row.order_date,
      expectedDeliveryDate: row.expected_delivery_date || undefined,
      items: (row.items || []) as Array<{ description: string; quantity: number; unitPrice: number }>,
      notes: row.notes || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))
  } catch (error) {
    logDatabaseError(error, 'getSalesOrders')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

export async function getSalesOrder(id: string): Promise<SalesOrder | null> {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('sales_orders')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null
      logDatabaseError(error, 'getSalesOrder')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    if (!data) return null
    
    return {
      id: data.id,
      orderNumber: data.order_number,
      clientName: data.client_name,
      clientEmail: data.client_email,
      amount: Number(data.amount),
      status: data.status as SalesOrderStatus,
      orderDate: data.order_date,
      expectedDeliveryDate: data.expected_delivery_date || undefined,
      items: (data.items || []) as Array<{ description: string; quantity: number; unitPrice: number }>,
      notes: data.notes || undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  } catch (error) {
    logDatabaseError(error, 'getSalesOrder')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

export async function createSalesOrder(input: CreateSalesOrderInput) {
  const supabase = await createClient()
  
  if (!supabase) throw new Error('Database not connected')
  
  try {
    const user = await getCurrentUser()
    
    // Normalize optional fields
    const notes = normalizeOptional(input.notes)
    
    // Validate required fields
    if (!input.orderNumber || !input.clientName || !input.clientEmail || !input.amount || !input.orderDate) {
      throw new Error('Order number, client name, client email, amount, and order date are required')
    }
    
    const { data: newSalesOrder, error } = await supabase
      .from('sales_orders')
      .insert({
        order_number: input.orderNumber,
        client_name: input.clientName,
        client_email: input.clientEmail,
        amount: Number(input.amount),
        status: input.status || 'pending',
        order_date: input.orderDate,
        expected_delivery_date: input.expectedDeliveryDate || null,
        items: input.items ? JSON.stringify(input.items) : '[]',
        notes,
        created_by: user.id,
        updated_by: user.id,
      })
      .select()
      .single()
    
    if (error) {
      logDatabaseError(error, 'createSalesOrder')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/finance/sales-orders')
    return newSalesOrder
  } catch (error) {
    logDatabaseError(error, 'createSalesOrder')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

export async function updateSalesOrder(id: string, input: UpdateSalesOrderInput) {
  const supabase = await createClient()
  
  if (!supabase) throw new Error('Database not connected')
  
  try {
    const user = await getCurrentUser()
    
    // Normalize optional fields
    const notes = input.notes !== undefined ? normalizeOptional(input.notes) : undefined
    
    const updateData: any = {
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    }
    
    if (input.orderNumber !== undefined) updateData.order_number = input.orderNumber
    if (input.clientName !== undefined) updateData.client_name = input.clientName
    if (input.clientEmail !== undefined) updateData.client_email = input.clientEmail
    if (input.amount !== undefined) updateData.amount = Number(input.amount)
    if (input.status !== undefined) updateData.status = input.status
    if (input.orderDate !== undefined) updateData.order_date = input.orderDate
    if (input.expectedDeliveryDate !== undefined) updateData.expected_delivery_date = input.expectedDeliveryDate || null
    if (input.items !== undefined) updateData.items = JSON.stringify(input.items)
    if (notes !== undefined) updateData.notes = notes
    
    const { data: updatedSalesOrder, error } = await supabase
      .from('sales_orders')
      .update(updateData)
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single()
    
    if (error) {
      logDatabaseError(error, 'updateSalesOrder')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/finance/sales-orders')
    revalidatePath(`/finance/sales-orders/${id}`)
    return updatedSalesOrder
  } catch (error) {
    logDatabaseError(error, 'updateSalesOrder')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

export async function deleteSalesOrder(id: string) {
  const supabase = await createClient()
  
  if (!supabase) throw new Error('Database not connected')
  
  try {
    const user = await getCurrentUser()
    
    const { error } = await supabase
      .from('sales_orders')
      .update({
        deleted_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .eq('id', id)
    
    if (error) {
      logDatabaseError(error, 'deleteSalesOrder')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/finance/sales-orders')
  } catch (error) {
    logDatabaseError(error, 'deleteSalesOrder')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}









