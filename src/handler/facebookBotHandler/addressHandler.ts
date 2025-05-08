import { getDistrict, getDivision, getThana, userAdressMap } from "./address";
import quickReply from "./quickReply";

const addressHandler = async(psId : string, title: string, received_text?: string, quickReplyType?: string) => {
    const userData = await userAdressMap.get(psId);

    // If starting fresh or showing divisions
    if(!received_text || quickReplyType === "division"){
        const divisions = await getDivision();
        await quickReply(psId, "Select division", divisions.map(div => div.id));
        return;
    }

    // Handle division selection
    if(!userData || !userData.divisionId) {
        const divisions = await getDivision();
        const division = divisions.find(div => div.id === received_text);
        
        if(division) {
            // Save division selection
            userAdressMap.set(psId, {
                divisionId: division.id,
                districtId: "",
                thanaId: "",
                latitude: "",
                longitude: ""
            });
            
            // Show districts for selected division
            const districts = await getDistrict(division.id);
            if(districts && districts.length > 0) {
                await quickReply(psId, "Select district", districts.map(district => district.id), "district");
            } else {
                await quickReply(psId, "No districts found for this division", divisions.map(div => div.id), "division");
            }
        } else {
            // Invalid division selection
            await quickReply(psId, "Invalid division. Please select again", divisions.map(div => div.id), "division");
        }
        return;
    }

    // Handle district selection
    if(userData && userData.divisionId && (!userData.districtId || quickReplyType === "district")) {
        const districts = await getDistrict(userData.divisionId);
        const district = districts.find(district => district.id === received_text);
        
        if(district) {
            // Save district selection
            userAdressMap.set(psId, {
                divisionId: userData.divisionId,
                districtId: district.id,
                thanaId: "",
                latitude: "",
                longitude: ""
            });
            
            // Show thanas for selected district
            const thanas = await getThana(district.id, userData.divisionId);
            if(thanas && thanas.length > 0) {
                await quickReply(psId, "Select area", thanas.map(thana => thana.id), "thana");
            } else {
                await quickReply(psId, "No areas found for this district", districts.map(district => district.id), "district");
            }
        } else {
            // Invalid district selection
            await quickReply(psId, "Invalid district. Please select again", districts.map(district => district.id), "district");
        }
        return;
    }

    // Handle thana selection
    if(userData && userData.divisionId && userData.districtId && (quickReplyType === "thana" || !quickReplyType)) {
        const thanas = await getThana(userData.districtId, userData.divisionId);
        const thana = thanas.find(thana => thana.id === received_text);
        
        if(thana) {
            // Save thana selection
            userAdressMap.set(psId, {
                divisionId: userData.divisionId,
                districtId: userData.districtId,
                thanaId: thana.id,
                latitude: thana.latitude,
                longitude: thana.longitude
            });
            
            // Thana selected, proceed with the next step
            // await quickReply(psId, "Select blood group", ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], "bloodGroup");
            // await quickReply(psId, "Location selected successfully! What would you like to do next?", ["Search Donors", "Cancel"]);
        } else {
            // Invalid thana selection
            await quickReply(psId, "Invalid area. Please select again", thanas.map(thana => thana.id), "thana");
        }
        return;
    }
}
    
export default addressHandler;