"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const getDashboardData_1 = __importDefault(require("../../../controller/administrator/system/dashboard/getDashboardData"));
const verifyJwt_1 = __importDefault(require("../../../handler/validation/verifyJwt"));
const verifyIsAdmin_1 = __importDefault(require("../../../handler/validation/verifyIsAdmin"));
const getAllUsers_1 = __importDefault(require("../../../controller/administrator/system/dashboard/getAllUsers"));
const roleChangeUser_1 = __importDefault(require("../../../controller/administrator/system/dashboard/roleChangeUser"));
const getAllAdmins_1 = __importDefault(require("../../../controller/administrator/system/dashboard/getAllAdmins"));
const manageUser_1 = __importDefault(require("../../../controller/administrator/system/dashboard/manageUser"));
const getAllModerators_1 = __importDefault(require("../../../controller/administrator/system/dashboard/getAllModerators"));
const imageUpload_1 = require("../../../handler/fileUpload/imageUpload");
const createSlider_1 = __importDefault(require("../../../controller/administrator/system/dashboard/slider/createSlider"));
const getAllSliders_1 = __importDefault(require("../../../controller/administrator/system/dashboard/slider/getAllSliders"));
const deleteSlider_1 = __importDefault(require("../../../controller/administrator/system/dashboard/slider/deleteSlider"));
const toggleActive_1 = __importDefault(require("../../../controller/administrator/system/dashboard/slider/toggleActive"));
const getFacebookMessages_1 = __importDefault(require("../../../controller/administrator/system/dashboard/getFacebookMessages"));
const getTelegramMessages_1 = __importDefault(require("../../../controller/administrator/system/dashboard/getTelegramMessages"));
const verifyIsSuperAdmin_1 = __importDefault(require("../../../handler/validation/verifyIsSuperAdmin"));
const systemDashboardRoute = (0, express_1.Router)();
const sliderUpload = (0, imageUpload_1.createImageUpload)('sliderImage', {
    maxWidth: 1000,
    maxHeight: 1000,
    quality: 85,
    format: 'webp'
});
systemDashboardRoute.get('/dashboard', verifyJwt_1.default, verifyIsAdmin_1.default, getDashboardData_1.default);
systemDashboardRoute.get('/users', verifyJwt_1.default, verifyIsAdmin_1.default, getAllUsers_1.default);
systemDashboardRoute.post('/role-change-user', verifyJwt_1.default, verifyIsAdmin_1.default, roleChangeUser_1.default);
systemDashboardRoute.get('/admins', verifyJwt_1.default, verifyIsAdmin_1.default, getAllAdmins_1.default);
systemDashboardRoute.post('/manage-user', verifyJwt_1.default, verifyIsAdmin_1.default, manageUser_1.default);
systemDashboardRoute.get('/moderators', verifyJwt_1.default, verifyIsAdmin_1.default, getAllModerators_1.default);
systemDashboardRoute.post('/create-slider', verifyJwt_1.default, verifyIsAdmin_1.default, sliderUpload, createSlider_1.default);
systemDashboardRoute.get('/get-all-sliders', verifyJwt_1.default, verifyIsAdmin_1.default, getAllSliders_1.default);
systemDashboardRoute.delete('/delete-slider', verifyJwt_1.default, verifyIsAdmin_1.default, deleteSlider_1.default);
systemDashboardRoute.put('/slider-active-toggle', verifyJwt_1.default, verifyIsAdmin_1.default, toggleActive_1.default);
systemDashboardRoute.get('/facebook-messages', verifyJwt_1.default, verifyIsSuperAdmin_1.default, getFacebookMessages_1.default);
systemDashboardRoute.get('/telegram-messages', verifyJwt_1.default, verifyIsSuperAdmin_1.default, getTelegramMessages_1.default);
exports.default = systemDashboardRoute;
