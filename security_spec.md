# Security Specification for Serene Botanical

## Data Invariants
1. Products must have valid numeric prices and stock.
2. Activity logs must record a valid type.
3. Every document must have an owner or be accessible by authenticated users (depending on sharing requirements). Given the request to share with friends, we'll allow authenticated users to read/write for now, but ideally, we should restrict to a specific group or an admin.

## The "Dirty Dozen" Payloads (Examples)
1. Creating a product with negative cost price.
2. Creating a product without a required field (e.g., name).
3. Modifying a product with a 2MB description string.
4. Injecting a script tag into the product name.
5. Deleting a product as an unauthenticated user.
6. Updating a product's SKU to an invalid format.
7. Creating an activity log with an invalid 'type'.
8. Spoofing the 'time' field in an activity log.
9. An authenticated user trying to delete all products at once.
10. Overflowing numeric fields with extremely large values.
11. Using a document ID that is too long or contains special characters.
12. Trying to read private activity logs without authentication.

## Test Runner (Draft)
(Implementation of firestore.rules.test.ts would go here in a real dev environment)
