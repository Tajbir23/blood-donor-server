import { Server } from "socket.io";
import setupLiveChatSocket from "./liveChatSocket";

const setUpSocketHandler = (io: Server) => {
    io.on('connection', (socket) => {
        
    })

    // Live Chat namespace
    setupLiveChatSocket(io);
}
export default setUpSocketHandler