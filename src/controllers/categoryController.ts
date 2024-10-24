import { PrismaClient } from '@prisma/client';
import express, { Request, Response } from 'express';
import { categorySchema } from '../zod';
import statusCode from '../statusCode';

const prisma = new PrismaClient();

export const createCategory = async (req:Request,res:Response)=>{
    const {success,error} = categorySchema.safeParse(req.body)
    
    if(!success){
        res.status(400).json({
            message:"Input Validation Failed",
            error: error.message})
    }
    try {
        const categoryExist = await prisma.category.findFirst({
            where:{
                categoryName:req.body.categoryName.toLowerCase(),
            }
        })

        if(categoryExist){
            res.status(400).json({
                message:"Category already exist",
            })
        }
        const newCategory = await prisma.category.create({
            data:{
                categoryName:req.body.categoryName.toLowerCase(),
            }
        })

        res.status(statusCode.OK).json({
            message:"Category created successfully",
            data:newCategory
        })
    } catch (error:any) {
        console.error(error)
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({
            message:"Internal Server Error",
            error: error.message || "Unknown error"
        })
    }
}

export const getAllCategories = async (req:Request,res:Response)=>{
    try {
        const categories = await prisma.category.findMany()
        res.status(statusCode.OK).json({
            message:"Categories fetched successfully",
            data:categories
        })
    } catch (error:any) {
        console.error(error)
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({
            message:"Internal Server Error",
            error: error.message || "Unknown error"
        })
    }
}
