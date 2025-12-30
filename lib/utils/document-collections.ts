/**
 * Document Collections Utility Functions
 * 
 * Functions for managing collection status, completeness tracking, and related operations
 */

import type { EmployeeDocument, CollectionCompleteness, CollectionStatus } from '@/lib/types/employee-documents'

/**
 * Get collection completeness statistics
 */
export function getCollectionCompleteness(
  documents: EmployeeDocument[],
  collectionId: string
): CollectionCompleteness {
  const collectionDocs = documents.filter((doc) => doc.collectionId === collectionId)
  const collectionName = collectionDocs[0]?.collection?.name || 'Unknown Collection'

  const collected = collectionDocs.filter((doc) => doc.collectionStatus === 'collected').length
  const pending = collectionDocs.filter((doc) => doc.collectionStatus === 'pending').length
  const expired = collectionDocs.filter((doc) => doc.collectionStatus === 'expired').length
  const missing = collectionDocs.filter((doc) => doc.collectionStatus === 'missing').length

  // Total required is the number of unique document types in this collection
  const uniqueTypes = new Set(collectionDocs.map((doc) => doc.documentTypeId))
  const totalRequired = uniqueTypes.size

  // Collection is complete if all required documents are collected (no pending, expired, or missing)
  const isComplete = collected === totalRequired && pending === 0 && expired === 0 && missing === 0

  return {
    collectionId,
    collectionName,
    totalRequired,
    collected,
    pending,
    expired,
    missing,
    isComplete,
  }
}

/**
 * Get all expired documents for an employee
 */
export function getExpiredDocuments(
  documents: EmployeeDocument[],
  currentDate: Date = new Date()
): EmployeeDocument[] {
  return documents.filter((doc) => {
    if (!doc.expiryDate) return false

    const expiryDate = new Date(doc.expiryDate)
    return expiryDate < currentDate && doc.collectionStatus !== 'expired'
  })
}

/**
 * Check and update expired document statuses
 * Returns list of document IDs that should be updated to 'expired' status
 */
export function checkExpiredDocuments(
  documents: EmployeeDocument[],
  currentDate: Date = new Date()
): string[] {
  const expiredDocs = getExpiredDocuments(documents, currentDate)
  return expiredDocs
    .filter((doc) => doc.collectionStatus !== 'expired')
    .map((doc) => doc.id)
}

/**
 * Get overall collection status for a collection
 * Returns 'complete', 'incomplete', 'expired', or 'missing'
 */
export function getCollectionStatus(completeness: CollectionCompleteness): 'complete' | 'incomplete' | 'expired' | 'missing' {
  if (completeness.isComplete) {
    return 'complete'
  }

  if (completeness.expired > 0) {
    return 'expired'
  }

  if (completeness.missing > 0) {
    return 'missing'
  }

  return 'incomplete'
}

/**
 * Group documents by collection
 */
export function groupDocumentsByCollection(
  documents: EmployeeDocument[]
): Map<string, EmployeeDocument[]> {
  const grouped = new Map<string, EmployeeDocument[]>()

  documents.forEach((doc) => {
    const collectionId = doc.collectionId
    if (!grouped.has(collectionId)) {
      grouped.set(collectionId, [])
    }
    grouped.get(collectionId)!.push(doc)
  })

  return grouped
}

/**
 * Get completeness for all collections
 */
export function getAllCollectionCompleteness(
  documents: EmployeeDocument[]
): CollectionCompleteness[] {
  const grouped = groupDocumentsByCollection(documents)
  const completeness: CollectionCompleteness[] = []

  grouped.forEach((docs, collectionId) => {
    completeness.push(getCollectionCompleteness(documents, collectionId))
  })

  return completeness.sort((a, b) => a.collectionName.localeCompare(b.collectionName))
}
