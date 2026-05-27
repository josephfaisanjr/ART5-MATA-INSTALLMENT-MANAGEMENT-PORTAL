Design and develop a modern, premium, and fully responsive Funeral Installment Management System specifically designed for funeral service businesses in the Philippines, named:

ART5MATA INSTALLMENT MANAGEMENT

The system should function as a professional SaaS-style platform for managing funeral installment plans, customer records, payment tracking, balances, and memorial service packages commonly offered in the Philippines.

The platform must include separate Admin and User interfaces connected through one centralized database system.

The Admin should have complete control over creating and managing funeral installment plans, while Users can securely log in to view only their own funeral plans, balances, payment schedules, and installment progress.

The entire system should feel:

Professional
Elegant
Filipino-inspired
Modern
Financial-system styled
Premium and trustworthy
PHILIPPINE-BASED SYSTEM DESIGN

The system should reflect a business environment commonly used in the Philippines.

LOCALIZED FEATURES

Include:

Philippine Peso Currency (₱)
Philippine-style contact numbers
Barangay / Municipality / Province address fields
Local funeral package naming
Filipino-friendly UI wording
English with optional Filipino labels
Philippine date formats
Mobile-first responsive design for Android users

SAMPLE FUNERAL PACKAGE TYPES

Include sample Philippine funeral packages such as:

Basic Memorial Plan
Standard Funeral Plan
Cremation Plan
Family Memorial Plan
Eternal Care Plan
Senior Citizen Memorial Plan

Optional services:

Chapel Services
Transportation
Flower Arrangements
Burial Assistance
Cremation Services
Wake Services

ROLE-BASED AUTHENTICATION SYSTEM

The system must support:

Admin Login
User Login
Registration System
Gmail Authentication
JWT Authentication
Role-Based Access Control

GOOGLE GMAIL AUTHENTICATION

Integrate Google Sign-In / Gmail Authentication using Firebase Authentication or OAuth.

Users and Admins should be able to:

Create accounts using Gmail
Log in using Gmail
Automatically register after Gmail authentication
Securely authenticate with Google OAuth
Save authenticated user data in MongoDB

Gmail Authentication Flow
User clicks “Continue with Google”
User selects Gmail account
System authenticates user
Account is automatically created
User is redirected to the proper dashboard

If role = Admin:
→ Redirect to Admin Dashboard

If role = User:
→ Redirect to User Dashboard

AUTHENTICATION PAGES
LOGIN PAGE

Create a premium split-screen login interface.

Left Side
Include:

ART5MATA branding
Elegant Filipino-inspired funeral illustration
Welcome text
Royal blue and indigo gradient background
Smooth floating animations

Right Side
Include:

Email or Username field
Password field
Remember Me checkbox
Forgot Password link
Sign In button
Continue with Google button
Link to Create Account page

Design Style:

Glassmorphism card
Rounded corners
Soft shadows
Smooth transitions
Poppins or Inter typography

REGISTRATION PAGE

Fields:

Full Name
Email Address
Philippine Mobile Number
Complete Address
House No.
Street
Barangay
City/Municipality
Province
Password
Confirm Password

Role Selection:
User
Admin

Buttons:

Create Account
Continue with Google

Include:

Floating labels
Animated transitions
Responsive mobile design
Password strength indicator
Modern validation UI

ADMIN DASHBOARD

The Admin dashboard should act as the management center of the entire funeral installment system.

ADMIN CAN:

Create funeral installment plans
Assign plans to users/customers
Edit installment details
Delete plans
View customer records
Track payment progress
Monitor overdue accounts
Manage user accounts
Generate reports
View revenue analytics
Send notifications

ADMIN SIDEBAR NAVIGATION

Include:

Dashboard
Customers
Funeral Plans
Installments
Payments
Reports
Notifications
Settings
Logout

Use:

Modern line icons
Active menu indicators
Hover animations
Collapsible sidebar

ADMIN DASHBOARD OVERVIEW

Display premium analytics cards showing:

Total Customers
Active Funeral Plans
Total Revenue
Pending Installments
Fully Paid Accounts
Monthly Collections

Design Requirements:

Gradient cards
Mini charts
Glassmorphism effects
Hover animations
Modern SaaS layout

FUNERAL INSTALLMENT PLAN MANAGEMENT

The Admin should be able to create and manage funeral installment plans.

CREATE PLAN FORM

Fields:

Plan ID
Customer Name
Assigned User
Contact Number
Complete Address
Funeral Package Type
Funeral Services Included
Total Plan Amount (₱)
Down Payment (₱)
Monthly Installment (₱)
Remaining Balance (₱)
Duration
Start Date
Due Date
Payment Status
Beneficiaries
Notes

SMART FEATURES

Automatically:

Calculate remaining balance
Calculate monthly installment
Track payment completion percentage
Update payment status dynamically

Payment Status Types:

Paid
Partial
Pending
Overdue
Active

USER DASHBOARD

Create a separate dashboard interface for customers/users.

Users should ONLY see:

Their assigned funeral installment plans
Remaining balance
Monthly payment schedules
Due dates
Payment history
Installment progress

Users must NOT access admin controls.

USER FEATURES

Users can:

View subscribed funeral plans
Track installment progress
View payment history
Download receipts
Receive due-date notifications
Update profile settings

USER DASHBOARD OVERVIEW

Display:

Active Funeral Plan
Remaining Balance
Next Due Date
Installment Completion Percentage
Payment Status

Include:

Progress bars
Timeline tracker
Payment schedule cards
Financial widgets

SYSTEM CONNECTION LOGIC

The platform must work as a fully connected system where:

Admin creates or manages customer accounts
Admin assigns funeral installment plans to users
Users log in using email/password or Gmail
Users automatically see their assigned plans
Any Admin updates instantly reflect on the User dashboard

Example:
If Admin updates:

payment amount
balance
payment status
due date

The User dashboard updates automatically in real time.

UI/UX DESIGN STYLE

The entire design should feel:

Filipino-business inspired
Premium
Modern
Elegant
Minimalist
Professional
Trustworthy

DESIGN REQUIREMENTS

Use:

Royal blue and indigo gradients
Glassmorphism UI
Rounded corners
Floating dashboard cards
Smooth animations
Soft shadows
Spacious layouts
Mobile-first responsive design

COLOR PALETTE

Primary Colors:

Royal Blue (#2563EB)
Indigo (#4F46E5)

Accent Colors:

Cyan
Violet
Soft Neon Highlights

Neutral Colors:

White
Light Gray
Dark Slate

ADDITIONAL FEATURES

Include:

Dark Mode
Search and Filters
Real-Time Notifications
Analytics Charts
Activity Logs
Mobile Responsive Design
Gmail Authentication
JWT Authentication
REST API Integration
Role-Based Authorization