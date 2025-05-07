import { getDistrict, getDivision, getThana, userAdressMap } from "./address";
import quickReply from "./quickReply";

const addressHandler = async(psId : string, title: string, addressId?: string, addressType?: 'division' | 'district' | 'thana') => {
    const userData = await userAdressMap.get(psId);

    // If starting fresh or showing divisions
    if(!addressId || addressType === "division"){
        const divisions = await getDivision();
        await quickReply(psId, "Select division", divisions.map(div => div.id));
        return;
    }

    // Handle division selection
    if(!userData || !userData.divisionId) {
        const divisions = await getDivision();
        const division = divisions.find(div => div.id === addressId);
        
        if(division) {
            // Save division selection
            userAdressMap.set(psId, {
                divisionId: division.id,
                districtId: "",
                thanaId: ""
            });
            
            // Show districts for selected division
            const districts = await getDistrict(division.id);
            if(districts && districts.length > 0) {
                await quickReply(psId, "Select district", districts.map(district => district.id));
            } else {
                await quickReply(psId, "No districts found for this division", divisions.map(div => div.id));
            }
        } else {
            // Invalid division selection
            await quickReply(psId, "Invalid division. Please select again", divisions.map(div => div.id));
        }
        return;
    }

    // Handle district selection
    if(userData && userData.divisionId && (!userData.districtId || addressType === "district")) {
        const districts = await getDistrict(userData.divisionId);
        const district = districts.find(district => district.id === addressId);
        
        if(district) {
            // Save district selection
            userAdressMap.set(psId, {
                divisionId: userData.divisionId,
                districtId: district.id,
                thanaId: ""
            });
            
            // Show thanas for selected district
            const thanas = await getThana(district.id, userData.divisionId);
            if(thanas && thanas.length > 0) {
                await quickReply(psId, "Select area", thanas.map(thana => thana.id));
            } else {
                await quickReply(psId, "No areas found for this district", districts.map(district => district.id));
            }
        } else {
            // Invalid district selection
            await quickReply(psId, "Invalid district. Please select again", districts.map(district => district.id));
        }
        return;
    }

    // Handle thana selection
    if(userData && userData.divisionId && userData.districtId && (addressType === "thana" || !addressType)) {
        const thanas = await getThana(userData.districtId, userData.divisionId);
        const thana = thanas.find(thana => thana.id === addressId);
        
        if(thana) {
            // Save thana selection
            userAdressMap.set(psId, {
                divisionId: userData.divisionId,
                districtId: userData.districtId,
                thanaId: thana.id
            });
            
            // Thana selected, proceed with the next step
            await quickReply(psId, "Location selected successfully! What would you like to do next?", ["Search Donors", "Cancel"]);
        } else {
            // Invalid thana selection
            await quickReply(psId, "Invalid area. Please select again", thanas.map(thana => thana.id));
        }
        return;
    }
}
    
export default addressHandler;