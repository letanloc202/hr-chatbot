"use client";

import { useState, useEffect, useRef } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface ChatWindowProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  userInfo?: string;
}

const AVAILABLE_MODELS = [
  { value: "openai/gpt-4o-mini", label: "GPT-4o Mini" },
  { value: "meta-llama/llama-3.3-70b-instruct", label: "Llama 3.3 70B" },
  { value: "openai/gpt-oss-20b", label: "GPT-OSS 20B" },
];

export default function ChatWindow({
  selectedModel,
  onModelChange,
  userInfo,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const generateMessageId = () => {
    // Use timestamp + random number to ensure uniqueness
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await fetch("/api/chat/messages");
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!inputMessage.trim() || isLoading) return;

    setIsLoading(true);
    setInputMessage("");

    // Add user message immediately
    const userMessage: Message = {
      id: generateMessageId(),
      role: "user",
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      // Get chat response with user info
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: inputMessage,
          model: selectedModel,
          userInfo: userInfo || "No user information available",
        }),
      });

      if (response.ok) {
        const result = await response.json();

        // Ensure we have a string for the content
        let content = "I'm sorry, I couldn't process your request.";

        if (typeof result.response === "string") {
          content = result.response;
        } else if (typeof result === "string") {
          content = result;
        } else if (result && typeof result === "object") {
          // If result is an object, try to extract the response
          content = result.response || result.reply || JSON.stringify(result);
        }

        const assistantMessage: Message = {
          id: generateMessageId(),
          role: "assistant",
          content: content,
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // Show toast based on isNeedTimeOff
        if (result.is_need_time_off || result.isNeedTimeOff) {
          showToast("Leave case created successfully!", "success");
        }
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      showToast("Failed to send message", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = async () => {
    try {
      await fetch("/api/chat/reset", { method: "POST" });
      setMessages([]);
      showToast("Chat reset successfully", "success");
    } catch (error) {
      console.error("Failed to reset chat", error);
      showToast("Failed to reset chat", "error");
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="p-4 border-b border-slate-600 bg-slate-700 flex-shrink-0">
        <div className="flex items-center justify-center mb-3">
          {/* HR Assistant Avatar */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg">
              <img
                src="https://media.istockphoto.com/id/1221348467/vi/vec-to/chat-bot-ai-v%C3%A0-kh%C3%A1i-ni%E1%BB%87m-h%E1%BB%97-tr%E1%BB%A3-d%E1%BB%8Bch-v%E1%BB%A5-kh%C3%A1ch-h%C3%A0ng-vector-ph%E1%BA%B3ng-ng%C6%B0%E1%BB%9Di-minh-h%E1%BB%8Da-robot-m%E1%BB%89m.jpg?s=612x612&w=0&k=20&c=eIKO0Q7QvGxidyBt-KbGLWPYEIHxp2dPOM9i1jxEWcg="
                alt="HR Assistant"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <h3 className="text-lg font-semibold text-white">
              HR Assistant Chat
            </h3>
          </div>

          {/* Reload Button */}
          <button
            onClick={handleResetChat}
            className="ml-4 p-2 text-slate-400 hover:text-white hover:bg-slate-600 rounded-lg transition-colors"
            title="Reset Chat"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>

        {/* Model Selection */}
        <div className="flex justify-center">
          <div className="flex items-center space-x-3">
            <label
              htmlFor="model-select"
              className="text-sm font-medium text-slate-300"
            >
              AI Model:
            </label>
            <select
              id="model-select"
              value={selectedModel}
              onChange={(e) => onModelChange(e.target.value)}
              className="block w-48 rounded-lg border-slate-600 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-sm font-medium bg-slate-800 text-white border"
            >
              {AVAILABLE_MODELS.map((model) => (
                <option key={model.value} value={model.value}>
                  {model.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-800 min-h-0">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                message.role === "user"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-slate-700 text-slate-200 shadow-sm border border-slate-600"
              }`}
            >
              <p className="text-sm whitespace-pre-line leading-relaxed">
                {message.content}
              </p>
              <p
                className={`text-xs mt-2 ${
                  message.role === "user" ? "text-blue-100" : "text-slate-400"
                }`}
              >
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-700 text-slate-200 px-4 py-3 rounded-lg shadow-sm border border-slate-600">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Persistent Input Bar */}
      <div className="p-4 border-t border-slate-600 bg-slate-700 flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(event) => setInputMessage(event.target.value)}
            placeholder="Ask about company policies, request time off, or get HR assistance..."
            className="flex-1 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-slate-800 text-white placeholder-slate-400"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm transition-colors"
          >
            Send
          </button>
        </form>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            toast.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
