# Finance Dashboard

Live URL : financedashboardui-nu.vercel.app

## Overview

A full-stack Finance Dashboard built with React (frontend) and Express + MongoDB (backend). It helps users track financial data, explore transactions, and understand spending patterns through a clean and responsive interface — secured behind real account authentication.

## Features

### Authentication

* Registration with email + password
* Email verification (sent via Brevo) required before login
* Login / logout with secure httpOnly JWT cookies
* Forgot password / reset password flow
* Every account's transactions are private to that account, stored in MongoDB

### Dashboard Overview

* Summary cards for Total Balance, Income, and Expenses
* Line chart to visualize balance trends over time
* Pie chart to show spending by category

### Transactions

* Displays transaction details:

  * Date
  * Amount
  * Category
  * Type (Income/Expense)
* Includes:

  * Search functionality
  * Filter by transaction type
  * Add, edit, and delete transactions (each user manages their own data)

### Insights

* Highlights key financial insights:

  * Highest spending category
  * Monthly expense comparison

## Tech Stack

**Frontend**
* React (Frontend framework)
* Tailwind CSS (Styling)
* Chart.js / react-chartjs-2 (Data visualization)
* React Router

**Backend**
* Node.js + Express
* MongoDB + Mongoose
* JWT authentication (httpOnly cookies)
* bcrypt password hashing
* Brevo (transactional email API) for verification & password-reset emails

## Additional Features

* Responsive design (mobile + desktop)
* Clean and modern UI
* Handles empty states gracefully

## Conclusion

This project demonstrates full-stack development: secure authentication, a REST API backed by MongoDB, and a polished React frontend with data visualization.

