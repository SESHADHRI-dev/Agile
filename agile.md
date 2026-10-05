

You are an expert full-stack software engineer, AWS cloud architect, serverless developer, database engineer, UI/UX designer, DevOps engineer and machine-learning engineer.

I want you to BUILD a complete, functional and professional academic project in the current Antigravity workspace.

PROJECT TITLE:

“Cloud-Based Intelligent Inventory Management and Stock Prediction System”

PROJECT CONTEXT:

This is an Integrated M.Tech Software Engineering academic project. The objective is to develop a cloud-based web application that helps a business centrally manage products, suppliers, purchases, sales and inventory while also using historical sales data to estimate future demand and provide intelligent restocking recommendations.

This must NOT be a simple CRUD demonstration or a static frontend prototype.

Build a genuinely functional end-to-end application with working frontend, backend APIs, database operations, authentication, inventory calculations, low-stock detection, prediction, reporting, testing and AWS deployment readiness.

The application should be professional enough for a faculty demonstration and simple enough for me to understand and explain every major component.

==================================================
1. CORE PROJECT OBJECTIVES
==================================================

The application must:

1. Maintain centralized product records.
2. Maintain supplier records.
3. Record purchase transactions.
4. Record sales transactions.
5. Automatically calculate current inventory.
6. Detect low-stock products.
7. Detect out-of-stock products.
8. Display inventory and sales information through a dashboard.
9. Analyse historical sales data.
10. Predict future product demand.
11. Compare predicted demand with current inventory.
12. Generate restocking recommendations.
13. Generate useful reports.
14. Allow authorized users to access the application remotely through the cloud.

The primary inventory formula is:

Current Stock = Previous Stock + Purchases − Sales

The system should demonstrate how inventory management can move from simply recording past transactions toward supporting future restocking decisions.

==================================================
2. TECHNOLOGY STACK
==================================================

Use:

Frontend:
- React
- JavaScript
- HTML
- CSS
- Chart.js or Recharts

Backend:
- AWS Lambda
- Amazon API Gateway

Database:
- Amazon DynamoDB

Authentication:
- Amazon Cognito

Hosting:
- AWS Amplify

Storage:
- Amazon S3

Monitoring:
- Amazon CloudWatch

Prediction:
- Python where appropriate
- Pandas where useful
- A simple measurable forecasting algorithm

Version control:
- Git
- GitHub-ready project structure

Use clean modular architecture and reusable components.

==================================================
3. AWS ARCHITECTURE
==================================================

Implement the following logical architecture:

USER
↓
REACT WEB APPLICATION
↓
AWS AMPLIFY
↓
AMAZON COGNITO AUTHENTICATION
↓
AMAZON API GATEWAY
↓
AWS LAMBDA
↓
AMAZON DYNAMODB

Additional services:

APPLICATION
→ AMAZON S3
for reports, exported files and documents

LAMBDA/API
→ AMAZON CLOUDWATCH
for logs, metrics and monitoring

The application should follow a serverless architecture wherever practical.

AWS services and their roles:

AWS Amplify:
Deploy and host the frontend.

Amazon Cognito:
Authentication and authorization.

Amazon API Gateway:
Expose REST APIs to the frontend.

AWS Lambda:
Execute backend business logic.

Amazon DynamoDB:
Store products, suppliers, purchases, sales, inventory and prediction-related information.

Amazon S3:
Store reports and exported files.

Amazon CloudWatch:
Monitoring, logs and operational visibility.

Do not introduce unnecessary AWS services.

==================================================
4. VERY IMPORTANT — AWS FREE TIER / COST CONTROL
==================================================

I am a student and this project must be designed primarily for AWS Free Tier or the lowest practical cost.

This is a major requirement.

Use Free Tier or currently eligible free usage wherever possible.

Do NOT unnecessarily create expensive or continuously running infrastructure.

Avoid unless absolutely necessary:

- EC2
- RDS
- NAT Gateway
- Elastic Load Balancer
- OpenSearch
- ElastiCache
- ECS/Fargate
- GPU instances
- Dedicated servers
- Paid third-party APIs
- Paid AI APIs
- Expensive external services

Prefer serverless and lightweight AWS services.

The application is intended for student-scale usage and faculty demonstration, not enterprise-scale traffic.

Use small datasets and low request volumes.

Avoid unnecessary:
- API requests
- DynamoDB scans
- Database writes
- CloudWatch logging
- S3 storage
- Repeated prediction calculations
- Continuous polling
- Background processes

Do not claim that the entire project is guaranteed to cost ₹0. AWS pricing, quotas and Free Tier eligibility can change.

Before deployment, identify AWS resources that could potentially generate charges.

Do not automatically provision expensive resources.

Create:

COST_AND_FREE_TIER.md

This document must explain:
- AWS services used
- Purpose of each service
- Expected student usage
- Free-tier/low-cost considerations
- Possible billing risks
- Cost monitoring
- Resource cleanup
- How to avoid unnecessary charges

If current AWS pricing information is needed and internet access is available, verify it using official AWS documentation.

==================================================
5. LOCAL-FIRST DEVELOPMENT
==================================================

Develop and test locally before deploying to AWS.

Recommended flow:

LOCAL DEVELOPMENT
→ LOCAL TESTING
→ INTEGRATION TESTING
→ AWS DEPLOYMENT
→ FINAL DEMONSTRATION

Do not deploy to AWS after every small code change.

Use local sample/mock data where practical.

Only deploy the final working version and required AWS components.

==================================================
6. PROJECT STRUCTURE
==================================================

Create a professional structure similar to:

/frontend
/backend
/lambda
/ml
/infrastructure
/tests
/docs

Also create:

README.md
PROJECT_PLAN.md
ARCHITECTURE.md
DATABASE_DESIGN.md
API_DOCUMENTATION.md
TESTING.md
DEPLOYMENT.md
COST_AND_FREE_TIER.md
SPRINT_PLAN.md
.env.example
.gitignore

Keep the project organized and understandable.

==================================================
7. AUTHENTICATION
==================================================

Implement Amazon Cognito authentication.

Features:

- Login
- Logout
- Protected routes
- Session management
- Authentication errors
- Basic role structure such as Admin and Staff

Unauthenticated users must not access protected application pages.

Never store passwords manually in DynamoDB.

Never hardcode:
- AWS access keys
- Secret keys
- Passwords
- API keys
- Secrets

Use environment variables and secure configuration.

==================================================
8. FRONTEND UI
==================================================

Create a modern professional inventory-management dashboard.

Use a sidebar navigation.

Required pages:

1. Login
2. Dashboard
3. Products
4. Suppliers
5. Purchases
6. Sales
7. Inventory
8. Alerts
9. Stock Prediction
10. Restocking Recommendations
11. Reports
12. Profile/Settings

The UI must contain:

- Responsive design
- Search
- Filters
- Tables
- Forms
- Cards
- Charts
- Notifications
- Loading states
- Empty states
- Error messages
- Confirmation dialogs

Do not create fake buttons.

Every important action must perform a real operation.

==================================================
9. PRODUCT MANAGEMENT
==================================================

Product fields:

- Product ID
- Product name
- Category
- Price
- Quantity
- Minimum stock level
- Supplier
- Created date
- Updated date

Functions:

- Add product
- Edit product
- View product
- Search
- Filter
- Sort
- Deactivate/delete product

Validate all inputs.

==================================================
10. SUPPLIER MANAGEMENT
==================================================

Supplier fields:

- Supplier ID
- Supplier name
- Contact person
- Phone
- Email
- Address
- Supplied products

Functions:

- Add
- Edit
- View
- Search
- Filter
- Deactivate/delete

==================================================
11. PURCHASE MANAGEMENT
==================================================

Purchase fields:

- Purchase ID
- Product
- Supplier
- Quantity
- Purchase price
- Purchase date

When a purchase is recorded:

New Stock = Previous Stock + Purchased Quantity

Automatically update inventory.

Do not allow negative or invalid quantities.

==================================================
12. SALES MANAGEMENT
==================================================

Sales fields:

- Sales ID
- Product
- Quantity sold
- Selling price
- Sales date

When a sale is recorded:

New Stock = Previous Stock − Quantity Sold

Do not allow selling more than available stock.

Store every sale because historical sales data will later be used for demand prediction.

==================================================
13. INVENTORY MANAGEMENT
==================================================

Create a dedicated inventory page.

Display:

- Product
- Current stock
- Minimum stock
- Stock status
- Last purchase
- Last sale
- Inventory value

Statuses:

IN STOCK
LOW STOCK
OUT OF STOCK

Low-stock condition:

Current Stock <= Minimum Stock Level

Out-of-stock condition:

Current Stock = 0

==================================================
14. LOW-STOCK ALERTS
==================================================

Automatically identify low-stock products.

Display alerts on:

- Dashboard
- Inventory page
- Alerts page

The backend should calculate the status rather than relying only on frontend logic.

If notifications are later required, design the system so Amazon SNS can be integrated, but do not introduce unnecessary AWS cost for the basic implementation.

==================================================
15. INTELLIGENT STOCK PREDICTION
==================================================

This is one of the key features of the project.

Use historical sales transactions stored in DynamoDB.

Prediction pipeline:

Historical Sales
↓
Data Cleaning
↓
Data Preparation
↓
Demand Forecasting
↓
Predicted Future Demand
↓
Compare with Current Stock
↓
Restocking Recommendation
↓
Dashboard

Do NOT blindly use a complicated AI model.

Start with a simple measurable forecasting approach such as:

- Moving Average
- Weighted Moving Average
- Exponential Smoothing

Select the most appropriate approach based on the available historical data.

The algorithm should be modular so it can later be replaced with a more advanced ML model.

Display:

- Historical sales
- Forecast period
- Predicted demand
- Current stock
- Safety stock
- Recommended restocking quantity

Example:

Predicted Demand = 120
Current Stock = 50
Safety Stock = 20

Recommended Restock:

120 + 20 − 50 = 90 units

Make the calculation configurable.

Do not claim sample predictions are real-world results.

==================================================
16. DATABASE
==================================================

Design DynamoDB efficiently.

Logical entities:

- Users
- Products
- Suppliers
- Purchases
- Sales
- Inventory
- Predictions

Create DATABASE_DESIGN.md.

Document:

- Attributes
- Primary keys
- Sort keys if required
- Relationships
- Query patterns
- Example records
- Indexes if necessary

Avoid unnecessary DynamoDB scans.

==================================================
17. BACKEND APIs
==================================================

Create Lambda functions or clean logical handlers for:

- Products
- Suppliers
- Purchases
- Sales
- Inventory
- Alerts
- Prediction
- Reports

API Gateway should expose appropriate:

GET
POST
PUT/PATCH
DELETE

Use correct HTTP status codes.

Implement:
- Input validation
- Error handling
- Authentication checks
- Authorization
- CORS
- Environment configuration

==================================================
18. DASHBOARD
==================================================

Display:

- Total products
- Total inventory
- Inventory value
- Low-stock products
- Out-of-stock products
- Recent purchases
- Recent sales
- Sales trends
- Inventory status
- Predicted demand
- Restocking recommendations

Use real backend/database data.

Do not hardcode statistics.

==================================================
19. REPORTS
==================================================

Create reports for:

- Inventory
- Sales
- Purchases
- Low-stock products
- Predictions
- Restocking recommendations

Provide CSV export.

Provide PDF export if practical.

Use S3 for report storage in the AWS deployment.

==================================================
20. SAMPLE DATA
==================================================

Create realistic development/demo data.

Include:

- 10–20 products
- Multiple suppliers
- Multiple purchases
- Multiple sales
- Historical sales over multiple dates

This must be clearly identified as SAMPLE/DEMO DATA.

The dataset should be sufficient to demonstrate demand prediction.

==================================================
21. TESTING
==================================================

Create TESTING.md.

Implement:

- Unit testing
- API testing
- Integration testing
- System testing
- Authentication testing
- Prediction testing
- Deployment testing

Mandatory test cases:

100 stock + 50 purchase = 150

150 stock − 30 sale = 120

10 stock with minimum 20 = LOW STOCK

0 stock = OUT OF STOCK

10 stock with sale quantity 15 = REJECT

Also test:
- Negative quantities
- Missing fields
- Invalid product
- Invalid supplier
- Unauthorized API access
- Duplicate transactions
- Database failures
- API failures
- Prediction failures

==================================================
22. AGILE DEVELOPMENT
==================================================

Use six logical sprints:

Sprint 1:
Requirement analysis, project setup and authentication

Sprint 2:
Product and supplier management

Sprint 3:
Purchase and sales management

Sprint 4:
Inventory and low-stock alerts

Sprint 5:
Dashboard, stock prediction and restocking recommendation

Sprint 6:
Testing, deployment and final improvements

Create SPRINT_PLAN.md.

==================================================
23. SECURITY
==================================================

Use:

- Cognito authentication
- IAM least privilege
- Protected APIs
- Input validation
- Secure CORS
- Environment variables
- No hardcoded credentials
- Proper error handling

Create .gitignore.

Never commit secrets.

==================================================
24. DOCUMENTATION
==================================================

Documentation must be understandable to a student.

Create:

README.md
PROJECT_PLAN.md
ARCHITECTURE.md
DATABASE_DESIGN.md
API_DOCUMENTATION.md
TESTING.md
DEPLOYMENT.md
COST_AND_FREE_TIER.md
SPRINT_PLAN.md

Explain how every major component works.

==================================================
25. GITHUB READINESS
==================================================

Prepare the project for GitHub.

Include:

- Clean folder structure
- README
- .gitignore
- .env.example
- Meaningful comments
- Meaningful commit-ready structure

Never include real AWS credentials.

==================================================
26. AWS DEPLOYMENT
==================================================

Create a complete deployment guide explaining:

1. Cognito setup
2. DynamoDB setup
3. Lambda setup
4. API Gateway setup
5. S3 setup
6. CloudWatch setup
7. Frontend configuration
8. Amplify deployment
9. Production testing
10. Resource cleanup

Keep deployment as low-cost as possible.

==================================================
27. COMPLETE END-TO-END TEST
==================================================

Before declaring the project complete, perform this workflow:

Login
↓
Dashboard
↓
Add Product
↓
Add Supplier
↓
Record Purchase
↓
Verify Stock Increase
↓
Record Sale
↓
Verify Stock Decrease
↓
Trigger Low Stock
↓
View Alert
↓
Generate Historical Sales Data
↓
Run Prediction
↓
Generate Restocking Recommendation
↓
View Dashboard
↓
Generate Report

Fix all errors discovered.

==================================================
28. IMPORTANT DEVELOPMENT BEHAVIOUR
==================================================

Do not merely explain how to build this project.

Actually create the code, files, components, APIs, configuration, tests and documentation in the Antigravity workspace.

Work systematically:

1. Analyse
2. Plan
3. Create project structure
4. Implement
5. Test
6. Debug
7. Integrate
8. Document
9. Deploy

If an error occurs:

Identify the cause
→ Fix it
→ Run the relevant test again
→ Continue

Do not leave obvious TODO placeholders for core functionality.

Do not replace real functionality with screenshots or fake UI.

==================================================
29. FINAL FACULTY DEMONSTRATION REQUIREMENT
==================================================

The final system must allow me to demonstrate:

1. User login
2. Dashboard
3. Product creation
4. Supplier creation
5. Purchase entry
6. Automatic stock increase
7. Sales entry
8. Automatic stock decrease
9. Low-stock detection
10. Inventory status
11. Historical sales
12. Demand prediction
13. Restocking recommendation
14. Charts
15. Reports
16. Cloud deployment
17. AWS architecture
18. Monitoring/logging

The application should be visually professional and technically explainable.

==================================================
30. FINAL OUTPUT FROM ANTIGRAVITY
==================================================

After implementation, provide me with:

- Final project structure
- Technologies used
- AWS services used
- Architecture explanation
- Database explanation
- API list
- Prediction algorithm explanation
- Testing results
- Local execution instructions
- AWS deployment instructions
- Free Tier/cost considerations
- Security considerations
- Known limitations
- Faculty demonstration procedure

Most importantly, the final output must be a genuinely working:

“Cloud-Based Intelligent Inventory Management and Stock Prediction System”

It must combine cloud-based inventory management, real database operations, authentication, sales/purchase tracking, automatic inventory calculation, low-stock detection, historical sales analysis, demand prediction and intelligent restocking recommendations.

Prioritize correctness, simplicity, security, maintainability, AWS cost control and faculty-demo readiness.

Do not unnecessarily complicate the project.

Build a strong working academic project first, then improve its UI and intelligence.