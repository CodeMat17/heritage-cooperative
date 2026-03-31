export default {
  providers: [
    {
      // Set CLERK_JWT_ISSUER_DOMAIN in the Convex Dashboard → Settings → Environment Variables
      // Value: https://evolving-snipe-20.clerk.accounts.dev
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],
};
