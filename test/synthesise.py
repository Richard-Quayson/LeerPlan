from openai import OpenAI
from dotenv import load_dotenv
import os

# load environment variables
load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

"""
sample models:

    gpt-3.5-turbo-16k-0613
    gpt-3.5-turbo-16k
    gpt-3.5-turbo-1106
    gpt-3.5-turbo-0613
    gpt-3.5-turbo-0125
    gpt-3.5-turbo
"""

# make a request to the API
response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[
        {
            "role": "system",
            "content": "You can extract information from text and return in appropriate JSON format. Text is in test/extracted_PDF_data/2021-2022 Statistics Syllabus .txt."
        },
        {
            "role": "user",
            "content": 
                "Provide Provide a json response for information defined in the Pydantic classes defined in the test/struct.py file."
        }
    ]
)

# print the response
print(response)