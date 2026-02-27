import { Router } from "express";
import getDashboardData from "../../../controller/administrator/system/dashboard/getDashboardData";
import verifyJwt from "../../../handler/validation/verifyJwt";
import verifyIsAdmin from "../../../handler/validation/verifyIsAdmin";
import getAllUsers from "../../../controller/administrator/system/dashboard/getAllUsers";
import roleChangeUser from "../../../controller/administrator/system/dashboard/roleChangeUser";
import getAllAdmins from "../../../controller/administrator/system/dashboard/getAllAdmins";
import manageUser from "../../../controller/administrator/system/dashboard/manageUser";
import getAllModerators from "../../../controller/administrator/system/dashboard/getAllModerators";
import { createImageUpload } from "../../../handler/fileUpload/imageUpload";
import createSlider from "../../../controller/administrator/system/dashboard/slider/createSlider";
import getAllSliders from "../../../controller/administrator/system/dashboard/slider/getAllSliders";
import deleteSlider from "../../../controller/administrator/system/dashboard/slider/deleteSlider";
import toggleActive from "../../../controller/administrator/system/dashboard/slider/toggleActive";
import getFacebookMessages from "../../../controller/administrator/system/dashboard/getFacebookMessages";
import getTelegramMessages from "../../../controller/administrator/system/dashboard/getTelegramMessages";
import addAiTrainingData from "../../../controller/administrator/system/dashboard/ai/addAiTrainingData";
import getAiTrainingData from "../../../controller/administrator/system/dashboard/ai/getAiTrainingData";
import deleteAiTrainingData from "../../../controller/administrator/system/dashboard/ai/deleteAiTrainingData";
import verifyIsSuperAdmin from "../../../handler/validation/verifyIsSuperAdmin";
import getTgBroadcastCount from "../../../controller/administrator/system/dashboard/getTgBroadcastCount";
import sendTgBroadcast from "../../../controller/administrator/system/dashboard/sendTgBroadcast";
import getTgBroadcastLocations from "../../../controller/administrator/system/dashboard/getTgBroadcastLocations";
import addBotRule    from "../../../controller/administrator/system/dashboard/botRules/addBotRule";
import getBotRules   from "../../../controller/administrator/system/dashboard/botRules/getBotRules";
import deleteBotRule from "../../../controller/administrator/system/dashboard/botRules/deleteBotRule";
import updateBotRule from "../../../controller/administrator/system/dashboard/botRules/updateBotRule";
import getAllDonations from "../../../controller/administrator/system/dashboard/getAllDonations";

const systemDashboardRoute = Router();


const sliderUpload = createImageUpload('sliderImage', {
    maxWidth: 1000,
    maxHeight: 1000,
    quality: 85,
    format: 'webp'
})

systemDashboardRoute.get('/dashboard', verifyJwt, verifyIsAdmin,  getDashboardData);
systemDashboardRoute.get('/users', verifyJwt, verifyIsAdmin, getAllUsers);
systemDashboardRoute.post('/role-change-user', verifyJwt, verifyIsAdmin, roleChangeUser);
systemDashboardRoute.get('/admins', verifyJwt, verifyIsAdmin, getAllAdmins);
systemDashboardRoute.post('/manage-user', verifyJwt, verifyIsAdmin, manageUser);
systemDashboardRoute.get('/moderators', verifyJwt, verifyIsAdmin, getAllModerators);
systemDashboardRoute.post('/create-slider', verifyJwt, verifyIsAdmin, sliderUpload, createSlider);
systemDashboardRoute.get('/get-all-sliders', verifyJwt, verifyIsAdmin, getAllSliders);
systemDashboardRoute.delete('/delete-slider', verifyJwt, verifyIsAdmin, deleteSlider)
systemDashboardRoute.put('/slider-active-toggle', verifyJwt, verifyIsAdmin, toggleActive)
systemDashboardRoute.get('/facebook-messages', verifyJwt, verifyIsSuperAdmin, getFacebookMessages)
systemDashboardRoute.get('/telegram-messages', verifyJwt, verifyIsSuperAdmin, getTelegramMessages)

// AI Training routes (superAdmin only)
systemDashboardRoute.get('/ai-training',          verifyJwt, verifyIsSuperAdmin, getAiTrainingData)
systemDashboardRoute.post('/ai-training',         verifyJwt, verifyIsSuperAdmin, addAiTrainingData)
systemDashboardRoute.delete('/ai-training/:id',   verifyJwt, verifyIsSuperAdmin, deleteAiTrainingData)

// Telegram Broadcast routes (superAdmin only)
systemDashboardRoute.get('/tg-broadcast/locations', verifyJwt, verifyIsSuperAdmin, getTgBroadcastLocations)
systemDashboardRoute.get('/tg-broadcast/count',     verifyJwt, verifyIsSuperAdmin, getTgBroadcastCount)
systemDashboardRoute.post('/tg-broadcast',          verifyJwt, verifyIsSuperAdmin, sendTgBroadcast)

// Custom Bot Rule routes (superAdmin only)
systemDashboardRoute.get('/bot-rules',         verifyJwt, verifyIsSuperAdmin, getBotRules)
systemDashboardRoute.post('/bot-rules',        verifyJwt, verifyIsSuperAdmin, addBotRule)
systemDashboardRoute.put('/bot-rules/:id',     verifyJwt, verifyIsSuperAdmin, updateBotRule)
systemDashboardRoute.delete('/bot-rules/:id',  verifyJwt, verifyIsSuperAdmin, deleteBotRule)

// Donation History routes (admin)
systemDashboardRoute.get('/donations', verifyJwt, verifyIsAdmin, getAllDonations)

export default systemDashboardRoute;
