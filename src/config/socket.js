import config from '../config/config.js';
import { Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import User from '../schemas/UserSchema.js';
import express from "express";

export default function (app, server) {
    const io = new SocketIOServer(server, {
        cors: {
            origin: config.cors.origin || 'http://localhost:3000',
            methods: ["GET", "POST", "PATCH"],
            credentials: true
        }
    });

    app.set('io', io);

    io.on("connection", (socket) => {
        socket.on("userConnect", async (id) => {
            try {
                const user = await User.findById(id);
                if (user) {
                    socket.join(user._id.toString());
                    console.log('Client connected.');
                }
            } catch (error) {
                console.error('Invalid user ID, cannot join Socket.');
            }
        });

        socket.on("userDisconnect", (userID) => {
            socket.leave(userID);
            console.log('Client Disconnected.');
        });

        socket.on("onFollowUser", (data) => {
            console.log(data);
        });

        socket.on("user-typing", ({ user, state }) => {
            io.to(user.id).emit("typing", state);
        });

        socket.on("disconnect", () => {
            console.log('Client disconnected');
        });
    });
}
