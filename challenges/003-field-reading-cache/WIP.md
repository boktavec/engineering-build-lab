can # WIP — Challenge 003: Field Reading Cache

## Progress note — 2026-10-27 13:35:16 EDT

### Current understanding

I initially thought each reading would belong to a separate field, so I assumed I would not need to handle multiple readings for one field. I now understand that a field can have multiple readings, and that the reading request for a field returns an array. Part of the cache is therefore not set up around the shape I need: I need to figure out how to hold the array of readings and its TTL so I know when a new value is needed.

### Questions and discussion so far

- I asked whether the assignment required building a cache or whether Redis was appropriate. The assignment is for a short-lived cache; Redis is not required.
- I asked how a GET request uses the `fieldId` parameter. The current endpoint accepts a field ID in the URL and returns readings associated with that field.
- I asked how to work with TypeScript classes, JavaScript `Map`s, UTC timestamps, and `Date.now()` while working through the implementation.
- I have started writing a `Cache` class using a `Map`, with methods for adding, updating, deleting, and getting cached data.

### Current focus

Work out how the cached value relates to a field's collection of readings, and how its TTL relates to deciding when that value should be refreshed.

## AI use and ownership

- **AI-authored feature work:** None so far. AI has not written cache implementation or feature-specific tests.
- **My implementation work:** I have begun implementing the cache myself. The code I shared includes a `Cache` class, a `Map`, cache operations, and TTL-related timestamps. The cache feature is still in progress.
- **My reasoning so far:** I started with the assumption that a reading corresponded to a separate field. Through questions about the endpoint and its `fieldId` parameter, I recognized that one field can have multiple readings and the response is an array. I identified that the cached value and TTL still need to account for that.
- **AI assistance during implementation:** AI explained TypeScript class syntax, JavaScript `Map` operations, UTC/`Date.now()`, and the TypeScript missing-properties error. AI also explained what the existing GET endpoint returns and discussed the expected freshness behavior after successful reading submissions. I asked follow-up questions to clarify the assignment and data shape.
- **Ownership boundary:** The cache implementation and feature tests remain my responsibility. No feature implementation or feature-specific tests have been written by AI. I have not yet reported feature verification results.
- **Amount of work:** No percentage split is recorded. The feature code and the current design reasoning described above are mine, with AI providing explanations and clarification. This note records what is evidenced so far, not an estimate of effort or completion.

## My current implementation thinking

I should think of this as adding readings individually. The input to `add` is one individual reading. Each reading goes into the array associated with its field ID and has a TTL. A GET for a field should return all entries for that field ID.

I am thinking of having a function that deletes entries whose TTL has expired, and calling that function from the other cache functions. If the map has no entry for a field ID, `add` should create a key and array, then add the reading to that array. Since existing readings will not be updated, an `update` function is probably unnecessary.

My proposed starting point is the `add` function: take an individual reading, get the inserted time in seconds, and add it to the entry. If the key does not exist, create the key and array and add the entry. Remove stale readings, then return the most up-to-date readings.


