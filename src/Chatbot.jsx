import React, { useState, useRef, useEffect } from "react";
import { ArrowLeft, Ellipsis, X, Send } from "lucide-react";
import { motion } from "framer-motion";
import Bot from './assets/bot.png';
import UserImage from './assets/user.jpg';

const useVisitorTracking = () => {
    const [visitorData, setVisitorData] = useState({ visitedPages: [], country: null });

    useEffect(() => {
        let storedData = JSON.parse(localStorage.getItem("visitorData")) || { visitedPages: [], country: null };
        setVisitorData(storedData);

        const fetchCountry = async () => {
            if (!storedData.country) {
                try {
                    const res = await fetch("https://api.country.is/");
                    const data = await res.json();
                    storedData.country = data.country;
                    localStorage.setItem("visitorData", JSON.stringify(storedData));
                    setVisitorData({ ...storedData });
                } catch (error) {
                    console.error("Error fetching country:", error);
                }
            }
        };
        fetchCountry();

        const trackPageVisit = (pageURL) => {
            if (!storedData.visitedPages.some((entry) => entry.page === pageURL)) {
                storedData.visitedPages.push({ page: pageURL, time: new Date().toISOString() });
                localStorage.setItem("visitorData", JSON.stringify(storedData));
                setVisitorData({ ...storedData });
            }
        };

        trackPageVisit(window.location.href);

        useEffect(() => {
            function handleMessage(event) {
                // Ensure message is coming from the correct origin
                if (event.origin !== "https://yourwebsite.com") return; 
        
                if (event.data.type === "PAGE_URL") {
                    console.log("Tracking Page:", event.data.url);
        
                    // Save URL in visitorData state or database
                    setVisitorData(prevData => ({
                        ...prevData,
                        visitedPages: [...prevData.visitedPages, { page: event.data.url, time: new Date().toISOString() }]
                    }));
                }
            }
        
            window.addEventListener("message", handleMessage);
        
            return () => {
                window.removeEventListener("message", handleMessage);
            };
        }, []);

    return visitorData;
};

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState(() => {
        return JSON.parse(localStorage.getItem("chatMessages")) || [{ sender: "bot", text: "Hello! How can I help you?" }];
    });
    const [input, setInput] = useState("");
    const chatRef = useRef(null);
    useVisitorTracking();

    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
        localStorage.setItem("chatMessages", JSON.stringify(messages));
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;
        const userMessage = { sender: "user", text: input.trim() };
        setMessages((prev) => [...prev, userMessage]);
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
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ name: "", email: "", service: "" });

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        setShowForm(false);
        setMessages((prev) => [
            ...prev,
            { sender: "user", text: "I submitted my details." },
            { sender: "bot", text: "Thank you! We will contact you soon." }
        ]);
        setFormData({ name: "", email: "", service: "" });
    };

    return (
        <>
            <div className="fixed bottom-6 right-6 flex flex-col items-end">
                {!isOpen && (
                    <div className="fixed bottom-6 right-6 flex flex-col items-center space-y-2">
                        {/* Floating Text + Hand Wave */}
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="relative flex flex-col items-center"
                        >
                            <motion.div
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                                className="absolute -top-4 -left-5 text-xl"
                            >
                                👋
                            </motion.div>
                            <div className="text-sm font-bold text-blue-700 bg-white px-2 py-1 rounded-full shadow">
                                Chat with us!
                            </div>
                        </motion.div>

                        {/* Chatbot Button */}
                        <motion.button
                            initial={{ y: 0 }}
                            animate={{ y: [0, -5, 0] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                            whileHover={{ scale: 1.2, rotate: 5 }}
                            className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg hover:scale-110 hover:shadow-xl transition-all duration-300 relative"
                            onClick={() => setIsOpen(true)}
                        >
                            <motion.div
                                animate={{ rotate: [0, 5, -5, 0] }}
                                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                                className="w-12 h-12 flex items-center justify-center"
                            >
                                <img src={Bot} alt="Chatbot Icon" className="w-8 h-auto" />
                            </motion.div>

                            {/* Notification Badge */}
                            <span className="absolute top-0 right-0 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                1
                            </span>
                        </motion.button>
                    </div>
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
                            <motion.img
                                initial={{ scale: 0.8 }}
                                animate={{ scale: [0.8, 1, 0.8] }}
                                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                src={Bot} alt="Chatbot" className="w-16 rounded-full h-auto"
                            />
                            <h1 className="font-bold mt-2 text-lg">Chatbot</h1>
                        </div>

                        <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col scroll-smooth">
                            {messages.map((msg, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                    className={`flex items-end space-x-2 w-max max-w-xs ${msg.sender === "user" ? "ml-auto flex-row-reverse" : ""}`}
                                    >
                                    <img
                                        src={msg.sender === "user" ? UserImage : Bot}
                                        alt={msg.sender === "user" ? "User" : "Bot"}
                                        className="w-10 h-10 rounded-full"
                                    />
                                    <div
                                        className={`p-3 rounded-xl text-sm max-w-[75%] ${
                                            msg.sender === "user" ? "bg-blue-600 text-white self-end shadow-md" : "bg-gray-200 text-black self-start shadow"
                                         }`}
                                         
                                    >
                                        {msg.text}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                        <div className="p-4">
                            {!showForm ? (
                                <button
                                    className="w-full p-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
                                    onClick={() => setShowForm(true)}
                                >
                                    Contact Support
                                </button>
                            ) : (
                                <div className="bg-white p-4 rounded-lg shadow">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="text-lg font-bold mx-auto">Contact Support</h3>
                                        <button className="p-2 rounded hover:bg-gray-200" onClick={() => setShowForm(false)}>
                                            <X size={20} />
                                        </button>
                                    </div>
                                    <form onSubmit={handleSubmit} className="space-y-3">
                                        <input
                                            type="text"
                                            name="name"
                                            placeholder="Your Name ..."
                                            required
                                            className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm transition-all duration-200"
                                            onChange={handleInputChange}
                                        />
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="Your Email ..."
                                            required
                                            className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm transition-all duration-200"
                                            onChange={handleInputChange}
                                        />
                                        <select
                                            name="service"
                                            required
                                            className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm transition-all duration-200"
                                            onChange={handleInputChange}
                                        >
                                            <option value="">Select a Service</option>
                                            <option value="UI/UX Design">UI/UX Design</option>
                                            <option value="Web Development">Web Development</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        <button
                                            type="submit"
                                            className="w-full p-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
                                        >
                                            Submit
                                        </button>
                                    </form>
                                </div>
                            )}
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
