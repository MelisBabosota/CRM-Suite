# CRM System Architecture & Database Model

## 1. Overview
The CRM is built as a single-page application (SPA) architecture with a centralized state management to ensure seamless integration between modules like Sales, Clients, and Tasks.

## 2. Database Schema (Relational Model)

### Users & Security
- **Users**: id, name, email, password_hash, role_id, status.
- **Roles**: id, name (Admin, Sales, Manager), permissions.

### Core CRM
- **Clients**: id, company_name, tax_id, industry, website, owner_id.
- **Contacts**: id, client_id, first_name, last_name, email, phone, position.
- **Products**: id, name, SKU, price, category, stock_status.

### Sales Flow
- **Opportunities**: id, client_id, name, stage (Lead, Quote, Closed), value, close_date.
- **Quotes**: id, opportunity_id, quote_number, date, total_amount, status.
- **Quote_Items**: id, quote_id, product_id, quantity, unit_price.

### Operations
- **Tasks**: id, title, description, due_date, status (Pending, Done), assigned_to (user_id), related_to (client_id).

## 3. Module Integration Logic
- **Sales -> Quotes**: Opportunities automatically pull client data into quotes.
- **Dashboard**: Aggregates data from Opportunities (revenue) and Tasks (productivity).
- **Security**: Middleware checks `role_id` before allowing access to the "Users" module.
