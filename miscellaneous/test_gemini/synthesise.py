import google.generativeai as genai
from dotenv import load_dotenv
import os

PYDANTIC_CLASSES_FILE = "course_structure.py"
EXTRACTED_TEXT_FILE = "extracted_PDF_data/2021-2022 Statistics Syllabus .txt"
OUTPUT_DIR = "sample_JSON_responses/"

# Load environment variables
load_dotenv()

def gemini_synthesise(filename):
    """
    Synthesizes a JSON response from extracted text using the provided Pydantic classes.

    Args:
        filename (str): Path to the file containing the extracted text.
    """

    # Read information in the file
    with open(filename, 'r', encoding='utf-8') as file:
        extracted_text = file.read()

    # Try loading Pydantic classes from the specified file
    try:
        with open(PYDANTIC_CLASSES_FILE, 'r', encoding='utf-8') as file:
            pydantic_classes_code = file.read()
    except FileNotFoundError:
        print("Error: course_structure.py not found. Please ensure the file exists.")
        return

    # Prompt the model with pre-prompt and prompt_input
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
    genai.configure(api_key=GOOGLE_API_KEY)

    model = genai.GenerativeModel("gemini-1.5-pro-latest")  # Select your preferred model

    pre_prompt = f"Provide a JSON response representing the extracted course information."
    prompt_input = f"{pre_prompt}\n\nExtracted course information: {extracted_text}\n\nPydantic classes: {pydantic_classes_code}"

    # Make the request to the API
    response = model.generate_content(prompt_input)
    
    # Extract the text from the response
    generated_text = response.text

    # remove ```json from the beginning and ``` from the end
    generated_text = generated_text.replace("```json\n", "")
    generated_text = generated_text.replace("```", "")

    print(f"Generated JSON response:\n{generated_text}")

    # Write result to json file
    output_file = os.path.join(OUTPUT_DIR, "generated_response.json")
    with open(output_file, 'w', encoding='utf-8') as file:
        file.write(generated_text)

if __name__ == "__main__":
  gemini_synthesise(EXTRACTED_TEXT_FILE)
