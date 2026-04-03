from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import os
import tempfile
import base64
from urllib.parse import urlparse, parse_qs

class ConvertHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_POST(self):
        path = urlparse(self.path).path
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length)
        data = json.loads(body)

        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()

        try:
            file_bytes = base64.b64decode(data["file"])
            
            if path == "/pdf-to-word":
                result = self.pdf_to_word(file_bytes)
            elif path == "/word-to-pdf":
                result = self.word_to_pdf(file_bytes)
            else:
                result = {"error": "Unknown endpoint"}

            self.wfile.write(json.dumps(result).encode())

        except Exception as e:
            self.wfile.write(json.dumps({"error": str(e)}).encode())

    def pdf_to_word(self, pdf_bytes):
        from pdf2docx import Converter
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as f:
            f.write(pdf_bytes)
            pdf_path = f.name
        
        docx_path = pdf_path.replace(".pdf", ".docx")
        
        cv = Converter(pdf_path)
        cv.convert(docx_path)
        cv.close()
        
        with open(docx_path, "rb") as f:
            docx_bytes = base64.b64encode(f.read()).decode()
        
        os.unlink(pdf_path)
        os.unlink(docx_path)
        
        return {"file": docx_bytes, "filename": "converted.docx"}

    def word_to_pdf(self, docx_bytes):
        import subprocess
        with tempfile.NamedTemporaryFile(suffix=".docx", delete=False) as f:
            f.write(docx_bytes)
            docx_path = f.name
        
        pdf_path = docx_path.replace(".docx", ".pdf")
        
        # Try LibreOffice first
        try:
            subprocess.run([
                "soffice", "--headless", "--convert-to", "pdf",
                "--outdir", os.path.dirname(docx_path), docx_path
            ], check=True, capture_output=True)
        except:
            # Fallback: docx2pdf
            from docx2pdf import convert
            convert(docx_path, pdf_path)
        
        with open(pdf_path, "rb") as f:
            pdf_bytes_out = base64.b64encode(f.read()).decode()
        
        os.unlink(docx_path)
        if os.path.exists(pdf_path):
            os.unlink(pdf_path)
        
        return {"file": pdf_bytes_out, "filename": "converted.pdf"}

if __name__ == "__main__":
    port = 8000
    print(f"DocSwift Converter running on port {port}")
    server = HTTPServer(("localhost", port), ConvertHandler)
    server.serve_forever()