import axios from "axios";
import { userAdressMap, getDivision, getDistrict, getThana } from "./address";
import quickReply from "./quickReply";
import FbUserModel from "../../models/user/fbUserSchema";
import sendMessageToFbUser, { sendMultipleUrlButtonToFbUser } from "./sendMessageToFbUser";

interface FacebookUserProfile {
    first_name: string;
    last_name: string;
    id: string;
}

interface UserData {
    divisionId?: string;
    districtId?: string;
    thanaId?: string;
    latitude?: string;
    longitude?: string;
    bloodGroup?: string;
    fullName?: string;
    flowType?: 'register' | 'findBlood';
}

const getUserProfile = async (psId: string) => {
    try {
        const response = await axios.get<FacebookUserProfile>(
            `https://graph.facebook.com/${psId}?fields=first_name,last_name&access_token=${process.env.PAGE_ACCESS_TOKEN}`
        );
        
        return {
            firstName: response.data.first_name,
            lastName: response.data.last_name,
            fullName: `${response.data.first_name} ${response.data.last_name}`
        };
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return {
            firstName: "",
            lastName: "",
            fullName: ""
        };
    }
};

const registerFbUser = async (psId: string, received_text: string, received_postback: string, quickReplyType?: string) => {
    try {
        console.log("Register FB User:", { psId, received_text, received_postback, quickReplyType });
        const fbUser = await FbUserModel.findOne({ psId });

        if(fbUser){
            await sendMessageToFbUser(psId, 'ইতোমধ্যে আপনার ফেসবুক অ্যাকাউন্টে রেজিস্ট্রেশন সম্পন্ন হয়েছে। আমাদের ওয়েবসাইটে লগইন করুন অথবা রেজিস্ট্রেশন করুন।')
            await sendMultipleUrlButtonToFbUser(psId, 'আমাদের ওয়েবসাইটে লগইন করুণ অথবা রেজিস্টার করুন', [{
                title: "ওয়েবসাইটে লগইন করুন",
                url: `${process.env.FRONTEND_URL}/login`
            },{
                title: "ওয়েবসাইটে রেজিস্ট্রেশন করুন",
                url: `${process.env.FRONTEND_URL}/register`
            }])
            return
        }
        // Initialize or get existing user data
        const userData = userAdressMap.get(psId) || {
            divisionId: "",
            districtId: "",
            thanaId: "",
            latitude: "",
            longitude: "",
            flowType: "register" // Mark that we're in the registration flow
        } as UserData;
        
        // Always set flowType to register when in this function
        userData.flowType = "register";
        
        // Initial registration step from menu
        if (received_postback === "REGISTER" || received_text === "Register") {
            // Get user profile from Facebook
            const profile = await getUserProfile(psId);
            
            // Update the map with user's name from FB profile
            userAdressMap.set(psId, {
                ...userData,
                fullName: profile.fullName,
                flowType: "register"
            });
            
            // Send welcome message
            await quickReply(
                psId,
                `ধন্যবাদ ${profile.firstName}! রেজিস্ট্রেশন শুরু করুন। আপনার রক্তের গ্রুপ নির্বাচন করুন:`,
                ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
                "bloodGroup"
            );
            return;
        }
        
        // Handle blood group selection
        if (quickReplyType === "bloodGroup") {
            userAdressMap.set(psId, {
                ...userData,
                bloodGroup: received_text,
                flowType: "register"
            });
            
            // Get divisions from geo data
            const divisions = await getDivision();
            
            // Ask for location (division)
            await quickReply(
                psId,
                "আপনার বিভাগ নির্বাচন করুন:",
                divisions.map(div => div.id),
                "division"
            );
            return;
        }
        
        // Handle division selection
        if (quickReplyType === "division") {
            userAdressMap.set(psId, {
                ...userData,
                divisionId: received_text,
                flowType: "register"
            });
            
            // Get districts from selected division
            const districts = await getDistrict(received_text);
            
            // Ask for district selection
            await quickReply(
                psId,
                "আপনার জেলা নির্বাচন করুন:",
                districts.map(district => district.id),
                "district"
            );
            return;
        }
        
        // Handle district selection
        if (quickReplyType === "district") {
            userAdressMap.set(psId, {
                ...userData,
                districtId: received_text,
                flowType: "register"
            });
            
            // Get thanas from selected district
            const thanas = await getThana(received_text, userData.divisionId);
            
            // Ask for thana selection
            await quickReply(
                psId,
                "আপনার উপজেলা/থানা নির্বাচন করুন:",
                thanas.map(thana => thana.id),
                "thana"
            );
            return;
        }
        
        // Handle thana selection
        if (quickReplyType === "thana") {
            // Get thana details to set latitude and longitude
            const thanas = await getThana(userData.districtId, userData.divisionId);
            const selectedThana = thanas.find(thana => thana.id === received_text);
            
            userAdressMap.set(psId, {
                ...userData,
                thanaId: received_text,
                latitude: selectedThana?.latitude || "",
                longitude: selectedThana?.longitude || "",
                flowType: "register"
            });
            
            // Show confirmation with all collected data
            const updatedUserData = userAdressMap.get(psId);
            
            await sendMessageToFbUser(psId, `রেজিস্ট্রেশন সম্পন্ন! আপনার তথ্য:\nনাম: ${updatedUserData?.fullName}\nরক্তের গ্রুপ: ${updatedUserData?.bloodGroup}\nবিভাগ: ${updatedUserData?.divisionId}\nজেলা: ${updatedUserData?.districtId}\nথানা: ${updatedUserData?.thanaId}`)
            await quickReply(
                psId,
                `রেজিস্ট্রেশন সম্পন্ন! আপনার তথ্য:\nনাম: ${updatedUserData?.fullName}\nরক্তের গ্রুপ: ${updatedUserData?.bloodGroup}\nবিভাগ: ${updatedUserData?.divisionId}\nজেলা: ${updatedUserData?.districtId}\nথানা: ${updatedUserData?.thanaId}`,
                ["ঠিক আছে", "তথ্য পরিবর্তন করুন"],
                "registerComplete"
            );
            return;
        }
        
        // Handle registration completion response
        if (quickReplyType === "registerComplete") {
            if (received_text === "ঠিক আছে") {
                await quickReply(
                    psId,
                    "ধন্যবাদ! আপনি সফলভাবে রেজিস্ট্রেশন করেছেন। যখনই কেউ রক্তের প্রয়োজনে আপনার কাছে আসবে, আমরা আপনাকে জানাব।",
                    ["ঠিক আছে"],
                    "confirmDone"
                );
                
                // Registration is complete, clear the flow type
                const updatedUserData = userAdressMap.get(psId);
                if (updatedUserData) {
                    userAdressMap.set(psId, {
                        ...updatedUserData,
                        flowType: undefined
                    });
                }
                // if not found then create new fb user
                const fbUser = await FbUserModel.findOne({ psId });
                
                
                if (!fbUser) {
                    const latitude = updatedUserData?.latitude ? parseFloat(updatedUserData?.latitude) : 0;
                    const longitude = updatedUserData?.longitude ? parseFloat(updatedUserData?.longitude) : 0;
                    const newFbUser = await FbUserModel.create({
                        psId,
                        fullName: updatedUserData?.fullName,
                        bloodGroup: updatedUserData?.bloodGroup,
                        divisionId: updatedUserData?.divisionId,
                        districtId: updatedUserData?.districtId,
                        thanaId: updatedUserData?.thanaId,
                        latitude,
                        longitude,
                        location: {
                            type: "Point",
                            coordinates: [longitude, latitude]
                        }
                    });
                    await newFbUser.save();
                    
                    await userAdressMap.delete(psId);

                    await sendMultipleUrlButtonToFbUser(psId, 'আমাদের ওয়েবসাইটে লগইন করুণ অথবা রেজিস্টার করুন', [{
                        title: "ওয়েবসাইটে লগইন করুন",
                        url: `${process.env.FRONTEND_URL}/login`
                    },{
                        title: "ওয়েবসাইটে রেজিস্ট্রেশন করুন",
                        url: `${process.env.FRONTEND_URL}/register`
                    }])
        
                }
            } else if (received_text === "তথ্য পরিবর্তন করুন") {
                // Start registration process again
                await quickReply(
                    psId,
                    "আপনার রক্তের গ্রুপ নির্বাচন করুন:",
                    ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
                    "bloodGroup"
                );
            }
            return;
        }
        
    } catch (error) {
        console.error("Error in registerFbUser:", error);
    }
};

export default registerFbUser;
