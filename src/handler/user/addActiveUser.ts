import { activeUsers } from "../../server"

const addActiveUser = (id:string) => {
    if(activeUsers.includes(id)){
        const index = activeUsers.indexOf(id)
        if (index > -1) {
            activeUsers.splice(index, 1)
        }
    }
    activeUsers.push(id)
}

export default addActiveUser