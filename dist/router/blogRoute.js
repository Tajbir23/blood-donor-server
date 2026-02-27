"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verifyJwt_1 = __importDefault(require("../handler/validation/verifyJwt"));
const verifyOrganizationAdmin_1 = __importDefault(require("../handler/validation/verifyOrganizationAdmin"));
const blogImageUpload_1 = __importDefault(require("../handler/fileUpload/blogImageUpload"));
const createBlogPost_1 = __importDefault(require("../controller/organization/blog/createBlogPost"));
const getOrgBlogPosts_1 = __importDefault(require("../controller/organization/blog/getOrgBlogPosts"));
const getAllBlogPosts_1 = __importDefault(require("../controller/organization/blog/getAllBlogPosts"));
const getBlogPostById_1 = __importDefault(require("../controller/organization/blog/getBlogPostById"));
const deleteBlogPost_1 = __importDefault(require("../controller/organization/blog/deleteBlogPost"));
const addBlogComment_1 = __importDefault(require("../controller/organization/blog/addBlogComment"));
const blogRouter = (0, express_1.Router)();
const cacheMiddleware_1 = require("../handler/cache/cacheMiddleware");
// Public routes — 3 মিনিট cache
blogRouter.get('/posts', (0, cacheMiddleware_1.cacheMiddleware)(180), getAllBlogPosts_1.default);
blogRouter.get('/post/:blogId', (0, cacheMiddleware_1.cacheMiddleware)(180), getBlogPostById_1.default);
// Authenticated routes
blogRouter.post('/comment/:blogId', verifyJwt_1.default, addBlogComment_1.default);
// Org admin routes
blogRouter.post('/create/:organizationId', verifyJwt_1.default, verifyOrganizationAdmin_1.default, blogImageUpload_1.default, createBlogPost_1.default);
blogRouter.get('/org/:organizationId', verifyJwt_1.default, verifyOrganizationAdmin_1.default, getOrgBlogPosts_1.default);
blogRouter.delete('/delete/:blogId', verifyJwt_1.default, deleteBlogPost_1.default);
exports.default = blogRouter;
