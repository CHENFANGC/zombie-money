# API Feedback

## LI.FI Earn API feedback

Overall, LI.FI Earn was a strong fit for a hackathon MVP because it let us ground the product in real vault data without adding authentication or backend complexity.

### What worked well

- The unauthenticated Earn Data API made it fast to build a credible demo.
- Vault discovery was straightforward enough to normalize into a consumer-friendly recommendation layer.
- It was practical to rank opportunities by trust and simplicity instead of exposing raw protocol data directly.

### What was a little harder

- The raw response shape is rich, but still requires a translation layer before it feels product-ready for a consumer UI.
- Some fields are protocol-native enough that teams still need to make product judgments around naming, summaries, and which routes feel safe to surface.
- For demo products, it would be helpful to have a more explicit “recommended stablecoin opportunities” or “consumer-safe shortlist” shape out of the box.

### Most useful endpoints in this project

- `https://earn.li.fi/v1/earn/vaults`

### How we used it

- Discover live vaults
- Normalize vault metadata
- Filter for stablecoin-friendly opportunities
- Rank one best simple route for the user

### What would make it even better

- A lighter-weight response mode optimized for consumer apps
- Clearer stablecoin categorization in the response
- A first-class “top recommended route” helper for simple UX flows
