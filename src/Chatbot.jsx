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

    const useVisitorTracking = () => {
        useEffect(() => {
            let visitorId = localStorage.getItem("visitorId");

            if (!visitorId) {
                visitorId = Date.now().toString();
                localStorage.setItem("visitorId", visitorId);

                let visitCount = parseInt(localStorage.getItem("visitorCount")) || 0;
                visitCount += 1;
                localStorage.setItem("visitorCount", visitCount);
            }

            console.log("Unique visitors count:", localStorage.getItem("visitorCount"));

            const trackPageVisit = (pageURL) => {
                let visitedPages = JSON.parse(localStorage.getItem("visitedPages")) || [];
                let now = new Date();

                let lastVisit = visitedPages.length > 0 ? visitedPages[visitedPages.length - 1] : null;

                if (!lastVisit || lastVisit.page !== pageURL || (now - new Date(lastVisit.time)) > 10000) {
                    visitedPages.push({ page: pageURL, time: now.toISOString() });
                    localStorage.setItem("visitedPages", JSON.stringify(visitedPages));
                }

                console.log("Visited Pages:", visitedPages);
            };

            // Track current page if chatbot is on the same site
            trackPageVisit(window.location.href);

            // Listen for messages from parent page (if embedded)
            window.addEventListener("message", (event) => {
                if (event.data && event.data.type === "PAGE_URL") {
                    trackPageVisit(event.data.url);
                }
            }, false);
        }, []);
    };

    useVisitorTracking();

    const handleSend = () => {
        if (!input.trim()) return;

        const userMessage = { sender: "user", text: input.trim() };
        setMessages([...messages, userMessage]);
        setInput("");

        setTimeout(() => {
            const botReply = getBotResponse(input.trim());
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
        <>
            <div className="fixed bottom-6 right-6 flex flex-col items-end">
                {!isOpen && (
                    <motion.button
                        initial={{ y: 0 }}
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        whileHover={{ scale: 1.2, rotate: 5 }}
                        className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg hover:scale-110 hover:shadow-xl transition-all duration-300"
                        onClick={() => setIsOpen(true)}
                    >
                        <motion.div
                            animate={{ rotate: [0, 5, -5, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                            className="w-12 h-12 flex items-center justify-center"
                        >
                            <img src={Bot} alt="Chatbot Icon" className="w-8 h-auto" />
                        </motion.div>
                    </motion.button>
                )}

                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 30 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="flex flex-col h-[650px] w-[90vw] max-w-[400px] bg-gray-100 rounded-2xl shadow-2xl"
                    >
                        <div className="flex justify-between items-center bg-white text-black p-4 rounded-t-2xl">
                            <div className="p-2 rounded hover:bg-gray-200 cursor-pointer" onClick={() => setIsOpen(false)}>
                                <X size={20} />
                            </div>
                        </div>

                        <div className="flex flex-col items-center bg-white py-2">
                            <motion.img
                                initial={{ scale: 0.8 }}
                                animate={{ scale: [0.8, 1, 0.8] }}
                                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                src={Bot} alt="Chatbot" className="w-16 rounded-full h-auto"
                            />
                            <h1 className="font-bold mt-2 text-lg">Chatbot</h1>
                        </div>

                        <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                    className={`flex items-end space-x-2 w-max max-w-xs ${msg.sender === "user" ? "ml-auto flex-row-reverse" : ""}`}
                                >
                                    <img src={msg.sender === "user" ? UserImage : Bot} alt="User" className="w-10 h-10 rounded-full" />
                                    <div className={`p-3 rounded-xl text-sm max-w-[75%] ${msg.sender === "user" ? "bg-blue-600 text-white" : "bg-gray-200 text-black"}`}>
                                        {msg.text}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="p-2 flex items-center border border-gray-300">
                            <input
                                type="text"
                                className="flex-1 p-2 bg-gray-100 text-black rounded-lg outline-none"
                                placeholder="Type a message..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            />
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                whileHover={{ scale: 1.1 }}
                                onClick={handleSend}
                                className="p-2 ml-2 bg-blue-700 rounded-lg text-white"
                            >
                                <Send size={20} />
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </div>
        </>
    );
};

export default Chatbot;
