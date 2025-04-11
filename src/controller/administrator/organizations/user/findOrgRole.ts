import { Types } from "mongoose";
import organizationModel from "../../../../models/organization/organizationSchema";

const findOrgRole = async (userId: string) => {

    console.log("userId", userId)
    const organizations = await organizationModel.find({
        $or: [
            { owner: new Types.ObjectId(userId) },
            { admins: new Types.ObjectId(userId) },
            { moderators: new Types.ObjectId(userId) },
            { superAdmins: new Types.ObjectId(userId) }
        ],
        isActive: true,
        isBanned: false
    });

    console.log("organizations", organizations) 

    if(organizations.length === 0) {
        return {isAdmin: false};
    }

    const data = await organizations.map(org => {
        let role: "owner" | "admin" | "superAdmin" | "moderator" | null = null;

        if(org.owner.toString() === userId){
            role = "owner";
        }else if(org.admins.map(id => id.toString()).includes(userId)){
            role = "admin";
        }else if(org.superAdmins.map(id => id.toString()).includes(userId)){
            role = "superAdmin";
        }else if(org.moderators.map(id => id.toString()).includes(userId)){
            role = "moderator";
        }

        return {organizationId: org._id, role}
    })

    console.log("result", data)
    return {data, isAdmin: true};
}

export default findOrgRole;
