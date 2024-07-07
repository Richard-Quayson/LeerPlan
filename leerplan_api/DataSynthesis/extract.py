import fitz  # PyMuPDF
import io

def extract_text_from_pdf(pdf_file):
    # Create a bytes stream from the InMemoryUploadedFile
    pdf_stream = io.BytesIO(pdf_file.read())
    
    # Open the PDF from the bytes stream
    doc = fitz.open(stream=pdf_stream, filetype="pdf")
    
    full_text = ""
    
    for page in doc:
        # extract text from current page
        text = page.get_text()
        full_text += text
    
    doc.close()
    
    return full_text