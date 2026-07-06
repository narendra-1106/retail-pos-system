# Retail POS System

A modern, robust Point of Sale (POS) system built with React, Node.js, Express, and MongoDB. This system is designed for both cashiers processing orders and administrators managing inventory, staff, and analytics.

## Features

- **Dual-Mode Interface**: Distinct views for Cashiers (POS Billing) and Administrators (Analytics Dashboard).
- **Inventory Management**: Real-time stock tracking, low-stock alerts, and restock logs.
- **Order Processing**: Apply discounts, calculate GST (tax), manage cart, print receipts, and cancel orders.
- **Analytics & Reporting**: Visual data representations using Recharts and exportable CSV reports for sales, inventory, and customers.
- **Employee Management**: Create and manage cashier/admin roles with active/inactive access controls.
- **Customer Loyalty**: Track customer purchases and assign loyalty points automatically.
- **Modern UI/UX**: Built with Tailwind CSS featuring dark mode, glassmorphism, responsive design, and Google Fonts (Inter & Outfit).

## Technology Stack

- **Frontend**: React (React Router v7), Tailwind CSS, Recharts, Axios, React Icons
- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT Authentication, Express Validator

## Getting Started

### Prerequisites
- Node.js (v16 or higher recommended)
- MongoDB (Local or Atlas URL)

### Installation

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <repo-url>
   cd retail-pos-system
   ```

2. **Install all dependencies** (Frontend, Backend, and Root):
   ```bash
   npm run install:all
   ```

3. **Configure Environment Variables**:
   Copy the example environment file in the backend folder and fill in your MongoDB URI and JWT Secret.
   ```bash
   cd backend
   cp .env.example .env
   ```

### Running the Application

You can start both the backend and frontend concurrently using the root package.json scripts:

- **Development Mode** (with nodemon):
  ```bash
  npm run dev
  ```
- **Production Mode**:
  ```bash
  npm start
  ```

## API Structure

The backend provides several secured RESTful endpoints under `/api`:
- `/api/auth` - Login, register, profile
- `/api/users` - Admin employee management
- `/api/products` - Product CRUD
- `/api/customers` - Customer CRUD and loyalty tracking
- `/api/orders` - Order processing and statistics
- `/api/inventory` - Stock adjustments and logs
- `/api/reports` - CSV generation

All protected routes require a Bearer token in the Authorization header.

## License

This project is licensed under the ISC License.
