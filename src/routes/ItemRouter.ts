// ItemRouter.ts
import express, { Application, Request, Response, Router } from 'express';
import { itemSchema } from '../zod';
import statusCode from '../statusCode';
import { createItem, deleteItem, filterItemsByCategory, filterLowStockItems, getItems, updateItem } from '../controllers/itemController';
import { createSignedUrl, storeImageMetadata } from '../controllers/imageController';

const ItemRouter = express.Router();

ItemRouter.get('/fetch', getItems );
ItemRouter.get('/filter/category', filterItemsByCategory );
ItemRouter.get('/filter/low-stock', filterLowStockItems );
ItemRouter.post('/create/:categoryId', createItem);
ItemRouter.post('/update/:itemId', updateItem)
ItemRouter.post('/upload/image/presigned/:itemId', createSignedUrl);
ItemRouter.post('/upload/image/:itemId', storeImageMetadata);
ItemRouter.delete('/delete/:itemId', deleteItem);



export default ItemRouter;
