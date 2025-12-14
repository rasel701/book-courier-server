# BookCourier Backend Server

## Project Purpose
This is the backend server for the BookCourier platform. It provides RESTful APIs to manage users, books, book orders, payments, service centers, and reviews. The server integrates with MongoDB for data storage, Firebase for user authentication, and Stripe for payment processing.



## Key Features
- **User Management**
  - Create, update, and fetch users
  - Change user roles (user/admin)
  - Manage user wishlist
- **Books Management**
  - Add, edit, delete books
  - Fetch all books or books by librarian
  - Publish/unpublish books
- **Book Orders**
  - Place and cancel orders
  - Track order status (pending, shipped, delivered, cancel)
  - Fetch user-specific orders
- **Payment Integration**
  - Stripe checkout session for secure payments
  - Update payment status on success
- **Book Reviews & Ratings**
  - Users can submit reviews and ratings for purchased books
  - Prevent duplicate reviews by the same user
- **Service Center Management**
  - Fetch available delivery service centers for the frontend map
- **Admin Dashboard**
  - Summary of users, books, orders, and order statuses

## NPM Packages Used
- **express** – Web framework for Node.js
- **dotenv** – Manage environment variables
- **cors** – Enable Cross-Origin Resource Sharing
- **mongodb** – MongoDB client
- **firebase-admin** – Firebase authentication and token verification
- **stripe** – Payment gateway integration
- **nodemon** *(optional for dev)* – Automatically restarts server during development


