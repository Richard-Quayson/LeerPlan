import google.generativeai as genai
from dotenv import load_dotenv
import os

current_dir = os.path.dirname(os.path.abspath(__file__))
PYDANTIC_CLASSES_FILE = os.path.join(current_dir, "course_structure.py")
OUTPUT_DIR = "media/synthesis/"

# Load environment variables
load_dotenv()

def gemini_synthesise(input_file: str, extracted_text: str) -> str:
    """
    Synthesise a JSON response from the extracted text using the Gemini API.

    Args:
        input_file (str): The input file containing the extracted text.
        extracted_text (str): The extracted text from the PDF file.

    Returns:
        str: The path to the output JSON file containing the synthesised JSON response.
    """

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

    model = genai.GenerativeModel("gemini-1.5-pro-latest")

    pre_prompt = f"Provide a JSON response representing the extracted course information."
    prompt_input = f"{pre_prompt}\n\nExtracted course information: {extracted_text}\n\nPydantic classes: {pydantic_classes_code}"

    # Make the request to the API
    response = model.generate_content(prompt_input)
    
    # Extract the text from the response
    generated_text = response.text

    # remove ```json from the beginning and ``` from the end
    generated_text = generated_text.replace("```json\n", "")
    generated_text = generated_text.replace("```", "")

    # Write result to json file
    OUTPUT_FILE_NAME = input_file.split(".pdf")[0]
    output_file = os.path.join(OUTPUT_DIR, f"{OUTPUT_FILE_NAME}.json")
    with open(output_file, 'w', encoding='utf-8') as file:
        file.write(generated_text)

    return output_file