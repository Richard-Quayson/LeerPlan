import fitz         # PyMuPDF


def extract_text_from_pdf(pdf_path):
    # open the pdf file
    doc = fitz.open(pdf_path)
    
    full_text = ""
    
    for page in doc:
        # extract text from current page
        text = page.get_text()
        full_text += text

    # create output .txt file
    output_path = "data/" + pdf_path.split("/")[-1].replace(".pdf", ".txt")
    with open(output_path, 'w', encoding='utf-8') as text_file:
        text_file.write(full_text)
    
    doc.close()
    
    return full_text


if __name__ == "__main__":
    pdf_path = "C:/Users/hp/OneDrive - Ashesi University/CS491 Undergraduate Thesis 1/Dataset/Ashesi University/CS/2021-2022 Statistics Syllabus .pdf"
    text = extract_text_from_pdf(pdf_path)
    # print(text)