import express from 'express';
import ItemRouter from './ItemRouter';
import CategoryRouter from './categoryRouter';

const MainRouter = express.Router();

MainRouter.use('/item', ItemRouter)
MainRouter.use('/category', CategoryRouter)

export default MainRouter;
