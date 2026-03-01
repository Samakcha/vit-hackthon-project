import os 
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS

session_vectorstores = {}

UPLOAD_DIR = "uploads"

if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

def process_pdf(file_path: str, session_id: str):
    loader = PyPDFLoader(file_path)
    docs = loader.load()

    if not docs:
        raise ValueError("No page found in PDF.")

    print("Pages loaded:", len(docs))
    print("First page preview:", docs[0].page_content[:200])

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size = 800,
        chunk_overlap = 200
    )

    chunks = text_splitter.split_documents(docs)

    if not chunks:
        raise ValueError("No readable text found in PDF.")
    
    print("First page preview:", docs[0].page_content[:200])

    embeddings = OpenAIEmbeddings()

    vectorstore = FAISS.from_documents(chunks, embeddings)

    session_vectorstores[session_id] = vectorstore

    return True, {"message": "PDF processed successfully"}

def get_vectorstore(session_id):
    return session_vectorstores.get(session_id, None)