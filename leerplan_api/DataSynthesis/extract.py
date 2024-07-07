import fitz         # PyMuPDF


def extract_text_from_pdf(pdf_path):
    # open the pdf file
    doc = fitz.open(pdf_path)
    
    full_text = ""
    
    for page in doc:
        # extract text from current page
        text = page.get_text()
        full_text += text
    
    doc.close()
    
    return full_text