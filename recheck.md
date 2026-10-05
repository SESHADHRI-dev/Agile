FINAL FULL-SYSTEM AUDIT, TESTING, DEBUGGING AND UI POLISH

IMPORTANT:
Do NOT just tell me what is wrong. You must independently inspect, run, test, debug, fix and verify the entire project yourself.

Treat the current project as a nearly completed academic project that must be made stable, professional, clean and demonstration-ready.

PROJECT:
Cloud-Based Intelligent Inventory Management and Stock Prediction System

YOUR ROLE:
Act as a senior:
- Full-stack developer
- QA engineer
- AWS architect
- Security reviewer
- Database engineer
- UI/UX designer
- DevOps engineer
- ML/prediction engineer

Your objective is:

"Find every realistic error, bug, broken workflow, inconsistent UI, API problem, authentication problem, database problem, validation problem and deployment issue in the current project, fix them yourself, and then verify that the complete application works correctly."

DO NOT assume that existing code is correct just because it was generated earlier.

==================================================
1. FIRST: INSPECT THE ENTIRE PROJECT
==================================================

Before making changes, inspect the complete repository.

Check:

- frontend/
- backend/
- lambda/
- infrastructure/
- ml/
- tests/
- configuration files
- environment files
- package.json
- Python requirements
- API routes
- database code
- authentication code
- AWS configuration
- prediction code
- documentation

Understand how all components communicate.

Create a mental map of:

Frontend
→ Authentication
→ API
→ Backend
→ Database
→ Prediction
→ Reports
→ AWS deployment

Do not unnecessarily rewrite working code.

Only change what is required to improve correctness, reliability, usability and maintainability.

==================================================
2. RUN THE APPLICATION YOURSELF
==================================================

Actually start the application.

Run:

- Frontend
- Backend
- Required local services

Verify that there are no startup errors.

Check the terminal carefully for:

- Exceptions
- Warnings
- Import errors
- Dependency errors
- Port conflicts
- API errors
- Authentication errors
- Database errors

Do not stop after seeing the frontend load successfully.

The entire application must be tested.

==================================================
3. FIX THE CURRENT 401 UNAUTHORIZED PROBLEM
==================================================

There is currently an observed issue:

POST /api/products
returns:

401 Unauthorized

Investigate the ROOT CAUSE.

Do not simply remove authentication.

Implement a clean separation between:

LOCAL DEVELOPMENT MODE

and

AWS PRODUCTION MODE.

LOCAL:
Allow the application to be fully tested locally using a safe development authentication mechanism.

AWS:
Use Amazon Cognito authentication and JWT validation.

The frontend and backend must agree on the authentication mode.

Verify all protected endpoints, not just /api/products.

Test:

- Products
- Suppliers
- Purchases
- Sales
- Inventory
- Alerts
- Prediction
- Reports

There must be no unexpected 401 errors during normal local development.

Do not weaken production security just to make local development work.

==================================================
4. TEST EVERY FRONTEND PAGE
==================================================

Open and inspect every page individually.

Test:

1. Login
2. Dashboard
3. Inventory
4. Products
5. Suppliers
6. Purchases
7. Sales
8. Low-Stock Alerts
9. Stock Prediction
10. Restocking Recommendation
11. Reports
12. Settings/Profile

For every page check:

- Does it load?
- Are there console errors?
- Are API requests successful?
- Are buttons working?
- Are forms working?
- Are tables displaying correctly?
- Are loading states working?
- Are error states working?
- Are empty states working?
- Does refresh work?
- Does navigation work?
- Does back/forward navigation work?
- Is data persisted?
- Does the page remain usable at different screen sizes?

Do not leave any broken page.

==================================================
5. TEST COMPLETE BUSINESS WORKFLOWS
==================================================

Perform real end-to-end testing.

WORKFLOW A — PRODUCT

1. Login
2. Open Products
3. Add a product
4. Verify successful API response
5. Verify product appears
6. Refresh
7. Verify product remains
8. Edit product
9. Verify changes
10. Search product
11. Filter product
12. Deactivate/delete product
13. Verify result

WORKFLOW B — SUPPLIER

1. Add supplier
2. Verify supplier appears
3. Edit supplier
4. Search supplier
5. Verify persistence

WORKFLOW C — PURCHASE

1. Select product
2. Record purchase
3. Verify purchase record
4. Verify inventory increases

Example:

Initial stock = 100
Purchase = 50
Expected stock = 150

WORKFLOW D — SALE

1. Select product
2. Record sale
3. Verify sale record
4. Verify inventory decreases

Example:

Stock = 150
Sale = 30
Expected stock = 120

WORKFLOW E — INVALID SALE

Example:

Stock = 10
Sale = 15

Expected:
Reject transaction.

Do not allow negative inventory unless explicitly designed as a business rule.

WORKFLOW F — LOW STOCK

Example:

Current stock = 10
Minimum stock = 20

Expected:

LOW STOCK

Verify that the product appears in alerts.

WORKFLOW G — OUT OF STOCK

Current stock = 0

Expected:

OUT OF STOCK

==================================================
6. TEST DASHBOARD
==================================================

Dashboard values must come from actual application data.

Check:

- Total products
- Total inventory
- Inventory value
- Low-stock count
- Out-of-stock count
- Recent sales
- Recent purchases
- Sales charts
- Inventory charts
- Prediction information
- Restocking recommendations

Do not use hardcoded values to make the dashboard look complete.

If the database is empty, show a proper empty state.

==================================================
7. TEST STOCK PREDICTION
==================================================

Inspect the prediction implementation.

Verify:

Historical sales
→ Data preparation
→ Forecasting
→ Predicted demand
→ Current stock comparison
→ Restocking recommendation

Check that the prediction does not crash with:

- No historical data
- Very little data
- Missing dates
- Zero sales
- Multiple products
- Irregular transactions

Use a simple measurable forecasting method if appropriate.

Do not claim prediction accuracy without actually measuring it.

Make the prediction results understandable.

Display:

- Historical sales
- Forecast period
- Predicted demand
- Current stock
- Safety stock
- Recommended quantity

Verify the recommendation calculation.

Example:

Predicted demand = 120
Current stock = 50
Safety stock = 20

Recommended restock = 90

==================================================
8. DATABASE AUDIT
==================================================

Inspect the database implementation.

Verify:

- Correct schemas
- Correct IDs
- Correct relationships
- Correct data types
- No accidental duplicate records
- Correct stock updates
- Correct transaction storage
- Proper error handling
- Efficient queries

Check for race-condition risks in inventory updates where practical.

Do not use unnecessary database scans.

Make sure deleting/deactivating a product does not unexpectedly corrupt historical sales/purchase data.

==================================================
9. API AUDIT
==================================================

Inspect every API endpoint.

Verify:

- HTTP method
- Request body
- Response format
- Status codes
- Authentication
- Authorization
- Validation
- Error handling
- CORS
- Database interaction

Test APIs independently where possible.

No endpoint should silently fail.

Do not hide errors from the frontend.

Return useful error messages.

==================================================
10. AUTHENTICATION AND SECURITY AUDIT
==================================================

Verify:

- Login
- Logout
- Protected routes
- Authentication state
- Token handling
- Unauthorized requests
- Invalid tokens
- Role permissions
- API authorization

Never expose secrets.

Search the repository for accidental:

- AWS access keys
- secret keys
- passwords
- API keys
- hardcoded credentials

Fix any security problem found.

Verify .gitignore.

Ensure .env files containing secrets are not committed.

==================================================
11. UI/UX CLEANUP
==================================================

After functionality is verified, improve the UI.

Make the application:

- Clean
- Modern
- Professional
- Consistent
- Minimal
- Easy to understand
- Suitable for faculty demonstration

Do NOT completely redesign the application unnecessarily.

Improve what already exists.

Use consistent:

- Typography
- Spacing
- Borders
- Cards
- Buttons
- Icons
- Tables
- Form controls
- Colors
- Status badges
- Navigation

Fix:

- Text overlapping
- Cut-off content
- Horizontal scrolling where unnecessary
- Incorrect alignment
- Inconsistent button sizes
- Excessive empty space
- Crowded sections
- Poor contrast
- Tiny text
- Misaligned tables
- Broken responsive layouts

The application should look polished rather than over-designed.

==================================================
12. RESPONSIVE TESTING
==================================================

Test the UI at:

- Desktop
- Laptop
- Tablet-sized viewport

Ensure:

- Sidebar works
- Tables remain usable
- Forms fit correctly
- Cards resize properly
- Charts remain visible
- No content is cut off
- No unnecessary horizontal scrolling

==================================================
13. BROWSER CONSOLE AUDIT
==================================================

Open the browser developer console.

Fix:

- JavaScript errors
- React errors
- Unhandled promise rejections
- Failed network requests
- Missing assets
- Invalid DOM warnings
- React key warnings
- CORS errors

The final browser console should contain no unexpected application errors.

==================================================
14. NETWORK AUDIT
==================================================

Inspect browser Network requests.

Check:

- API URL
- HTTP method
- Request body
- Authorization header
- Response status
- Response data

Fix:

- 401
- 403
- 404
- 422
- 500
- CORS failures
- Incorrect endpoints

Do not simply suppress errors.

Fix the actual cause.

==================================================
15. ERROR HANDLING
==================================================

Every important operation must gracefully handle failure.

Examples:

Backend unavailable:
Show:
"Unable to connect to the server. Please try again."

Invalid form:
Show clear field-level validation.

Database failure:
Show a useful error.

Prediction unavailable:
Show a meaningful explanation.

Empty database:
Show an empty state rather than an error.

Never show raw stack traces to normal users.

==================================================
16. LOADING STATES
==================================================

Add appropriate loading indicators for:

- Dashboard
- Product loading
- Supplier loading
- Purchases
- Sales
- Inventory
- Prediction
- Reports

Do not allow users to repeatedly click buttons while an operation is still processing.

Disable submit buttons during active requests where appropriate.

==================================================
17. DATA VALIDATION
==================================================

Validate:

- Required fields
- Numeric values
- Positive quantities
- Prices
- Email
- Phone
- Minimum stock
- Product selection
- Supplier selection
- Dates

Validation must exist on both frontend and backend.

Never rely only on frontend validation.

==================================================
18. PERFORMANCE AUDIT
==================================================

Look for:

- Unnecessary API requests
- Repeated database requests
- Infinite rendering
- Memory leaks
- Excessive polling
- Huge bundle imports
- Duplicate components
- Unnecessary re-renders

Optimize only where necessary.

Do not over-engineer.

==================================================
19. AWS FREE-TIER SAFETY AUDIT
==================================================

Verify the project remains aligned with a student-scale AWS Free Tier/low-cost deployment.

Do not add:

- EC2
- RDS
- NAT Gateway
- expensive services
- unnecessary continuously running resources

Review:

- Lambda
- API Gateway
- DynamoDB
- S3
- Cognito
- Amplify
- CloudWatch

Check that the implementation avoids unnecessary requests and storage.

Ensure COST_AND_FREE_TIER.md accurately describes possible charges.

Never expose AWS credentials.

==================================================
20. TESTS
==================================================

Run all existing automated tests.

If tests are missing for critical functionality, add them.

At minimum verify:

- Stock calculation
- Product CRUD
- Supplier CRUD
- Purchase
- Sale
- Low-stock detection
- Out-of-stock detection
- Authentication
- API responses
- Prediction
- Restocking calculation

Fix failing tests.

Do not simply delete tests to make the project pass.

==================================================
21. CLEAN CODE AUDIT
==================================================

Inspect the source code for:

- Duplicate code
- Dead code
- Unused imports
- Unused variables
- Debug console.logs
- Temporary hacks
- Hardcoded data
- TODOs in core functionality
- Inconsistent naming
- Poor component structure

Remove unnecessary temporary/debug code.

Keep comments where they help explain important logic.

==================================================
22. DOCUMENTATION AUDIT
==================================================

Verify these files:

README.md
PROJECT_PLAN.md
ARCHITECTURE.md
DATABASE_DESIGN.md
API_DOCUMENTATION.md
TESTING.md
DEPLOYMENT.md
COST_AND_FREE_TIER.md
SPRINT_PLAN.md

Make sure documentation reflects the ACTUAL implementation.

Do not document features that do not exist.

Do not leave outdated architecture descriptions.

==================================================
23. FINAL END-TO-END DEMONSTRATION
==================================================

Perform this exact sequence yourself:

1. Start application
2. Login
3. Open Dashboard
4. Add product
5. Add supplier
6. Record purchase
7. Verify stock increase
8. Record sale
9. Verify stock decrease
10. Trigger low stock
11. Verify alert
12. Create/use historical sales
13. Run prediction
14. Generate restocking recommendation
15. View dashboard updates
16. Generate report
17. Refresh application
18. Verify data persists
19. Logout
20. Verify protected pages cannot be accessed without authentication

Fix every issue discovered.

Repeat the workflow after fixes.

==================================================
24. IMPORTANT RULE
==================================================

Do not tell me:

"Everything looks good"

unless you have actually inspected and tested it.

Do not assume functionality works.

VERIFY IT.

If you find a problem:

1. Identify it.
2. Fix it.
3. Test it.
4. Verify the fix.
5. Continue auditing.

If a fix causes another problem, resolve that too.

Do not stop after fixing the first issue.

==================================================
25. FINAL QUALITY STANDARD
==================================================

The project is considered complete only when:

- Frontend starts without errors
- Backend starts without errors
- Authentication works
- Local development authentication works correctly
- AWS production authentication architecture remains intact
- APIs work
- Database operations work
- Product management works
- Supplier management works
- Purchases work
- Sales work
- Inventory calculation works
- Low-stock alerts work
- Prediction works
- Restocking recommendations work
- Reports work
- Dashboard uses real data
- Browser console has no unexpected errors
- Network requests have no unexpected failures
- No critical automated tests fail
- UI is clean and professional
- Responsive layout works
- No secrets are exposed
- AWS architecture remains Free-Tier/low-cost oriented
- Documentation matches the actual implementation

==================================================
26. FINAL REPORT
==================================================

After completing the audit, give me a final report containing:

1. Problems found
2. Problems fixed
3. Files changed
4. Tests performed
5. Test results
6. Authentication status
7. API status
8. Database status
9. Prediction status
10. UI improvements
11. AWS readiness
12. Free-tier/cost considerations
13. Remaining limitations, if any

IMPORTANT:

Do not stop at analysis.

ACTUALLY INSPECT → RUN → TEST → FIX → RE-TEST → POLISH → VERIFY.

I want the current project to be brought to a stable, clean, error-free, faculty-demo-ready state.