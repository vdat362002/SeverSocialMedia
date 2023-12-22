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
                await User.updateOne({_id: id}, {$set: {active: true, last_active: new Date().toString(), id_temporary: socket.id}})
                if (user) {
                    socket.join(user._id.toString());
                    console.log('Client connected.');
                    console.log("Có người vừa kết nối", socket.id)
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

        socket.on("userOnline", async (data)=> {
            console.log("user online 123")
            await User.updateOne({_id: data.userId}, {$set: {active: true, last_active: new Date().toString(), id_temporary: socket.id}})
        })

        socket.on("updateStatus", async (data)=> {
            console.log(data)
            console.log("updateStatus")
        })

        socket.on("disconnect", async () => {
            // const user = await User.findOne({id_temporary: socket.id});
            await User.updateOne({id_temporary: socket.id}, {$set: {active: false, last_active: new Date().toString()}})
            io.emit('userStatus', { userId: socket.id, status: 'offline' });
            console.log('Client disconnected');
        });
    });
}
