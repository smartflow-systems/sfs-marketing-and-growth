# SmartFlow Systems

## Overview

SmartFlow Systems is a premium multi-tenant SaaS platform designed for salon and service businesses. The application provides AI-powered booking systems, e-commerce integration, and business management tools with a distinctive black and gold branding theme. Built as a Flask web application, it offers tiered subscription plans with feature gating, Stripe payment processing, and comprehensive user management capabilities.

The platform serves as a complete business solution for salons and service providers, offering everything from basic booking functionality in the starter tier to advanced AI concierge services and analytics in the premium tier.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Web Framework and Structure
The application is built using Flask as the primary web framework, following a modular architecture pattern. The main application logic is centralized in `app.py`, with separate modules for configuration, models, utilities, and business logic. The architecture supports multi-tenancy through database design rather than application-level isolation.

### Database Architecture
Uses SQLAlchemy ORM with a flexible database configuration that defaults to SQLite for development but can be configured for production databases via environment variables. The data model implements multi-tenancy through tenant isolation in the database schema:

- **Tenant**: Core organization entity with subscription and billing information
- **User**: Individual users with cross-tenant capability
- **Membership**: Junction table managing user-tenant relationships with role-based access
- **Invitation**: Token-based invitation system for onboarding new team members
- **AuditLog**: Comprehensive activity tracking for security and compliance

### Authentication and Authorization
Implements session-based authentication using Flask's built-in session management. The system uses a role-based access control model with four distinct roles (owner, admin, staff, analyst) that determine feature access within each tenant. Invitation tokens are secured using itsdangerous library for tamper-proof team member onboarding.

### Payment and Subscription Management
Integrates Stripe for comprehensive payment processing, supporting both recurring subscriptions and one-time payments. The system implements three distinct pricing tiers (Smart Starter, Flow Kit, Salon Launch Pack) with feature gating that restricts functionality based on subscription level. Webhook handling ensures real-time subscription status updates.

### Feature Gating System
Implements a configuration-driven feature gating mechanism that maps subscription plans to available features. This allows for easy plan management and feature rollout without code changes. Features range from basic booking functionality to advanced AI services and analytics.

### Communication Infrastructure
Modular communication system supporting both email and SMS channels. Email functionality uses SMTP configuration for onboarding and notifications, while SMS integration uses Twilio for client communications. Both systems are optional and configurable via environment variables.

### Frontend Architecture
Server-side rendered templates using Jinja2 with Bootstrap 5 for responsive design. The frontend emphasizes the black and gold branding theme throughout the user interface. Static assets are minimal, focusing on custom CSS that implements the brand color scheme and premium aesthetic.

## External Dependencies

### Payment Processing
- **Stripe**: Complete payment processing including checkout sessions, subscription management, customer billing, and webhook handling for real-time updates
- **Stripe Webhooks**: Real-time subscription status synchronization and payment event processing

### Communication Services
- **SMTP**: Configurable email service for user onboarding, invitations, and system notifications
- **Twilio**: SMS service integration for client communications and appointment reminders (optional)

### Database
- **SQLite**: Default development database with production flexibility for PostgreSQL, MySQL, or other SQLAlchemy-supported databases
- **SQLAlchemy**: ORM providing database abstraction and migration capabilities

### Frontend Libraries
- **Bootstrap 5**: Responsive UI framework providing consistent styling and components
- **Font Awesome**: Icon library for enhanced user interface elements

### Security and Utilities
- **itsdangerous**: Secure token generation and validation for invitation system
- **Werkzeug**: WSGI utilities including proxy fix for deployment environments

The system is designed to be deployment-agnostic with comprehensive environment variable configuration, making it suitable for various hosting platforms while maintaining security best practices through externalized configuration management.