from fastapi import FastAPI, UploadFile, File, Form, Query
from pydantic import BaseModel
from services.chat_service import generate_response
from fastapi.middleware.cors import CORSMiddleware
import shutil
import subprocess
from services.sarvam_service import speech_to_text
from services.rag_upload_service import process_pdf
# from services.location_service import search_doctors_nearby
import os

app = FastAPI()

origins = [
    "http://localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    session_id: str | None = "default_user"

@app.post("/chat")
async def chat(request: ChatRequest):
    return generate_response(
        user_message=request.message,
        session_id=request.session_id
    )

@app.post("/upload")
async def upload_pdf(
    file: UploadFile = File(...),
    session_id: str = Form(...)):
    if file.content_type != "application/pdf":
        return {"error": "Only PDF files are allowed."}
    if not os.path.exists("uploads"):
        os.makedirs("uploads")

    file_path = f"uploads/{file.filename}"

    contents = await file.read()

    with open(file_path, "wb") as f:
        f.write(contents)
    
    print("File size:", os.path.getsize(file_path))

    process_pdf(file_path, session_id)

    return {"message": "File uploaded and processed successfully."}

@app.post("/voice-chat")
async def voice_chat(
    file: UploadFile = File(...),
    session_id: str = Form(...)
):
    input_path = f"uploads/{file.filename}"
    output_path = f"uploads/converted_{session_id}.wav"

    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    subprocess.run([
        "ffmpeg",
        "-y",
        "-i", input_path,
        "-ar", "16000",
        "-ac", "1",
        output_path
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    transcript = speech_to_text(output_path)

    response = generate_response(
        user_message=transcript,
        session_id=session_id
    )

    os.remove(input_path)
    os.remove(output_path)

    
    return {
        "transcript": transcript,
        "chat_response": response
    }

# @app.get("/search-doctors")
# async def find_doctors(
#     lat: float = Query(..., description="User latitude"),
#     lng: float = Query(..., description="User longitude"),
#     specialization: str = Query("doctor", description="Specialization or keyword")
# ) :

#     results = search_doctors_nearby(lat, lng, specialization)

#     return {
#         "success": True,
#         "count": len(results),
#         "results": results
#     }
    # lat=12.9716&lng=77.5946&specialization=doctor