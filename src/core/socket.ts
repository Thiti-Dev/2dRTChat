import { io } from "socket.io-client";

export function socketConnect(asWho: string){
    const socket = io('https://rtc-signaling-thoroughfare.onrender.com',{query:{
        iam: asWho
    }})

    return socket
}