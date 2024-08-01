<p align="center">
  <img src="leerplanlogo.png" alt="LeerPlan Logo" height="200px">
</p>

# Leerplan: Intelligent Study Planning Application

## Setting Up the LeerPlan API Backend

The backend for LeerPlan is built with Django and is located in the `leerplan_api` directory. Follow these steps to set up and run the backend:

### Prerequisites

- Python 3.10 or higher

### Setup Steps

1. Navigate to the backend directory:

```[bash]
cd leerplan_api
```

2. Create a virtual environment:

```[bash]
python -m venv django-venv
```

3. Activate the virtual environment:
- On Windows:

  ```[bash]
  venv\Scripts\activate
  ```
- On macOS and Linux:

  ```[bash]
  source venv/bin/activate
  ```

4. Install the required packages:

```[bash]
pip install -r requirements.txt
```

5. Set up the database:

```[bash]
python manage.py migrate
```

6. Run the development server:

```[bash]
python manage.py runserver
```

The API should now be running at `http://127.0.0.1:8000/`.


## Note: 

Before running the server, you need to set up your `.env` file with the necessary environment variables. Create a `.env` file in the `leerplan_api` directory and add the following items:

1. `SECRET_KEY = 'xxxxxxxxxxxxxxxxxxxxxxxxxx'`
2. `GOOGLE_API_KEY = 'xxxxxxxxxxxxxxxxxxxxxx'`

Replace the 'x' placeholders with your actual keys. To generate these keys:

- For the Django `SECRET_KEY`, you can use the [Django Secret Key Generator](https://djecrety.ir/).
- To obtain a `GOOGLE_API_KEY` for the Gemini API, follow the instructions in the [Gemini API documentation](https://ai.google.dev/gemini-api/docs/api-key).

Ensure you keep these keys confidential and never commit them to version control.