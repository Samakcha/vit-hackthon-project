from sarvamai import SarvamAI
import os
from dotenv import load_dotenv

load_dotenv()

client = SarvamAI(api_subscription_key=os.getenv("SARVAM_API_KEY"))

def speech_to_text(file_path: str):
    with open(file_path, "rb") as audio_file:
        response = client.speech_to_text.transcribe(
            file=audio_file,
            language_code="unknown"
        )
    
    return response.transcript