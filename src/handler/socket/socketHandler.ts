import { Server } from "socket.io";

const setUpSocketHandler = (io: Server) => {
    io.on('connection', (socket) => {
        
    })
}
export default setUpSocketHandler