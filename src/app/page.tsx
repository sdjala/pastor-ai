"use client";

import { useRef, useState } from "react";

import Image from "next/image";

type MediaType = "image" | "audio" | "video" | "file";

interface Message {
  id: number;
  text?: string;
  sender: "user" | "ai";
  media?: {
    type: MediaType;
    url: string;
    fileName?: string;
  };
  isLoading?: boolean;
}

interface Conversation {
  id: number;
  title: string;
  lastMessage?: string;
  messages: Message[];
  timestamp: Date;
  topic?: string;
}

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 1,
      title: "Spiritual Guidance",
      messages: [{ 
        id: 1, 
        text: "Greetings! I am PastorAI, here to provide spiritual guidance and support based on Biblical teachings. How may I assist you today?", 
        sender: "ai" 
      }],
      timestamp: new Date(),
    },
  ]);
  const [currentConversationId, setCurrentConversationId] = useState<number>(1);
  const [inputMessage, setInputMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [isAiResponding, setIsAiResponding] = useState(false);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentConversation = conversations.find(c => c.id === currentConversationId);
  const messages = currentConversation?.messages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const createNewConversation = () => {
    const newConversation: Conversation = {
      id: Date.now(),
      title: "New Spiritual Discussion",
      messages: [{ 
        id: 1, 
        text: "Greetings! I am PastorAI, here to provide spiritual guidance and support based on Biblical teachings. How may I assist you today?", 
        sender: "ai" 
      }],
      timestamp: new Date(),
    };
    setConversations([...conversations, newConversation]);
    setCurrentConversationId(newConversation.id);
  };

  const updateConversationMessages = (newMessages: Message[]) => {
    setConversations(conversations.map(conv => 
      conv.id === currentConversationId 
        ? {
            ...conv,
            messages: newMessages,
            lastMessage: newMessages[newMessages.length - 1]?.text || "Media message",
            timestamp: new Date()
          }
        : conv
    ));
  };

  const getAiResponse = async (messages: Message[]) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) throw new Error('AI response failed');

      const data = await response.json();
      return data.message;
    } catch (error) {
      console.error('Error getting AI response:', error);
      return "I apologize, but I'm having trouble responding right now. Please try again later.";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() && !isAiResponding) return;

    const newMessages = [
      ...messages,
      { id: messages.length + 1, text: inputMessage, sender: "user" as const },
    ];
    updateConversationMessages(newMessages);
    setInputMessage("");
    setIsAiResponding(true);

    // Add loading message
    const loadingMessages = [
      ...newMessages,
      { id: newMessages.length + 1, text: "...", sender: "ai" as const, isLoading: true },
    ];
    updateConversationMessages(loadingMessages);
    scrollToBottom();

    // Get AI response
    const aiResponse = await getAiResponse(newMessages);
    
    // Remove loading message and add AI response
    const finalMessages = [
      ...newMessages,
      { id: newMessages.length + 1, text: aiResponse, sender: "ai" as const },
    ];
    updateConversationMessages(finalMessages);
    setIsAiResponding(false);
    scrollToBottom();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        const newMessages = [
          ...messages,
          {
            id: messages.length + 1,
            sender: "user" as const,
            media: { type: "audio" as const, url },
          },
        ];
        updateConversationMessages(newMessages);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: MediaType) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    
    const newMessages = [
      ...messages,
      {
        id: messages.length + 1,
        sender: "user" as const,
        media: { 
          type,
          url,
          fileName: type === "file" ? file.name : undefined
        },
      },
    ];
    updateConversationMessages(newMessages);

    // Reset the input
    e.target.value = "";
  };

  const renderMedia = (media: { type: MediaType; url: string; fileName?: string }) => {
    switch (media.type) {
      case "image":
        return (
          <div className="relative w-48 h-48">
            <Image
              src={media.url}
              alt="Uploaded image"
              fill
              className="object-cover rounded-lg"
            />
          </div>
        );
      case "audio":
        return (
          <audio controls className="max-w-full">
            <source src={media.url} />
            Your browser does not support the audio element.
          </audio>
        );
      case "video":
        return (
          <video controls className="max-w-full rounded-lg max-h-[300px]">
            <source src={media.url} />
            Your browser does not support the video element.
          </video>
        );
      case "file":
        return (
          <div className="flex items-center gap-2 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <a href={media.url} download={media.fileName} className="hover:underline">
              {media.fileName || "Download file"}
            </a>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 border-r dark:border-gray-700 flex flex-col bg-gray-100 dark:bg-gray-800">
        {/* New Chat Button */}
        <div className="p-4">
          <button
            onClick={createNewConversation}
            className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Discussion
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => setCurrentConversationId(conversation.id)}
              className={`w-full text-left p-4 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
                currentConversationId === conversation.id ? 'bg-gray-200 dark:bg-gray-700' : ''
              }`}
            >
              <div className="font-medium text-gray-800 dark:text-white truncate">
                {conversation.title}
              </div>
              {conversation.lastMessage && (
                <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {conversation.lastMessage}
                </div>
              )}
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {conversation.timestamp.toLocaleDateString()}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b dark:border-gray-700 bg-white dark:bg-gray-800">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            {currentConversation?.title || "Spiritual Guidance"}
          </h1>
        </header>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.sender === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                } ${message.isLoading ? "animate-pulse" : ""}`}
              >
                {message.text && (
                  <div className="whitespace-pre-wrap">
                    {message.text}
                  </div>
                )}
                {message.media && (
                  <div className="mt-2">
                    {renderMedia(message.media)}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="border-t dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Share your thoughts or ask for guidance..."
              className="flex-1 rounded-full px-4 py-2 border dark:border-gray-600 focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              disabled={isAiResponding}
            />
            
            {/* Hidden file inputs */}
            <input
              type="file"
              ref={imageInputRef}
              onChange={(e) => handleFileUpload(e, "image")}
              accept="image/*"
              className="hidden"
            />
            <input
              type="file"
              ref={videoInputRef}
              onChange={(e) => handleFileUpload(e, "video")}
              accept="video/*"
              className="hidden"
            />
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFileUpload(e, "file")}
              className="hidden"
            />

            {/* Media buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white rounded-full p-2 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title="Share an image"
                disabled={isAiResponding}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white rounded-full p-2 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title="Share a video"
                disabled={isAiResponding}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`${
                  isRecording ? "bg-red-500 hover:bg-red-600" : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                } text-gray-700 dark:text-white rounded-full p-2 transition-colors`}
                title={isRecording ? "Stop recording" : "Record audio"}
                disabled={isAiResponding}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white rounded-full p-2 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title="Share a document"
                disabled={isAiResponding}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
            </div>

            <button
              type="submit"
              className="bg-blue-600 text-white rounded-full px-6 py-2 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isAiResponding || (!inputMessage.trim() && !isRecording)}
            >
              {isAiResponding ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                "Send"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
