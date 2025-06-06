# BudgetBakers API Wrapper & CouchDB Interface

This project provides a Node.js and Express-based RESTful API designed to serve as a backend interface for interacting with the BudgetBakers platform. It facilitates the management of various financial entities such as accounts, records (transactions), categories, and labels (HashTags) by directly interacting with the user's BudgetBakers CouchDB database.

## Core Features

*   **Secure BudgetBakers Authentication:** Handles the complete authentication flow (CSRF token retrieval, login, session cookie management) to securely access user data.
*   **Direct CouchDB Interaction:** Performs CRUD operations directly on the user's BudgetBakers CouchDB instance.
*   **Comprehensive Entity Management (CRUD):**
    *   **Accounts (`Account`):** List all accounts, fetch a specific account by ID. (Create, Update, Delete operations are currently placeholders).
    *   **Records (`Record`):** Full CRUD (Create, Read, Update, Delete) capabilities for transactions, including basic filtering for listings.
    *   **Categories (`Category`):** Full CRUD, with specific logic to manage categories within designated `envelopeId` groups (e.g., those starting with "3").
    *   **Labels/HashTags (`HashTag`):** Full CRUD for managing transaction labels.
*   **Modular and Maintainable Architecture:** Adheres to Separation of Concerns (SoC) and Don't Repeat Yourself (DRY) principles with a well-defined project structure.
*   **Centralized Configuration:** Utilizes environment variables for flexible and secure application settings.
*   **Standardized Error Handling:** Implements centralized error management for consistent JSON error responses.
*   **HTTP Request Logging:** Uses `morgan` for development-friendly request logging.

## Project Architecture

The application is structured to promote clarity and ease of maintenance:

*   `src/`: Contains all application source code.
    *   `config/index.js`: Centralizes application configuration, loading sensitive data from `.env`.
    *   `routes/`: Defines API endpoints, with each file dedicated to a specific entity (e.g., `records.routes.js`).
    *   `controllers/`: Manages HTTP request/response logic, acting as an intermediary between routes and services.
    *   `services/`: Houses the core business logic and database interaction (e.g., `authService.js` for BudgetBakers authentication, `recordService.js` for transaction management).
    *   `middlewares/`: Contains Express middleware functions, such as the centralized error handler.
    *   `helpers/`: Includes utility functions, like the JSON response formatter.
*   `server.js`: The main entry point to start the Express server.
*   `.env.example`: A template for required environment variables.
*   `couchDB_entities.md`: (Recommended) A document detailing the structure of entities within the BudgetBakers CouchDB.
*   `README.md`: This file.
*   `CONTRIBUTING.md`: Guidelines for contributing to the project.

## Prerequisites

*   Node.js (latest LTS version recommended)
*   npm (Node Package Manager, typically included with Node.js)
*   Valid BudgetBakers account credentials (email and password).

## Getting Started

### 1. Clone the Repository (if applicable)
```bash
git clone <your-repository-url>
cd budgetbakers-api
```

### 2. Install Dependencies
Navigate to the project root and run:
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the project root by copying the example file:
```bash
cp .env.example .env
```
Edit the `.env` file and provide your specific configuration details:
```env
PORT=3000
BUDGETBAKERS_API_URL=https://web-new.budgetbakers.com
# COUCHDB_URL is not directly used by services as the URL is derived from the BudgetBakers session.
BUDGETBAKERS_EMAIL=your_budgetbakers_email@example.com
BUDGETBAKERS_PASSWORD=your_budgetbakers_password
```

## Running the Application

To start the API server, execute:
```bash
npm start
```
The API will be accessible at `http://localhost:3000` (or the port specified in your `.env` file). All primary API endpoints are prefixed with `/api/v1`.

## API Endpoints

All endpoints are prefixed with `/api/v1`.

### Authentication
Authentication with BudgetBakers is handled internally by the `authService.js`. Making requests to the protected endpoints below will automatically trigger the authentication flow if a valid session is not already established.

### Accounts (`/accounts`)
*   `GET /accounts`: Retrieves a list of all user accounts.
    *   Query Parameters: `?nameStartsWith=<text>` (filters accounts whose name begins with the provided text).
*   `GET /accounts/:id`: Fetches details for a specific account by its ID.
*   `POST /accounts`: (Placeholder) Creates a new account.
*   `PUT /accounts/:id`: (Placeholder) Updates an existing account.
*   `DELETE /accounts/:id`: (Placeholder) Archives or deletes an account.

### Records (`/records`)
*   `GET /records`: Retrieves a list of all records (transactions).
    *   Query Parameters: `?accountId=<id>`, `?dateFrom=YYYY-MM-DD` (examples for filtering).
*   `GET /records/:id`: Fetches a specific record by its ID.
*   `POST /records`: Creates a new record.
    *   Request Body (JSON): Requires details such as `accountId`, `categoryId`, `amount`, `recordDate`, `currencyId`. Optional fields include `payee`, `note`, `labels`, etc.
*   `PUT /records/:id`: Updates an existing record.
    *   Request Body (JSON): Fields to be updated.
*   `DELETE /records/:id`: Deletes a record.

### Categories (`/categories`)
*   `GET /categories`: Retrieves a list of all categories.
    *   Query Parameters: `?customCategory=true|false` (filters by custom or system-defined categories).
*   `POST /categories`: Creates a new category.
    *   Request Body (JSON): Requires `name` and `envelopeId`. Optional fields include `color`, `icon`, `categoryType`.
    *   **Note:** Categories can only be created if the provided `envelopeId` starts with "3" (e.g., 3000, 3004).
*   `PUT /categories/:id`: Updates an existing category.
    *   Request Body (JSON): Fields to be updated.
    *   **Constraint:** Only categories belonging to an `envelopeId` starting with "3" can be updated. The `envelopeId` itself, if changed, must also start with "3".
*   `DELETE /categories/:id`: Deletes a category.
    *   **Constraint:** Only categories belonging to an `envelopeId` starting with "3" can be deleted.

### Labels/HashTags (`/labels`)
*   `GET /labels`: Retrieves a list of all labels (HashTags).
*   `GET /labels/:id`: Fetches a specific label by its ID.
*   `POST /labels`: Creates a new label.
    *   Request Body (JSON): `{"name": "your_label_name"}`.
*   `PUT /labels/:id`: Updates an existing label.
    *   Request Body (JSON): `{"name": "new_label_name"}`.
*   `DELETE /labels/:id`: Deletes a label.

## Standard Response Format

The API uses a consistent JSON format for responses.

*   **Successful Response (e.g., `200 OK`, `201 Created`):**
    ```json
    {
        "success": true,
        "message": "Operation successful", // Or a more specific success message
        "data": { /* Requested or created data object/array */ }
    }
    ```

*   **Error Response (e.g., `400 Bad Request`, `404 Not Found`, `500 Internal Server Error`):**
    ```json
    {
        "success": false,
        "error": {
            "message": "A descriptive error message",
            "details": null // Or additional error details if available
        }
    }
    ```

## Environment Variables

The following environment variables are used by the application and should be defined in the `.env` file:

| Variable              | Description                                                                 | Default Value                     |
| --------------------- | --------------------------------------------------------------------------- | --------------------------------- |
| `PORT`                | The port on which the API server will listen.                               | `3000`                            |
| `BUDGETBAKERS_API_URL`| The base URL for the BudgetBakers web API.                                  | `https://web-new.budgetbakers.com`|
| `BUDGETBAKERS_EMAIL`  | Your email address for logging into BudgetBakers.                           |                                   |
| `BUDGETBAKERS_PASSWORD`| Your password for logging into BudgetBakers.                                |                                   |
| `COUCHDB_URL`         | (Optional) Base URL for CouchDB. Currently, this is derived from the session. |                                   |

## Future Enhancements & To-Do

*   **Complete CRUD for `Accounts`:** Implement `createAccount`, `updateAccount`, and `deleteAccount` service logic.
*   **Input Validation:** Implement robust request data validation for all endpoints (e.g., using `Joi` or `express-validator`).
*   **Advanced Filtering & Pagination:** Enhance list endpoints with more comprehensive filtering options and pagination support.
*   **Session Expiration Management:** Improve `authService.js` to more gracefully handle session expirations.
*   **Testing:** Develop a comprehensive suite of unit and integration tests.
*   **CouchDB View Optimization:** For large datasets, consider implementing CouchDB MapReduce views to optimize query performance for `db.list()` operations if `_find` remains problematic.
*   **Rate Limiting & Security Headers:** Implement basic security measures like rate limiting and security-focused HTTP headers.

## Contributing

Contributions are welcome! Please see the `CONTRIBUTING.md` file for guidelines on how to contribute to this project.

---