<p align="center">
  <img src="leerplanlogo.png" alt="LeerPlan Logo" height="200px">
</p>

# Leerplan: Intelligent Study Planning Application

## Setting Up the LeerPlan Interface

The frontend for LeerPlan is built with React and Vite, located in the `leerplan_interface` directory. Follow these steps to set up and run the frontend:

### Prerequisites

- Node.js (version 14.0 or higher recommended)
- npm (usually comes with Node.js)

### Setup Steps

1. Navigate to the frontend directory:

```[bash]
cd leerplan_interface/leerplan
```

2. Install the project dependencies:

```[bash]
npm install
```

3. Set up environment variables:
- Create a `.env` file in the `leerplan` directory if it doesn't exist
- Add any necessary environment variables (refer to `.env.example` if available)

4. Start the development server:

```[bash]
npm run dev
```

The application should now be running, typically at `http://localhost:5173/` (Vite's default port).

## Note 

Before running the application, you need to set up your `.env` file with the necessary environment variables. Create a `.env` file in the `leerplan_interface/leerplan` directory if it doesn't exist already. Add the following item:

```
VITE_API_URL = "http://127.0.0.1:8000/api/"
```

This environment variable specifies the URL of your backend API. The default value assumes you're running the Django backend locally on the default port. If you've configured your backend differently, adjust this URL accordingly.

**Remember:**

- The `VITE_` prefix is important for Vite to expose these variables to your application.
- If you change this variable, you'll need to restart your Vite development server for the changes to take effect.
- Ensure your backend API is running and accessible at this URL before starting the frontend application for full functionality.
- Never commit your `.env` file to version control to keep your configuration secure.