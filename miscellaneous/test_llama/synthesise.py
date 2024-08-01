import replicate
from dotenv import load_dotenv
import os

# load environment variables
load_dotenv()

os.environ["REPLICATE_API_TOKEN"] = os.getenv("REPLICATE_API_KEY")

def llama_synthesise(filename):
    # read information in file
    with open(filename, 'r', encoding='utf-8') as file:
        extracted_text = file.read()

    # convert class in course_structure.py to string
    with open("course_structure.py", 'r', encoding='utf-8') as file:
        pydantic_classes = file.read()

    # print(extracted_text)
    # print()
    # print()
    # print(pydantic_classes)

    """
    sample models:

        meta/llama-2-70b-chat
        meta/llama-2-7b-chat
        meta/llama-2-13b-chat
    """

    # make a request to the API
    pre_prompt = f"You can extract information from text and return in appropriate JSON format."
    prompt_input = f"Provide a JSON response for the extracted_text using the Pydantic classes defined. Etracted text: {extracted_text}. \n\n Pydantic Classes: {pydantic_classes}"

    # pre_prompt = f"Extract information from text and return in appropriate JSON format."
    # prompt_input = "Provide a JSON response with the name of the person, their mission and the year they hope to achieve it. Text: My name is LeerPlan and I am trying to make the world a better place by 2025."
    output = replicate.run(
        "meta/llama-2-70b-chat",            # LLM
        input={
            "debug": False,                 # debug
            "system_prompt": pre_prompt,    # system prompt
            "prompt": prompt_input,         # prompt
            # "max_tokens": 100000,           # maximum tokens
            "temperature": 0.1,             # temperature
            "top_p": 1,                     # top probability
            "repetition_penalty": 1.15,      # repetition penalty
            "min_new_tokens": -1,           # minimum new tokens
            "max_new_tokens": 500,          # maximum new tokens
        }
    )

    print(output)
    response = ""
    for item in output:
        response += item

    print(response)


if __name__ == "__main__":
    llama_synthesise("extracted_PDF_data/2021-2022 Statistics Syllabus .txt")


    # SAMPLE TEST RUN:
    # The meta/llama-2-70b-chat model can stream output as it's running.
    # for event in replicate.stream(
    #     "meta/llama-2-70b-chat",
    #     input={
    #         "debug": False,
    #         "top_p": 1,
    #         "prompt": "Can you write a poem about open source machine learning? Let's make it in the style of E. E. Cummings.",
    #         "temperature": 0.5,
    #         "system_prompt": "You are a helpful, respectful and honest assistant. Always answer as helpfully as possible, while being safe. Your answers should not include any harmful, unethical, racist, sexist, toxic, dangerous, or illegal content. Please ensure that your responses are socially unbiased and positive in nature.\n\nIf a question does not make any sense, or is not factually coherent, explain why instead of answering something not correct. If you don't know the answer to a question, please don't share false information.",
    #         "max_new_tokens": 500,
    #         "min_new_tokens": -1,
    #         "prompt_template": "[INST] <<SYS>>\n{system_prompt}\n<</SYS>>\n\n{prompt} [/INST]",
    #         "repetition_penalty": 1.15
    #     },
    # ):
    #     print(str(event), end="")