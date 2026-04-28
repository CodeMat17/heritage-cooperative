import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkUserId: v.string(),
    fullName: v.string(),
    email: v.string(),
    tier: v.optional(v.string()),
    tierStartDate: v.optional(v.string()), // ISO date when package was selected
    totalContributed: v.optional(v.number()), // Total amount contributed in Naira
    canSelectPackage: v.optional(v.boolean()), // true = user is prompted to pick/confirm package (set when admin marks loan repaid)
    role: v.optional(v.string()), // "admin", "user", etc.

    // Onboarding fields
    gender: v.string(),
    nickName: v.string(),
    motherMaidenName: v.string(),
    dateOfBirth: v.string(),
    placeOfBirth: v.string(),
    nationality: v.string(),
    stateOfOrigin: v.string(),
    lga: v.string(),
    homeTown: v.string(),
    maritalStatus: v.string(),
    mobilePhoneNumber: v.string(),
    otherPhoneNumber: v.optional(v.string()),
    residentialAddress: v.string(),
    permanentAddress: v.string(),
    taxIdentificationNumber: v.optional(v.string()),
    typeOfTrade: v.string(),
    yearsInTrade: v.number(),
    otherTradeOrSkill: v.optional(v.string()),
    meansOfIdentification: v.string(),
    meansOfIdentificationStartDate: v.string(),
    meansOfIdentificationExpiryDate: v.string(),
    educationalBackground: v.string(),

    // Account details
    accountName: v.string(),
    accountNumber: v.string(),
    bankName: v.string(),
    bvn: v.string(),

    // Next of kin
    nokSurname: v.string(),
    nokFirstName: v.string(),
    nokOtherName: v.string(),
    nokTitle: v.string(),
    nokDateOfBirth: v.string(),
    nokGender: v.string(),
    nokRelationship: v.string(),
    nokPhoneNumber: v.string(),
    nokEmail: v.string(),
    nokHouseAddress: v.string(),
  })
    .index("by_clerkUserId", ["clerkUserId"])
    .index("by_email", ["email"]),

  userContributions: defineTable({
    clerkUserId: v.string(),
    fullName: v.string(),
    email: v.string(),

    // Squad transaction details
    transactionRef: v.string(),
    gatewayRef: v.optional(v.string()),
    amount: v.number(), // Amount in kobo (as received from Squad)
    merchantAmount: v.number(), // Merchant amount in kobo
    currency: v.string(),
    transactionStatus: v.string(),
    transactionType: v.string(), // "Card", "Bank", "Ussd", "MerchantUssd"

    // Payment information
    paymentType: v.optional(v.string()),
    cardType: v.optional(v.string()),
    pan: v.optional(v.string()),
    tokenId: v.optional(v.string()),
    customerMobile: v.optional(v.string()),
    isRecurring: v.optional(v.boolean()),

    // Metadata
    meta: v.optional(v.any()),
    merchantId: v.optional(v.string()),

    // Timestamps
    squadCreatedAt: v.string(), // Squad's created_at timestamp
    processedAt: v.number(), // When we processed the webhook

    // Processing status
    isProcessed: v.boolean(), // To prevent double processing
    processingNotes: v.optional(v.string()),
  })
    .index("by_clerkUserId", ["clerkUserId"])
    .index("by_transactionRef", ["transactionRef"])
    .index("by_email", ["email"])
    .index("by_status", ["transactionStatus"])
    .index("by_processed", ["isProcessed"]),

  loanApplications: defineTable({
    clerkUserId: v.string(),
    fullName: v.string(),
    email: v.string(),
    loanAmount: v.number(),
    loanPurpose: v.string(),
    repaymentPeriod: v.number(), // in months
    monthlyIncome: v.number(),
    employmentStatus: v.string(),
    employerName: v.optional(v.string()),
    employerAddress: v.optional(v.string()),
    guarantorName: v.string(),
    guarantorPhone: v.string(),
    guarantorAddress: v.string(),
    guarantorRelationship: v.string(),
    status: v.string(), // "pending", "approved", "rejected"
    submittedAt: v.number(),
    reviewedAt: v.optional(v.number()),
    reviewedBy: v.optional(v.string()),
    reviewNotes: v.optional(v.string()),
  })
    .index("by_clerkUserId", ["clerkUserId"])
    .index("by_status", ["status"])
    .index("by_submitted_at", ["submittedAt"]),
});
