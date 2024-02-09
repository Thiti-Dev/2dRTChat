import { io } from "socket.io-client";

export function socketConnect(asWho: string){
    const socket = io('http://localhost:3000',{query:{
        iam: asWho
    }})

    return socket
}