import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
    const [messages, setMessages] = useState<{ sender: string; message: string }[]>([]);
    const wsRef = useRef<WebSocket | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        const ws = new WebSocket("ws://localhost:8080");

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setMessages((prev) => [...prev, data]);
        };

        ws.onopen = () => {
            ws.send(JSON.stringify({ type: "join", payload: { roomId: "general" } }));
        };

        wsRef.current = ws;

        return () => ws.close();
    }, []);

    const sendMessage = () => {
        const message = inputRef.current?.value.trim();
        if (!message || !wsRef.current) return;

        wsRef.current.send(JSON.stringify({ type: "chat", payload: { message } }));
        inputRef.current.value = "";
    };

    return (
        <div className="h-screen flex flex-col bg-gray-900 text-white">
            <div className="p-4 text-center text-xl font-bold bg-gray-800">Modern Chat</div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === "User" ? "justify-end" : "justify-start"}`}>
                        <span className={`p-3 rounded-lg ${msg.sender === "User" ? "bg-blue-500" : "bg-gray-700"}`}>
                            {msg.message}
                        </span>
                    </div>
                ))}
            </div>
            <div className="flex p-4 bg-gray-800">
                <input ref={inputRef} className="flex-1 p-2 rounded bg-gray-700 text-white" placeholder="Type a message..." />
                <button onClick={sendMessage} className="ml-2 px-4 py-2 bg-blue-600 rounded">
                    Send
                </button>
            </div>
        </div>
    );
}

export default App;