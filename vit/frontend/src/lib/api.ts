const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

export async function sendChat(
    message: string, session_id: string = "default_user") {
    const res = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, session_id }),
    })

    if (!res.ok) {
    throw new Error("Chat request failed");
  }

  return res.json();
}

export async function uploadPdf(file: File, session_id: string = "default_user") {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("session_id", session_id);

    const res = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
    })

    if (!res.ok) {
        throw new Error("Upload failed");
    }

    return res.json();
}

export async function sendVoiceChat(
    audioBlob: Blob,
    sessionId: string = "default_user"
) {
    const formData = new FormData();
    formData.append("file", audioBlob, "voice.webm");
    formData.append("session_id", sessionId);

    const res = await fetch(`${API_BASE_URL}/voice-chat`, {
        method: "POST",
        body: formData,
    })

    if (!res.ok) {
        throw new Error("Voice chat request failed");
    }

    return res.json();
}