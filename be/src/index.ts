import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8080 });

interface User {
    socket: WebSocket;
    room: string;
}

let users: User[] = [];

wss.on("connection", (socket) => {
    socket.on("message", (data) => {
        try {
            const msg = JSON.parse(data.toString());

            if (msg.type === "join") {
                users.push({ socket, room: msg.payload.roomId });
                console.log(`User joined room: ${msg.payload.roomId}`);
            }

            if (msg.type === "chat") {
                const user = users.find((u) => u.socket === socket);
                if (!user) return;

                users.forEach((u) => {
                    if (u.room === user.room) {
                        u.socket.send(JSON.stringify({
                            sender: "User",
                            message: msg.payload.message,
                        }));
                    }
                });
            }
        } catch (error) {
            console.error("Invalid message format:", error);
        }
    });

    socket.on("close", () => {
        users = users.filter((u) => u.socket !== socket);
    });
});

console.log("WebSocket server running on ws://localhost:8080");