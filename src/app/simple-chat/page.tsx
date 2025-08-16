"use client";

import { useState } from "react";
import Link from "next/link";

type ChatMessage = {
  isUser: boolean;
  text: string;
};

const ChatMessageItem = ({ message }: { message: ChatMessage }) => {
  return (
    <p className="whitespace-pre-line border border-b-1 border-slate-400 p-2 m-2">
      {message.isUser ? "You" : "Bot"}: {message.text}
    </p>
  );
};

const SimpleChat = () => {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setIsLoading(true);
    setPrompt("");

    setMessages((prevState) => [...prevState, { isUser: true, text: prompt }]);

    try {
      const response = await fetch("/api/simple-chat", {
        method: "POST",
        body: JSON.stringify({ prompt }),
      });

      if (response.ok) {
        const result = await response.json();
        setMessages((prevState) => [
          ...prevState,
          { isUser: false, text: result },
        ]);
      }
    } catch (error) {
      console.error("Failed to get response:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          Simple Chat (Tutorial Pattern)
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-4">
            {messages.map((message, index) => (
              <ChatMessageItem key={index} message={message} />
            ))}
          </div>

          {isLoading && <p className="text-gray-500">Loading...</p>}

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Enter your message..."
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!prompt.trim() || isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Submit
            </button>
          </form>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            ← Back to HR Chatbot
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SimpleChat;
