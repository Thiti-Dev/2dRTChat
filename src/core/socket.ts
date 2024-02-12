import { io } from "socket.io-client";

export function socketConnect(asWho: string){
    const socket = io(process.env.WEBSOCKET_HOST,{query:{
        iam: asWho
    }})

    return socket
}