"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Mic, AudioLines, Sparkles, Send, Loader2, FileText, User as UserIcon } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { sendChat, uploadPdf, sendVoiceChat } from "@/lib/api";
import { useToast } from "@/components/ToastProvider";
import ReactMarkdown from "react-markdown";

type Message = {
    role: "user" | "bot";
    text: string;
    type?: "text" | "file" | "audio";
};

export default function CuraBotPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { toast } = useToast();

    // Scroll to bottom whenever messages update
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const formatResponseText = (res: any) => {
        try {
            // Unpack if it's deeply nested
            const innerResponse = res?.chat_response || res;

            // Handle the doctor_search specific structure
            if (innerResponse?.type === "doctor_search") {
                const text = `${innerResponse.message}\n\n**Specialist:** ${innerResponse.specialist}\n[Find Doctors on Google Maps](${innerResponse.maps_url})`;
                if (res?.transcript) {
                    return `*Transcript: "${res.transcript}"*\n\n${text}`;
                }
                return text;
            }

            // Standard object checking
            if (innerResponse?.response) {
                let text = innerResponse.response;
                if (res?.transcript) {
                    text = `*Transcript: "${res.transcript}"*\n\n${text}`;
                }
                return text;
            }

            // Fallback object checking
            const reply = innerResponse?.reply || innerResponse?.message || innerResponse?.answer;
            if (typeof reply === "string") return reply;

            // If it returns a stringified JSON
            if (typeof reply === "object") {
                if (reply?.response) return reply.response;
                return JSON.stringify(reply);
            }

            return JSON.stringify(res);
        } catch (e) {
            return "Received a complex response from the server.";
        }
    };

    const handleSendText = async () => {
        if (!input.trim() || isLoading) return;
        const text = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: "user", text, type: "text" }]);
        setIsLoading(true);

        try {
            const res = await sendChat(text);
            const replyText = formatResponseText(res);
            setMessages(prev => [...prev, { role: "bot", text: replyText }]);
        } catch (error) {
            toast("Failed to get response from CuraBot.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setMessages(prev => [...prev, { role: "user", text: `Sent a document: ${file.name}`, type: "file" }]);
        setIsLoading(true);

        try {
            const res = await uploadPdf(file);
            const replyText = formatResponseText(res);
            setMessages(prev => [...prev, { role: "bot", text: replyText }]);
        } catch (error) {
            toast("Failed to upload the document.", "error");
        } finally {
            setIsLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const toggleRecording = async () => {
        if (isRecording) {
            // Stop recording
            mediaRecorderRef.current?.stop();
            setIsRecording(false);
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                stream.getTracks().forEach(track => track.stop());

                setMessages(prev => [...prev, { role: "user", text: "Sent a voice message", type: "audio" }]);
                setIsLoading(true);

                try {
                    const res = await sendVoiceChat(audioBlob);
                    const replyText = formatResponseText(res);
                    setMessages(prev => [...prev, { role: "bot", text: replyText }]);
                } catch (error) {
                    toast("Failed to process the voice message.", "error");
                } finally {
                    setIsLoading(false);
                }
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (error) {
            toast("Microphone access denied or not available.", "error");
        }
    };

    if (!isMounted) {
        return null;
    }

    return (
        <DashboardLayout role="patient">
            <div className="flex flex-col items-center justify-between min-h-[calc(100vh-12rem)] bg-white/40 border border-white/60 backdrop-blur-3xl rounded-[2.5rem] p-6 sm:p-10 shadow-xl relative overflow-hidden transition-all duration-300 z-10 w-full animate-fade-in group">

                {/* Background decorative elements inside the container to match the app theme */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none transition-all group-hover:bg-primary/20"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-[100px] pointer-events-none transition-all group-hover:bg-secondary/20"></div>

                {/* Main Content Area */}
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center flex-1 w-full relative z-20 mb-8">
                        <div className="h-16 w-16 rounded-3xl bg-linear-to-br from-primary to-secondary flex items-center justify-center border-4 border-white shadow-xl mb-4 transform hover:scale-105 transition-transform">
                            <Sparkles className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight text-center">
                            Good to see you.
                        </h1>
                        <p className="text-slate-500 font-medium mt-4 text-lg">Ask any medical question or upload your reports.</p>
                    </div>
                ) : (
                    <div className="flex-1 w-full max-w-4xl overflow-y-auto relative z-20 mb-8 pr-4 space-y-6 flex flex-col pt-4">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}>
                                {msg.role === "bot" && (
                                    <div className="h-10 w-10 shrink-0 rounded-xl bg-linear-to-br from-primary to-secondary flex items-center justify-center shadow-md">
                                        <Sparkles className="h-5 w-5 text-white" />
                                    </div>
                                )}
                                <div className={`px-6 py-4 rounded-3xl max-w-[80%] shadow-sm ${msg.role === "user"
                                    ? "bg-slate-900 text-white rounded-tr-sm"
                                    : "bg-white/80 backdrop-blur-md border border-white/60 text-slate-900 rounded-tl-sm"
                                    }`}>
                                    {msg.type === "file" ? (
                                        <div className="flex items-center gap-3">
                                            <FileText className="h-5 w-5 opacity-80" />
                                            <span className="font-medium">{msg.text}</span>
                                        </div>
                                    ) : msg.type === "audio" ? (
                                        <div className="flex items-center gap-3">
                                            <Mic className="h-5 w-5 opacity-80" />
                                            <span className="font-medium">{msg.text}</span>
                                        </div>
                                    ) : (
                                        <div className="font-medium whitespace-pre-wrap leading-relaxed prose prose-sm prose-slate max-w-none prose-a:text-blue-600 prose-a:font-bold hover:prose-a:text-blue-500">
                                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                                        </div>
                                    )}
                                </div>
                                {msg.role === "user" && (
                                    <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-200 border border-slate-300 flex items-center justify-center shadow-md">
                                        <UserIcon className="h-5 w-5 text-slate-500" />
                                    </div>
                                )}
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex gap-4 justify-start animate-fade-in">
                                <div className="h-10 w-10 shrink-0 rounded-xl bg-linear-to-br from-primary to-secondary flex items-center justify-center shadow-md animate-pulse">
                                    <Sparkles className="h-5 w-5 text-white" />
                                </div>
                                <div className="px-6 py-4 rounded-3xl bg-white/80 backdrop-blur-md border border-white/60 text-slate-900 rounded-tl-sm flex items-center gap-3">
                                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                    <span className="font-medium text-slate-500">Thinking...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} className="h-1" />
                    </div>
                )}

                {/* Input bar container */}
                <div className="w-full max-w-4xl bg-white/80 backdrop-blur-md rounded-full flex items-center px-4 py-3 shadow-lg border border-white relative z-20 transition-all duration-300 focus-within:shadow-xl focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary/30 group/input hover:bg-white shrink-0 mt-auto">

                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="application/pdf"
                        onChange={handleFileUpload}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading || isRecording}
                        className="p-2 text-slate-400 hover:text-primary transition-colors rounded-full hover:bg-slate-100 shrink-0 focus:outline-none ml-1 disabled:opacity-50"
                        title="Upload PDF"
                    >
                        <Plus className="h-6 w-6" strokeWidth={2} />
                    </button>

                    <input
                        type="text"
                        placeholder={isRecording ? "Listening..." : "Enter your symptoms or medical report..."}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleSendText();
                        }}
                        disabled={isLoading || isRecording}
                        className="flex-1 bg-transparent text-slate-900 placeholder-slate-400 outline-none px-4 py-2 text-lg sm:text-lg w-full font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                    />

                    <div className="flex items-center gap-2 pr-1 shrink-0">
                        {input.trim() ? (
                            <button
                                onClick={handleSendText}
                                disabled={isLoading}
                                className="bg-primary text-white rounded-full hover:bg-blue-600 hover:scale-105 active:scale-95 transition-all shadow-md flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 focus:outline-none disabled:opacity-50 disabled:hover:scale-100"
                                title="Send Message"
                            >
                                <Send className="h-5 w-5 sm:h-6 sm:w-6 transform -rotate-45 ml-1 mb-1" strokeWidth={2} />
                            </button>
                        ) : (
                            <button
                                onClick={toggleRecording}
                                disabled={isLoading}
                                className={`rounded-full transition-all shadow-md flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 focus:outline-none text-white ${isRecording
                                    ? "bg-red-500 animate-pulse hover:bg-red-600"
                                    : "bg-slate-900 hover:bg-slate-800 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                                    }`}
                                title={isRecording ? "Stop Recording" : "Send Voice Message"}
                            >
                                {isRecording ? (
                                    <AudioLines className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.5} />
                                ) : (
                                    <Mic className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2} />
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
