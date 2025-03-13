import React, { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Ellipsis,
  X,
  Send,
  Check,
  CheckCheck,
  Paperclip,
  Plus,
} from "lucide-react";
import { motion } from "framer-motion";
import EmojiPicker from "emoji-picker-react";
import Bot from "./assets/bot.png";
import UserImage from "./assets/user.jpg";

const useVisitorTracking = () => {
  const [visitorData, setVisitorData] = useState({
    visitedPages: [],
    country: null,
    visitorCount: 0,
  });

  // Fetch visitor's IP address
  const fetchIP = async () => {
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      return data.ip || null; // Return the IP address
    } catch (error) {
      console.error("Error fetching IP:", error);
      return null;
    }
  };

  // Fetch visitor's country based on IP
  const fetchCountry = async () => {
    const ip = await fetchIP();
    if (!ip) return null;

    try {
      const response = await fetch(`https://ipinfo.io/${ip}/json`);
      const data = await response.json();
      return data.country || null; // Return the country name
    } catch (error) {
      console.error("Error fetching country:", error);
      return null;
    }
  };

  // Track page visits
  const trackPageVisit = (pageURL) => {
    console.log("Tracking page visit:", pageURL); // Debug log
    const now = new Date().toISOString();
  
    setVisitorData((prev) => {
      const updatedPages = Array.isArray(prev.visitedPages) ? prev.visitedPages : [];
  
      // Check if the page has already been visited
      if (!updatedPages.some((entry) => entry.page === pageURL)) {
        const newVisitedPages = [...updatedPages, { page: pageURL, time: now }];
        const updatedData = { ...prev, visitedPages: newVisitedPages };
  
        // Update localStorage
        localStorage.setItem("visitorData", JSON.stringify(updatedData));
        return updatedData;
      }
      return prev;
    });
  };
  useEffect(() => {
    console.log("Current page URL:", window.location.href); // Debug log
    trackPageVisit(window.location.href);
  }, []);

  useEffect(() => {
    // Initialize visitor data from localStorage
    let storedData;
    try {
      storedData = JSON.parse(localStorage.getItem("visitorData")) || {
        visitedPages: [],
        country: null,
        visitorCount: 0,
      };
    } catch (error) {
      console.error("Error parsing visitor data:", error);
      storedData = { visitedPages: [], country: null, visitorCount: 0 };
    }
  
    // Check if it's the first visit
    if (!localStorage.getItem("visitorHasVisited")) {
      // Increment visitor count for the first visit
      storedData.visitorCount = (storedData.visitorCount || 0) + 1;
      localStorage.setItem("visitorHasVisited", "true"); // Set the flag
    }
  
    // Fetch and update country if not already set
    if (!storedData.country) {
      fetchCountry().then((country) => {
        const updatedData = { ...storedData, country };
        localStorage.setItem("visitorData", JSON.stringify(updatedData));
        setVisitorData(updatedData);
      });
    } else {
      setVisitorData(storedData);
    }
  
    // Save the updated visitor data to localStorage
    localStorage.setItem("visitorData", JSON.stringify(storedData));
  
    // Track the current page visit
    trackPageVisit(window.location.href);
  
    // Listen for messages to track page visits from iframes or other sources
    const handleMessage = (event) => {
      if (event.data && event.data.type === "PAGE_URL") {
        trackPageVisit(event.data.url);
      }
    };
  
    window.addEventListener("message", handleMessage);
  
    // Cleanup event listener
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return visitorData;
};

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHomeOpen, setIsHomeOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello!", sender: "user", read: false },
    { id: 2, text: "Hi there!", sender: "bot" },
  ]);
  const [homemessages, setHomeMessages] = useState([
    {
      id: 1,
      sender: "support",
      text: "👋 Hi! How can we help?",
      time: "Just Now",
    },
    {
      id: 2,
      sender: "user",
      text: "I have a question",
      time: "March 4, 21:18",
    },
    {
      id: 3,
      sender: "user",
      text: "Sorry to keep you waiting...",
      time: "March 3, 20:38",
    },
    {
      id: 4,
      sender: "user",
      text: "How can i get your website...",
      time: "April 15, 20:38",
    },
  ]);
  const [input, setInput] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [typing, setTyping] = useState(false);
  const [file, setFile] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(UserImage);
  const [activeReactionPicker, setActiveReactionPicker] = useState(null);
  const chatRef = useRef(null);

  const visitorData = useVisitorTracking();

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, typing]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuOpen && !event.target.closest(".menu-container")) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  const handleSend = () => {
    if (!input.trim() && !file) return;

    const timestamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const userMessage = {
          sender: "user",
          text: input.trim(),
          file: reader.result,
          fileName: file.name,
          timestamp,
          read: false,
        };
        updateMessages(userMessage);
      };
      reader.readAsDataURL(file);
    } else {
      const userMessage = {
        sender: "user",
        text: input.trim(),
        file: null,
        fileName: null,
        timestamp,
        read: false,
      };
      updateMessages(userMessage);
    }
  };

  const updateMessages = (newMessage) => {
    setMessages((prev) => {
      const updatedMessages = [...prev, newMessage];
      localStorage.setItem("chatMessages", JSON.stringify(updatedMessages));
      return updatedMessages;
    });

    setInput("");
    setFile(null);

    setTyping(true);
    setTimeout(() => {
      const timestamp = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      const botResponse = {
        sender: "bot",
        text: "Thanks for your message!",
        timestamp,
      };

      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages, botResponse];
        const finalMessages = updatedMessages.map((msg) =>
          msg.sender === "user" && !msg.read ? { ...msg, read: true } : msg
        );
        localStorage.setItem("chatMessages", JSON.stringify(finalMessages));
        return finalMessages;
      });

      setTyping(false);
    }, 2000);
  };

  useEffect(() => {
    const storedMessages = localStorage.getItem("chatMessages");
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    }
  }, []);

  const handleEmojiClick = (emojiObject) => {
    setInput((prev) => prev + emojiObject.emoji);
  };

  const toggleReactionPicker = (index) => {
    setActiveReactionPicker(activeReactionPicker === index ? null : index);
  };

  const handleReaction = (index, emoji) => {
    const updatedMessages = [...messages];
    if (updatedMessages[index].reaction === emoji) {
      // If the same reaction is clicked again, remove it
      updatedMessages[index].reaction = null;
    } else {
      // Otherwise, replace the previous reaction
      updatedMessages[index].reaction = emoji;
    }
    setMessages(updatedMessages);
    setActiveReactionPicker(null); // Close the reaction picker
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 flex flex-col items-end">
        {!isOpen && (
          <div className="fixed bottom-6 right-6 flex flex-col items-center space-y-2">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="relative flex flex-col items-center"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  ease: "easeInOut",
                }}
                className="absolute -top-4 -left-5 text-xl"
              >
                👋
              </motion.div>
              <div className="text-sm font-bold text-blue-700 bg-white px-2 py-1 rounded-full shadow">
                Chat with us!
              </div>
            </motion.div>

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
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  ease: "easeInOut",
                }}
                className="w-12 h-12 flex items-center justify-center"
              >
                <img src={Bot} alt="Chatbot Icon" className="w-8 h-auto" />
              </motion.div>
              <span className="absolute top-0 right-0 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                1
              </span>
            </motion.button>
          </div>
        )}

        {isOpen && !isHomeOpen && (
          <div className="flex flex-col h-[550px] w-[80vw] max-w-[400px] bg-gray-100 rounded-2xl shadow-2xl">
            <div className="bg-blue-600 text-white p-4 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center">
                  Hi there <span className="ml-2">👋</span>
                </h2>
                <div
                  className="p-2 rounded hover:bg-blue-500 cursor-pointer"
                  onClick={() => setIsOpen(false)}
                >
                  <X size={20} />
                </div>
              </div>
              <p className="text-sm">
                Need help? Search our help center for answers or start a
                conversation:
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <h3 className="font-semibold text-lg mb-2">Conversations</h3>
              {homemessages.map((msg) => (
                <div
                  key={msg.id}
                  className="bg-white p-3 my-2 rounded-lg shadow hover:shadow-md hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                  onClick={() => {
                    console.log("Clicked message:", msg.id);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-100">
                      {msg.sender === "support" ? (
                        <img src={Bot} alt="Bot" className="w-6 h-6" />
                      ) : (
                        <img
                          src={UserImage}
                          alt="User"
                          className="w-6 h-6 rounded-full"
                        />
                      )}
                    </div>

                    <div className="flex-1">
                      <h4 className="font-semibold">
                        {msg.sender === "support" ? "Customer Support" : "You"}
                      </h4>
                      <p className="text-sm text-gray-600 truncate w-[230px]">
                        {msg.text}
                      </p>
                      <p className="text-xs text-gray-400">{msg.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3">
              <button
                className="w-full flex items-center justify-center bg-blue-600 text-white text-lg font-semibold py-3 rounded-lg shadow-lg hover:cursor-pointer"
                onClick={() => setIsHomeOpen(true)}
              >
                <Plus className="mr-2 w-5 h-5" />
                New Conversation
              </button>
            </div>
          </div>
        )}

        {isHomeOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 30 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col h-[550px] w-[80vw] max-w-[400px] bg-gray-100 rounded-2xl shadow-2xl"
          >
            <div className="flex justify-between items-center bg-white text-black p-4 rounded-t-2xl">
              <div
                className="p-2 rounded hover:bg-gray-200 cursor-pointer"
                onClick={() => setIsHomeOpen(false)}
              >
                <ArrowLeft size={20} />
              </div>
              <div className="flex space-x-3">
                <div className="relative menu-container">
                  <div
                    className="p-2 rounded hover:bg-gray-200 cursor-pointer"
                    onClick={() => setMenuOpen(!menuOpen)}
                  >
                    <Ellipsis size={20} />
                  </div>
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md p-2 text-sm z-50">
                      <label className="cursor-pointer flex items-center px-4 py-2 hover:bg-gray-100">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            setProfileImage(
                              URL.createObjectURL(e.target.files[0])
                            )
                          }
                        />
                        Change Avatar
                      </label>
                    </div>
                  )}
                </div>
                <div
                  className="p-2 rounded hover:bg-gray-200 cursor-pointer"
                  onClick={() => setIsHomeOpen(false)}
                >
                  <X size={20} />
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center bg-white py-2 mt-[-10px]">
              <motion.img
                initial={{ scale: 0.8 }}
                animate={{ scale: [0.8, 1, 0.8] }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut",
                }}
                src={Bot}
                alt="Chatbot"
                className="w-16 rounded-full h-auto"
              />
              <h1 className="font-bold mt-2 text-lg">Chatbot</h1>
            </div>

            <div
              ref={chatRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col scroll-smooth"
            >
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  className={`flex items-end space-x-2 w-max max-w-xs ${
                    msg.sender === "user" ? "ml-auto flex-row-reverse" : ""
                  }`}
                >
                  <img
                    src={
                      msg.sender === "user" ? profileImage || UserImage : Bot
                    }
                    alt={msg.sender === "user" ? "User" : "Bot"}
                    className="w-10 h-10 rounded-full"
                  />
                  <div
                    className={`p-2 leading-tight rounded-lg text-sm max-w-[80%] relative cursor-pointer ${
                      msg.sender === "user"
                        ? "bg-blue-600 text-white self-end shadow-md"
                        : "bg-gray-200 text-black self-start shadow"
                    }`}
                    onClick={() => toggleReactionPicker(index)} // Click to open reaction picker
                  >
                    {msg.text && <p>{msg.text}</p>}
                    {msg.file && (
                      <img
                        src={msg.file}
                        alt="Uploaded"
                        className="mt-2 w-48 h-48 rounded-lg shadow cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setSelectedImage(msg.file)}
                      />
                    )}
                    <div className="flex justify-between items-center mt-1">
                      <span
                        className={`text-xs ${
                          msg.sender === "user" ? "text-white" : "text-black"
                        }`}
                      >
                        {msg.timestamp}
                      </span>
                      {msg.sender === "user" && (
                        <span className="ml-2">
                          {msg.read ? (
                            <CheckCheck className="w-4 h-4 text-white" />
                          ) : (
                            <Check className="w-4 h-4 text-gray-400" />
                          )}
                        </span>
                      )}
                    </div>

                    {/* Reaction (positioned outside the message bubble) */}
                    {msg.reaction && (
                      <div
                        className={`absolute ${
                          msg.sender === "user" ? "right-[-3px]" : "left-[-3px]"
                        } bottom-[-20px] bg-white rounded-full p-[2px] shadow-sm flex items-center justify-center w-6 h-6`}
                      >
                        <span className="text-xs">{msg.reaction}</span>
                      </div>
                    )}

                    {/* Reaction Picker */}
                    {activeReactionPicker === index && (
                      <div
                        className="absolute bg-white rounded-lg shadow-lg p-2 flex space-x-2 z-50"
                        style={{
                          bottom: "100%",
                          left: msg.sender === "user" ? "auto" : "0",
                          right: msg.sender === "user" ? "0" : "auto",
                        }}
                        onClick={(e) => e.stopPropagation()} // Prevent click from closing the picker
                      >
                        {["😀", "❤️", "😂", "😢", "👍", "👎"].map(
                          (emoji, i) => (
                            <button
                              key={i}
                              onClick={() => handleReaction(index, emoji)}
                              className="text-lg hover:scale-110 transition-transform"
                            >
                              {emoji}
                            </button>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              {selectedImage && (
                <div
                  className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
                  onClick={() => setSelectedImage(null)}
                >
                  <div className="relative">
                    <img
                      src={selectedImage}
                      alt="Enlarged Upload"
                      className="max-w-full max-h-full rounded-lg"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button
                      className="absolute top-2 right-2 bg-white rounded-full w-8 h-8 flex items-center justify-center text-black font-bold text-lg hover:bg-gray-200"
                      onClick={() => setSelectedImage(null)}
                    >
                      X
                    </button>
                  </div>
                </div>
              )}
              {typing && (
                <motion.div className="flex items-center space-x-2 w-max max-w-xs bg-gray-200 text-black p-3 rounded-xl text-sm">
                  <img
                    src={Bot}
                    alt="Bot Typing"
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex space-x-1">
                    <div
                      className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"
                      style={{ animationDelay: "0s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="p-1 flex items-center rounded-lg mb-5 w-[350px] border border-gray-300 mx-auto">
              <button
                onClick={() => setShowPicker(!showPicker)}
                className="p-2 bg-gray-200 rounded-full hover:bg-gray-300"
              >
                😀
              </button>
              {showPicker && (
                <div className="absolute bottom-14">
                  <EmojiPicker onEmojiClick={handleEmojiClick} />
                </div>
              )}
              <label className="cursor-pointer">
                <Paperclip className="w-6 h-6 text-gray-500 hover:text-blue-500" />
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </label>
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

