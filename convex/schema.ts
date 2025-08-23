import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkUserId: v.string(),
    fullName: v.string(),
    email: v.string(),
    tier: v.optional(v.string()),
    totalContributed: v.optional(v.number()), // Total amount contributed in Naira
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
    taxIdentificationNumber: v.string(),
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
  }).index("by_clerkUserId", ["clerkUserId"]),

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
