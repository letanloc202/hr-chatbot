"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface Policy {
  id: string;
  title: string;
  description: string;
  color: string;
}

interface ChatWindowProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  userInfo?: string;
  policies: Policy[];
  employee?: Employee | null;
}

interface Employee {
  name: string;
  position: string;
  department: string;
  remainingLeaveDays: number;
  totalLeaveDays: number;
  hireDate: string;
  employeeId: string;
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
  policies,
  employee,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingMessage, setTypingMessage] = useState("AI đang trả lời...");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const greetingGeneratedRef = useRef(false);

  const generateMessageId = () => {
    // Use timestamp + random number to ensure uniqueness
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Generate greeting when there are no messages
  const generateGreeting = useCallback(async () => {
    if (!userInfo && !employee) return;

    // Prevent duplicate API calls
    if (greetingGeneratedRef.current) return;

    greetingGeneratedRef.current = true;
    setIsTyping(true);
    setTypingMessage("AI đang tạo lời chào...");

    try {
      // Use employee data if available, otherwise use userInfo
      const userInfoToSend = employee
        ? `Employee: ${employee.name} (${employee.position}) - Department: ${employee.department} - Hire Date: ${employee.hireDate}`
        : userInfo;

      const response = await fetch("/api/get_hello", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_info: userInfoToSend }),
      });

      if (response.ok) {
        const result = await response.json();
        const greetingMessage: Message = {
          id: generateMessageId(),
          role: "assistant",
          content: result.greeting,
          timestamp: new Date().toISOString(),
        };
        setMessages([greetingMessage]);
      }
    } catch (error) {
      console.error("Failed to generate greeting:", error);
      // Fallback greeting
      const fallbackGreeting: Message = {
        id: generateMessageId(),
        role: "assistant",
        content:
          "Xin chào! Tôi là trợ lý nhân sự của công ty. Tôi có thể giúp bạn với các câu hỏi về chính sách công ty, yêu cầu nghỉ phép hoặc hỗ trợ nhân sự khác. Bạn cần tôi giúp gì hôm nay?",
        timestamp: new Date().toISOString(),
      };
      setMessages([fallbackGreeting]);
    } finally {
      setIsTyping(false);
      setTypingMessage("AI đang trả lời...");
    }
  }, [userInfo, employee]);

  // Load chat history from localStorage on component mount
  useEffect(() => {
    // Only generate greeting if there are no messages and greeting hasn't been generated yet
    if (messages.length === 0 && !greetingGeneratedRef.current) {
      generateGreeting();
    }
  }, [userInfo, employee, generateGreeting, messages.length]);

  // Reset greeting flag when userInfo or employee changes significantly
  useEffect(() => {
    // If we have messages and the user info changes, we might want to regenerate
    // But only if there's a significant change (like switching to a different employee)
    if (messages.length > 0) {
      // Reset the flag to allow regeneration if needed
      greetingGeneratedRef.current = false;
    }
  }, [userInfo, employee, messages.length]);

  // Extract user initials from userInfo or employee
  const getUserInitials = (userInfo: string) => {
    // If we have employee data, use it directly
    if (employee && employee.name) {
      const words = employee.name.split(" ");
      if (words.length >= 2) {
        return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
      } else if (words.length === 1) {
        return words[0][0].toUpperCase();
      }
    }

    // Fallback to parsing userInfo
    try {
      const nameMatch = userInfo.match(/Employee:\s*([^(]+)/);
      if (nameMatch && nameMatch[1]) {
        const name = nameMatch[1].trim();
        const words = name.split(" ");
        if (words.length >= 2) {
          return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
        } else if (words.length === 1) {
          return words[0][0].toUpperCase();
        }
      }
      return "U"; // Default fallback
    } catch {
      return "U"; // Default fallback
    }
  };

  // Messages are only kept in frontend state, not persisted to localStorage
  // This ensures they are cleared on F5 refresh

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

    // Show typing indicator after a short delay
    setTimeout(() => {
      setIsTyping(true);
      setTypingMessage("AI đang trả lời...");
    }, 300);

    try {
      // Prepare the data to send to server
      const requestData = {
        message: inputMessage,
        model: selectedModel,
        history_chat: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        user_info: employee
          ? `Employee: ${employee.name} (${employee.position}) - Department: ${employee.department} - Hire Date: ${employee.hireDate}`
          : userInfo || "No user information available",
        policies: policies.map((policy) => ({
          title: policy.title,
          description: policy.description,
        })),
      };

      // Get chat response with all required data
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
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
        console.log(result);
        // Show toast based on isNeedTimeOff
        if (result.isNeedTimeOff) {
          showToast(
            "I've detected you need time off! I can help you create a leave request. Just let me know the details!",
            "success"
          );
        }
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      showToast("Failed to send message", "error");
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleResetChat = () => {
    setMessages([]);
    // Reset the greeting flag when resetting chat
    greetingGeneratedRef.current = false;
    // Messages are only in frontend state, no need to clear localStorage
    // Generate a new greeting after reset
    setTimeout(() => {
      generateGreeting();
    }, 100);
    showToast("Chat reset successfully", "success");
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="p-6 border-b border-slate-600/50 bg-gradient-to-r from-slate-700 to-slate-800 flex-shrink-0 shadow-lg">
        <div className="flex items-center justify-center mb-4">
          {/* HR Assistant Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
              HR Assistant Chat
            </h3>
          </div>

          {/* Reload Button */}
          <button
            onClick={handleResetChat}
            disabled={isTyping}
            className="ml-6 p-3 text-slate-300 hover:text-white hover:bg-slate-600/50 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:hover:scale-100"
            title="Reset Chat"
          >
            <svg
              className="w-5 h-5"
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
          <div className="flex items-center space-x-4">
            <label
              htmlFor="model-select"
              className="text-sm font-semibold text-slate-200"
            >
              AI Model:
            </label>
            <select
              id="model-select"
              value={selectedModel}
              onChange={(e) => onModelChange(e.target.value)}
              className="block w-52 rounded-xl border-slate-600/50 shadow-lg focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/50 text-sm font-medium bg-slate-800/80 text-white border backdrop-blur-sm transition-all duration-200 hover:bg-slate-800 focus:bg-slate-800"
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
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-800 min-h-0">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`flex ${
                message.role === "user" ? "flex-row-reverse" : "flex-row"
              } items-start space-x-3 max-w-4xl`}
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                {message.role === "user" ? (
                  <div className="ml-2 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-lg ring-2 ring-blue-400/30">
                    {getUserInitials(userInfo || "")}
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center shadow-lg ring-2 ring-slate-400/30">
                    <img
                      src="https://media.istockphoto.com/id/1221348467/vi/vec-to/chat-bot-ai-v%C3%A0-kh%C3%A1i-ni%E1%BB%87m-h%E1%BB%97-tr%E1%BB%A3-d%E1%BB%8Bch-v%E1%BB%A5-kh%C3%A1ch-h%C3%A0ng-vector-ph%E1%BA%B3ng-ng%C6%B0%E1%BB%9Di-minh-h%E1%BB%8Da-robot-m%E1%BB%89m.jpg?s=612x612&w=0&k=20&c=eIKO0Q7QvGxidyBt-KbGLWPYEIHxp2dPOM9i1jxEWcg="
                      alt="HR Assistant"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                )}
              </div>

              {/* Message Content */}
              <div
                className={`max-w-xs lg:max-w-md xl:max-w-2xl px-5 py-4 rounded-2xl shadow-xl ${
                  message.role === "user"
                    ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-500/25"
                    : "bg-gradient-to-br from-slate-700 to-slate-800 text-slate-100 shadow-slate-900/50 border border-slate-600/50"
                } relative group`}
              >
                {/* Message bubble tail */}
                <div
                  className={`absolute top-3 w-3 h-3 transform rotate-45 ${
                    message.role === "user"
                      ? "right-[-6px] bg-blue-500"
                      : "left-[-6px] bg-slate-700"
                  }`}
                ></div>

                <div className="text-sm leading-relaxed font-medium whitespace-pre-line">
                  {message.content}
                </div>

                <p
                  className={`text-xs mt-3 opacity-80 font-medium ${
                    message.role === "user" ? "text-blue-100" : "text-slate-300"
                  }`}
                >
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex flex-row items-start space-x-3">
              {/* AI Avatar */}
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center shadow-lg ring-2 ring-slate-400/30">
                  <img
                    src="https://media.istockphoto.com/id/1221348467/vi/vec-to/chat-bot-ai-v%C3%A0-kh%C3%A1i-ni%E1%BB%87m-h%E1%BB%97-tr%E1%BB%A3-d%E1%BB%8Bch-v%E1%BB%A5-kh%C3%A1ch-h%C3%A0ng-vector-ph%E1%BA%B3ng-ng%C6%B0%E1%BB%9Di-minh-h%E1%BB%8Da-robot-m%E1%BB%89m.jpg?s=612x612&w=0&k=20&c=eIKO0Q7QvGxidyBt-KbGLWPYEIHxp2dPOM9i1jxEWcg="
                    alt="HR Assistant"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              </div>

              {/* Loading Indicator */}
              <div className="bg-gradient-to-br from-slate-700 to-slate-800 text-slate-200 px-5 py-4 rounded-2xl shadow-xl border border-slate-600/50 relative">
                <div className="absolute top-3 left-[-6px] w-3 h-3 transform rotate-45 bg-slate-700"></div>
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-slate-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-3 h-3 bg-slate-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-3 h-3 bg-slate-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {isTyping && !isLoading && (
          <div className="flex justify-start">
            <div className="flex flex-row items-start space-x-3">
              {/* AI Avatar */}
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center shadow-lg ring-2 ring-slate-400/30">
                  <img
                    src="https://media.istockphoto.com/id/1221348467/vi/vec-to/chat-bot-ai-v%C3%A0-kh%C3%A1i-ni%E1%BB%87m-h%E1%BB%97-tr%E1%BB%A3-d%E1%BB%8Bch-v%E1%BB%A5-kh%C3%A1ch-h%C3%A0ng-vector-ph%E1%BA%B3ng-ng%C6%B0%E1%BB%9Di-minh-h%E1%BB%8Da-robot-m%E1%BB%89m.jpg?s=612x612&w=0&k=20&c=eIKO0Q7QvGxidyBt-KbGLWPYEIHxp2dPOM9i1jxEWcg="
                    alt="HR Assistant"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              </div>

              {/* Typing Indicator */}
              <div className="bg-gradient-to-br from-slate-700 to-slate-800 text-slate-200 px-5 py-4 rounded-2xl shadow-xl border border-slate-600/50 relative">
                <div className="absolute top-3 left-[-6px] w-3 h-3 transform rotate-45 bg-slate-700"></div>
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-slate-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-3 h-3 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-3 h-3 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                  <span className="text-sm text-slate-300 font-medium">
                    {typingMessage}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Persistent Input Bar */}
      <div className="p-6 border-t border-slate-600/50 bg-gradient-to-r from-slate-700 to-slate-800 flex-shrink-0 shadow-lg">
        <form onSubmit={handleSubmit} className="flex space-x-4">
          <input
            type="text"
            value={inputMessage}
            onChange={(event) => setInputMessage(event.target.value)}
            placeholder="Ask about company policies, request time off, or get HR assistance..."
            className="flex-1 border border-slate-600/50 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent text-sm bg-slate-800/80 text-white placeholder-slate-400 backdrop-blur-sm shadow-lg transition-all duration-200 hover:bg-slate-800 focus:bg-slate-800"
            disabled={isLoading || isTyping}
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading || isTyping}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-2xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:hover:scale-100"
          >
            Send
          </button>
        </form>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 p-4 rounded-2xl shadow-2xl z-50 backdrop-blur-sm border ${
            toast.type === "success"
              ? "bg-gradient-to-r from-green-500 to-green-600 text-white border-green-400/30"
              : "bg-gradient-to-r from-red-500 to-red-600 text-white border-red-400/30"
          } transition-all duration-300 transform translate-x-0`}
        >
          <div className="flex items-center space-x-2">
            {toast.type === "success" ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
