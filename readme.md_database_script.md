# CRM System Documentation & Implementation Guide

## 1. Technical Stack
- **Frontend**: Single Page Application (SPA) with responsive components.
- **Backend**: Relational Database Management System (RDBMS).
- **Architecture**: Modular design with shared authentication and state management.

## 2. Installation Instructions
1. **Prerequisites**: Ensure you have a local environment with a web server and a database engine (MySQL/PostgreSQL).
2. **Database Setup**: Execute the provided `database_script.sql` to create the schema and seed initial data.
3. **Configuration**: Update the database connection credentials in the `config.json` file.
4. **Execution**: Run `npm install` followed by `npm start` to launch the application.

## 3. Database Script (SQL)
```sql
-- CRM Creation Script
CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    permissions JSON
);

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255),
    role_id INT,
    status ENUM('active', 'inactive'),
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE clients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_name VARCHAR(150),
    tax_id VARCHAR(50),
    industry VARCHAR(50),
    website VARCHAR(255),
    owner_id INT,
    FOREIGN KEY (owner_id) REFERENCES users(id)
);

-- (Further tables for Contacts, Opportunities, Quotes, Products, and Tasks are defined in the full script)
```

## 4. Functionality Overview
- **Authentication**: Secure login with role-based access.
- **Dynamic Dashboard**: Real-time KPI tracking.
- **Sales Flow**: Opportunity pipeline integrated with automated quoting.
- **Operational Efficiency**: Task management linked to clients and contacts.
