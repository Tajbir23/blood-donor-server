import { Router } from "express";
import verifyJwt from "../handler/validation/verifyJwt";
import verifyOrganizationAdmin from "../handler/validation/verifyOrganizationAdmin";
import blogImageUpload from "../handler/fileUpload/blogImageUpload";
import createBlogPost from "../controller/organization/blog/createBlogPost";
import getOrgBlogPosts from "../controller/organization/blog/getOrgBlogPosts";
import getAllBlogPosts from "../controller/organization/blog/getAllBlogPosts";
import getBlogPostById from "../controller/organization/blog/getBlogPostById";
import deleteBlogPost from "../controller/organization/blog/deleteBlogPost";
import addBlogComment from "../controller/organization/blog/addBlogComment";

const blogRouter = Router();

import { cacheMiddleware } from "../handler/cache/cacheMiddleware";

// Public routes — 3 মিনিট cache
blogRouter.get('/posts', cacheMiddleware(180), getAllBlogPosts);
blogRouter.get('/post/:blogId', cacheMiddleware(180), getBlogPostById);

// Authenticated routes
blogRouter.post('/comment/:blogId', verifyJwt, addBlogComment);

// Org admin routes
blogRouter.post('/create/:organizationId', verifyJwt, verifyOrganizationAdmin, blogImageUpload, createBlogPost);
blogRouter.get('/org/:organizationId', verifyJwt, verifyOrganizationAdmin, getOrgBlogPosts);
blogRouter.delete('/delete/:blogId', verifyJwt, deleteBlogPost);

export default blogRouter;
