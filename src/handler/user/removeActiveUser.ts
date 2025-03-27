import { activeUsers } from "../../server";

const removeActiveUser = (id: string) => {
    const index = activeUsers.indexOf(id);
    if (index > -1) {
        activeUsers.splice(index, 1); // ইউজার আইডি মুছে ফেলা
    }
}
export default removeActiveUser