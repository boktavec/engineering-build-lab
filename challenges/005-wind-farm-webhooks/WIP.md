# WIP — Challenge 005: Wind Farm Telemetry Webhooks

## Progress note — 2026-10-29 13:06:24 EDT

### Current understanding

I have the route layout in mind and have put comments in place to mark the intended structure, following an early-return pattern. The flow I understand is to verify the HMAC signature, reject invalid signed payloads or unknown turbines, acknowledge a previously accepted event without applying it again, and prevent a distinct older reading from replacing newer turbine state. A new valid reading updates the turbine and returns success.

This feels like a straightforward implementation. I have built a webhook with HMAC verification before, though I will refresh my memory on the exact payload/signature handling. I understand the signature is supplied in a header; I currently think verification involves decrypting it with the secret and comparing the result. **Correction to verify while implementing:** HMAC signatures are not encrypted values and are not decrypted. The receiver computes the expected HMAC over the exact raw request body using the shared secret, then compares it safely with the supplied signature.

### Current focus

Turn the commented route outline into the implementation, checking the existing request-body handling so signature verification uses the exact raw body, and verify the event duplicate and stale-reading behavior against the acceptance criteria.

### AI use and ownership

- **My work and reasoning:** I planned the route's early-return structure and added comments to mark the intended code layout. I described the expected outcomes for new events, duplicate deliveries, invalid payloads, unknown turbines, and older readings.
- **AI assistance:** AI clarified that an HMAC is computed and compared, not decrypted. I have built a webhook with HMAC before and plan to refresh the mechanics while implementing this challenge.
- **Ownership boundary:** The route implementation and feature verification are still in progress; no completion or test results are recorded here.

## Progress note — 2026-10-29 15:23:47 EDT

### Current progress and reflection

The implementation is complete. The route layout and early-return flow felt straightforward, but refreshing the HMAC details and working with raw buffers took more effort than I expected. I also had to revisit how to validate an object payload manually without a library such as Zod. I estimate the challenge took about two hours.

I initially missed the separate event store and the webhook event payload shape, but caught those gaps and implemented them. I had built a webhook with HMAC before, but did not remember the verification details offhand.

### Current data-flow understanding

The request's raw body buffer is used to compute the expected HMAC so verification uses the same bytes the provider signed, rather than a parsed and re-serialized object. The route checks that the secret, signature, and raw body are present, verifies the signature, validates the parsed payload shape, confirms the turbine exists, checks for a duplicate event, and checks whether the reading is stale. A duplicate is acknowledged with HTTP 200; a stale reading is rejected. Otherwise, the event is stored and the turbine data is updated.

### Verification

- `npm test`: 3 passed.
- `npm run typecheck`: passed.
- Live API checks verified the existing list/detail responses, accepted updates, duplicate and concurrent duplicate acknowledgements, rejection of missing/invalid signatures and invalid/unknown payloads, stale-reading rejection, and signature verification over whitespace-preserving raw JSON.
- After adding signature-format validation, live checks returned HTTP 401 for short and non-hex signatures, and HTTP 200 for a valid signature.

### AI use and ownership

- **My work and reasoning:** I built the webhook route and its behavior, including the event store and payload shape, and worked through raw-body handling, signature verification, validation, duplicate handling, and stale readings.
- **AI assistance:** AI clarified HMAC/raw-body concepts and Express request handling. At my request, AI updated response statuses/messages, added tests for those response changes, and documented the chosen response behavior. I consider that assistance narrow and do not want it counted against my independent feature-implementation assessment.
- **Ownership boundary:** The core feature implementation and the response-code/message changes were not authored by the same party; tests and docs for the response changes were AI-assisted. No authorship percentage is estimated.

### Current status

The implementation and the checks listed above are complete. My main areas to reinforce are HMAC verification details, raw buffers, and manual runtime payload validation.
