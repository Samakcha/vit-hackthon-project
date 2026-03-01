from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.chat_history import InMemoryChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from services.rag_upload_service import get_vectorstore
import os
from dotenv import load_dotenv

load_dotenv()

openai_llm = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0.3,
    api_key=os.getenv("OPENAI_API_KEY")
)

gemini_llm = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash",
    temperature=0.3,
    api_key=os.getenv("GEMINI_API_KEY")
)

store = {}

def get_session_history(session_id: str):
    if session_id not in store:
        store[session_id] = InMemoryChatMessageHistory()
    return store[session_id]

system_instruction = """
You are a healthcare assistant.
You are NOT a doctor.
DO NOT provide medical diagnosis.
Provide general guidance only.
Encourage consulting a licensed healthcare professional.
Suggest safe, non-prescription general care steps when appropriate.
Keep answers concise and clear.
Always respond in the same language as the user's input.

Use ONLY the following context from the patient's medical report if relevant:

{context}
"""

prompt = ChatPromptTemplate.from_messages([
    ("system", system_instruction),
    MessagesPlaceholder(variable_name="history"),
    ("system", "Relevant context from medical documents: \n{context}"),
    ("human", "{input}")
])


chain = prompt | openai_llm

conversation = RunnableWithMessageHistory(
    chain,
    get_session_history,
    input_messages_key="input",
    history_messages_key="history",
)

EMERGENCY_KEYWORDS = [
    "chest pain",
    "can't breathe",
    "difficulty breathing",
    "severe bleeding",
    "stroke",
    "heart attack",
    "suicide",
    "unconscious",
    "not breathing"
]

def is_emergency(message: str):
    return any(keyword in message.lower() for keyword in EMERGENCY_KEYWORDS)

def generate_response(user_message: str, session_id: str = "default_user"):

    if is_emergency(user_message):
        return {
            "risk_level": "high",
            "response": "This may be a medical emergency. Please contact your local emergency number immediately.",
            "disclaimer": "This system cannot handle medical emergencies."
        }
    
    def get_specialist_from_symptoms(message: str):
        message = message.lower()

        if any(word in message for word in ["cold", "cough", "fever", "flu"]):
            return "General Physician"
        if any(word in message for word in ["chest pain", "heart"]):
            return "Cardiologist"
        if any(word in message for word in ["breathing", "asthma", "lungs"]):
            return "Pulmonologist"
        if any(word in message for word in ["headache", "migraine", "seizure"]):
            return "Neurologist"
        if any(word in message for word in ["stomach", "pain", "digestion"]):
            return "Gastroenterologist"
        if any(word in message for word in ["bone", "fracture", "joint"]):
            return "Orthopedist"
        if any(word in message for word in ["skin", "rash", "acne"]):
            return "Dermatologist"
        return "General Physician"
    
    def is_doctor_search(message: str):
        message = message.lower()
        keywords = [
            "find doctor",
            "doctor near me",
            "hospital near me",
            "clinic near me","find hospital",
            "nearby doctor"
        ]
        trigger_words=["doctor", "hospital", "clinic"]
        location_words=["near", "nearby", "near me"]
        return (
            any(t in message for t in trigger_words)
            and any(l in message for l in location_words)
        )
    
    if is_doctor_search(user_message):
        specialist = get_specialist_from_symptoms(user_message)

        maps_query = specialist.replace(" ", "+")
        maps_link = f"https://www.google.com/maps/search/{maps_query}+near+me"

        return {
            "type": "doctor_search",
            "risk_level": "info",
            "specialist": specialist,
            "maps_url": maps_link,
            "message": f"Based on your symptoms, you may consult a {specialist}. Click below to find nearby doctors.",
            "disclaimer": "This is not a medical referral. Please verify hospital details independently."
        }

    vectorstore = get_vectorstore(session_id)

    context = ""

    if vectorstore:
        docs = vectorstore.similarity_search(user_message, k=3)
        context = "\n\n".join([doc.page_content for doc in docs])

    response = conversation.invoke(
       {
        "input": user_message,
        "context": context
       },
        config={"configurable": {"session_id": session_id}}
    )

    return {
        "risk_level": "low_moderate",
        "response": response.content,
        "disclaimer": "This is not a medical advice, Please consult a licensed healthcare professional for proper diagnosis and treatment."
    }