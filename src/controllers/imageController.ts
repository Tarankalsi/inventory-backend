import { Category } from './../../node_modules/.prisma/client/index.d';
import express, { Request, Response } from 'express';
import statusCode from '../statusCode';
import { PrismaClient } from '@prisma/client';
import { signedUrlImageSchema, storeImageMetadataSchema } from '../zod';
import { uploadImageS3 } from '../services/s3';


const prisma = new PrismaClient();

export const createSignedUrl = async (req: Request, res: Response) => {
    const body = req.body

    const { success, error } = signedUrlImageSchema.safeParse(body)

    if (!success) {
        res.status(statusCode.BAD_REQUEST).json({
            message: "Input Validation Failed",
            error: error.errors || "Unknown error",
        })
    }

    try {
        const itemId = req.params.itemId

        const itemExist = await prisma.item.findUnique({
            where: {
                itemId: itemId,
            },
            include: {
                category: true,
            },
        });
        console.log("Item exists:", itemExist)
        if (!itemExist) {
            res.status(statusCode.NOT_FOUND).json({
                message: "Item Not Found",
            });
        }

        const date = new Date().getTime()
        const key = `itemImage/${itemExist?.category.categoryName}/${itemExist?.itemName}/${body.imageName}${date}.jpeg`

        const url = await uploadImageS3(key, body.contentType)

        res.status(statusCode.OK).json({
            message: "Presigned url created successfully",
            url: url,
            key: key
        })

    } catch (error) {
        console.error("Error uploading image:", error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Internal Server Error",
            error: error
        });
    }
}

export const storeImageMetadata = async (req:Request,res:Response)=>{
    const itemId = req.params.itemId
    const body = req.body;

    const {success} = storeImageMetadataSchema.safeParse(body)
    
    if (!success) {
        res.status(statusCode.BAD_REQUEST).json({
            message: "Input Validation Failed",
        })
    }
    try {
        const itemExist = await prisma.item.findUnique({
            where: {
                itemId: itemId,
            },
        })
        
        if (!itemExist) {
            res.status(statusCode.NOT_FOUND).json({
                message: "Item Not Found",
            });
        }

        const url = `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${body.key}`

        await prisma.itemImage.create({
            data: {
                itemId: itemId,
                url: url,
                key: body.key
            }
        })
        res.status(statusCode.OK).json({
            message: "File metadata stored successfully"
          })
      
    } catch (error) {
        console.error('Error storing image metadata:', error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: 'Internal Server Error',
        });
    }
}
