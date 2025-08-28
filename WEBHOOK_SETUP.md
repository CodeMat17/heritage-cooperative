# Squad Webhook Setup Guide

## Overview

This guide explains how to set up Squad payment webhooks for the Heritage Cooperative application.

## Webhook URL

Your webhook URL for Squad configuration is:

```
https://your-domain.com/api/webhooks/squad
```

## Environment Variables Required

Add these to your `.env.local` file:

```bash
# Squad Configuration
SQUAD_PUBLIC_KEY=pk_test_...  # Your Squad public key
SQUAD_SECRET_KEY=sk_test_...  # Your Squad secret key

# Convex Configuration
NEXT_PUBLIC_CONVEX_URL=https://your-convex-deployment.convex.cloud
```

## Squad Dashboard Configuration

1. **Log into your Squad Dashboard**
2. **Navigate to Settings > Webhooks**
3. **Add Webhook URL**: `https://your-domain.com/api/webhooks/squad`
4. **Select Events**: Choose `charge_successful`
5. **Save Configuration**

## Webhook Security

### Important Notes:

- Squad sends encrypted webhook bodies via the `x-squad-encrypted-body` header
- You need to implement decryption using Squad's encryption key
- The current implementation parses raw JSON (for development)
- **Production requires proper decryption implementation**

### TODO: Implement Webhook Decryption

```typescript
// In app/api/webhooks/squad/route.ts
// Replace the TODO section with proper decryption:

import crypto from "crypto";

function decryptWebhookBody(encryptedBody: string, secretKey: string): any {
  // Implement Squad's decryption logic here
  // This is a placeholder - you need to implement the actual decryption
  const algorithm = "aes-256-gcm";
  // ... decryption logic
}
```

## Database Schema

The `userContributions` table stores:

- User information (clerkUserId, fullName, email)
- Transaction details (amount, currency, status)
- Payment method information
- Processing status to prevent duplicates

## Transaction Reference Checker

The webhook includes duplicate prevention:

- Checks if `transactionRef` already exists
- Prevents double processing of the same transaction
- Updates user's total contribution only once per transaction

## Testing the Webhook

1. **Test URL**: `GET https://your-domain.com/api/webhooks/squad`

   - Should return: `{"status": "webhook_endpoint_active"}`

2. **Test Payment**: Make a test payment through your app
   - Check logs for webhook processing
   - Verify contribution is recorded in database

## Monitoring

### Logs to Watch:

- Webhook receipt: `"Received Squad webhook: ..."`
- User lookup: `"User not found for email: ..."`
- Processing success: `"Successfully processed contribution: ..."`
- Duplicate prevention: `"Transaction ... already processed"`

### Database Queries:

```sql
-- Check all contributions
SELECT * FROM userContributions ORDER BY processedAt DESC;

-- Check unprocessed contributions
SELECT * FROM userContributions WHERE isProcessed = false;

-- Check user's total contribution
SELECT fullName, totalContributed FROM users WHERE email = 'user@example.com';
```

## Troubleshooting

### Common Issues:

1. **401 Unauthorized**: Check `SQUAD_PUBLIC_KEY` is correct
2. **404 User Not Found**: Ensure user completed onboarding
3. **Duplicate Transactions**: Check transaction reference handling
4. **Webhook Not Received**: Verify URL in Squad dashboard

### Debug Steps:

1. Check server logs for webhook receipt
2. Verify environment variables are set
3. Test webhook endpoint manually
4. Check database for contribution records

## Production Checklist

- [ ] Implement proper webhook decryption
- [ ] Set up monitoring and alerting
- [ ] Configure proper error handling
- [ ] Test with real payments
- [ ] Set up backup webhook processing
- [ ] Monitor for failed transactions
- [ ] Set up admin dashboard for contribution management
