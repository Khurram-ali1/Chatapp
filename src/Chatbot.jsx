import React, { useState, useRef, useEffect } from "react";
import { ArrowLeft, Ellipsis, X, Send } from "lucide-react";
import { motion } from "framer-motion";
import Bot from './assets/bot.png';
import UserImage from './assets/user.jpg';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([{ sender: "bot", text: "Hello! How can I help you?" }]);
    const [input, setInput] = useState("");
    const chatRef = useRef(null);

    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMessage = { sender: "user", text: input };
        setMessages([...messages, userMessage]);
        setInput("");

        setTimeout(() => {
            const botReply = getBotResponse(input);
            setMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
        }, 1000);
    };

    const getBotResponse = (message) => {
        const responses = {
            "hello": "Hi there! How can I assist you?",
            "hi": "Hello there! How can I assist you?",
            "how are you": "I'm just a bot, but I'm here to help!",
            "bye": "Goodbye! Have a great day!",
        };
        return responses[message.toLowerCase()] || "I'm not sure how to respond to that.";
    };

    return (
        <div className="fixed bottom-6 right-6 flex flex-col items-end">
            {!isOpen && (

                <div className="fixed bottom-6 right-6 flex flex-col items-center space-y-2">
                    {/* Floating Label + Hand */}
                    <div className="relative flex flex-col items-center">
                        {/* Floating Text */}
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="text-sm font-bold text-blue-700 bg-white px-2 py-1 rounded-full shadow"
                        >
                            Chat with us!
                        </motion.div>
                    </div>

                    {/* Chatbot Button */}
                    <motion.button
                        initial={{ y: 0 }}
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        className="w-16 h-16 rounded-full  flex items-center justify-center shadow-lg hover:scale-110 transition-all relative"
                        onClick={() => setIsOpen(true)}
                    >
                        <div className="w-12 h-12  rounded-full flex items-center justify-center">
                            <img src={Bot} alt="Chatbot Icon" className="w-8 h-auto" />
                        </div>

                        {/* Notification Badge */}
                        <span className="absolute top-0 right-0 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                            1
                        </span>
                    </motion.button>
                </div>


            )}

            {
                isOpen && (
                    <div className="flex flex-col h-[650px] w-[400px] bg-gray-100 rounded-2xl shadow-2xl">
                        <div className="flex justify-between items-center bg-white text-black p-4 rounded-t-2xl">
                            <div className="flex space-x-3">
                                <div className="p-2 rounded hover:bg-gray-200 cursor-pointer">
                                    <ArrowLeft size={20} />
                                </div>
                                <div className="p-2 rounded hover:bg-gray-200 cursor-pointer">
                                    <Ellipsis size={20} />
                                </div>
                            </div>
                            <div className="p-2 rounded hover:bg-gray-200 cursor-pointer" onClick={() => setIsOpen(false)}>
                                <X size={20} />
                            </div>
                        </div>

                        <div className="flex flex-col items-center bg-white py-2 mt-[-10px]">
                            <img src={Bot} alt="Chatbot" className="w-16 rounded-full h-auto" />
                            <h1 className="font-bold mt-2 text-lg">Chatbot</h1>
                        </div>

                        <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col scroll-smooth">
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`flex items-end space-x-2 w-max max-w-xs ${msg.sender === "user" ? "ml-auto flex-row-reverse" : ""
                                        }`}
                                >
                                    <img
                                        src={msg.sender === "user" ? UserImage : Bot}
                                        alt={msg.sender === "user" ? "User" : "Bot"}
                                        className="w-10 h-10 rounded-full"
                                    />
                                    <div
                                        className={`p-3 rounded-xl text-sm ${msg.sender === "user" ? "bg-blue-600 text-white" : "bg-gray-200 text-black"
                                            }`}
                                    >
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-2 flex items-center rounded-lg mb-5 w-[350px] border border-gray-300 mx-auto">
                            <input
                                type="text"
                                className="flex-1 p-2 bg-gray-100 text-black rounded-lg outline-none"
                                placeholder="Type a message..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            />
                            <button onClick={handleSend} className="p-2 ml-2 bg-blue-700 rounded-lg text-white">
                                <Send size={20} />
                            </button>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default Chatbot;
