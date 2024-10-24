// ItemRouter.ts
import express, { Application, Request, Response, Router } from 'express';
import { itemSchema } from '../zod';
import statusCode from '../statusCode';
import { createItem } from '../controllers/itemController';
import { createSignedUrl } from '../controllers/imageController';
import { createCategory, getAllCategories } from '../controllers/categoryController';

const CategoryRouter = express.Router();
CategoryRouter.post('/',(req,res)=>{
    res.send("Hello world")
})
CategoryRouter.post('/create', createCategory);
CategoryRouter.get('/fetch',getAllCategories)




export default CategoryRouter;
