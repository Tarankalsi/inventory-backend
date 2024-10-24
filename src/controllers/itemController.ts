import express, { Request, Response } from 'express';
import statusCode from '../statusCode';
import { itemSchema, updateItemSchema } from '../zod';
import { PrismaClient } from '@prisma/client';
import { stat } from 'fs';
import { deleteObjectS3 } from '../services/s3';

const prisma = new PrismaClient();

export const createItem = async (req: Request, res: Response) => {
    const { asOfDate, ...body } = req.body; 
    const formattedDate = new Date(asOfDate);

    try {
        const result = itemSchema.safeParse({ ...body, asOfDate: formattedDate });

        if (!result.success) {
            res.status(statusCode.BAD_REQUEST).json({
                message: "Input Validation Error",
                error: result.error.errors || "Unknown error",
            });
            return;
        }

        const categoryId = req.params.categoryId;

        // Check if category exists
        const category = await prisma.category.findUnique({
            where: { categoryId },
        });

        if (!category) {
            res.status(statusCode.BAD_REQUEST).json({ message: "Category not found" });
            return;
        }

        // Create the item and connect it with the existing category
        const item = await prisma.item.create({
            data: {
                ...body,
                asOfDate: formattedDate,
                category: {
                    connect: { categoryId }, // Use connect here
                },
            },
        });

        res.status(statusCode.OK).json({
            message: "Item created successfully",
            item,
        });
    } catch (error: any) {
        console.error("Error during processing: ", error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({
            message: "Internal Server Error",
            error: error.message || "Unknown error",
        });
    }
};

export const updateItem = async (req: Request, res: Response) => {
    const itemId = req.params.itemId
    const body = req.body;

    const { success, error } = updateItemSchema.safeParse(body);

    if (!success) {
        res.status(statusCode.BAD_REQUEST).json({
            message: "Input Validation Failed",
            error: error.errors || "Unknown error"
        })
        return;
    }

    try {
        const itemExist = await prisma.item.findUnique({
            where: {
                itemId: itemId
            }
        })

        if (!itemExist) {
            res.status(statusCode.NOT_FOUND).json({
                message: "Item not found"
            })
            return;
        }







        const updatedItem = await prisma.item.update({
            where: {
                itemId: itemId
            },
            data: body,
            include: {
                category: true,
                images: true
            }
        })
        // Optionally return the updated item
        res.status(statusCode.OK).json({
            message: "Item updated successfully",
            item: updatedItem
        });


    } catch (error) {
        console.error("Error updating item:", error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({
            message: "Internal Server Error",
        });
    }
}

export const getItems = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    const offset = (page - 1) * limit

    try {
        const items = await prisma.item.findMany({
            skip: offset,
            take: limit,
            include: {
                category: true,
                images: true
            }
        })

        const totalCount = await prisma.item.count()

        res.status(statusCode.OK).json({
            message: "Items fetched successfully",
            totalCount: totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            items: items

        });
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({
            message: 'Internal Server Error'
        });

    }
}

export const filterItemsByCategory = async (req: Request, res: Response) => {
    const category = Array.isArray(req.query.category) ? req.query.category[0] : req.query.category;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;

    if (!category || typeof category !== 'string') {
        res.status(statusCode.BAD_REQUEST).json({
            message: 'Invalid category parameter'
        })
        return;
    }

    try {

        const items = await prisma.item.findMany({
            where: {
                category: {
                    categoryName: category, // Assuming categoryName is being passed
                },
            },
            skip: (page - 1) * limit, // Calculate the offset
            take: limit, // Limit the number of items returned
        });

        const totalCount = await prisma.item.count({
            where: {
                category: {
                    categoryName: category,
                },
            },
        });

        res.status(200).json({
            items,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
        });
        return;
    } catch (error) {
        console.error('Error fetching items by category:', error);
        res.status(500).json({
            message: 'Internal Server Error',
        });
        return;
    }
}

export const filterLowStockItems = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 5;

    try {
        // Step 1: Get the total count of low stock items
        const totalCountResult: any = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "Item" WHERE "quantity" <= "lowStockIndicator";`;

        // Extract the count value, assuming totalCountResult has the expected structure
        const totalCount = parseInt(totalCountResult[0].count as string); // Type assertion to string

        // Step 2: Fetch low stock items with pagination
        const lowStockItems = await prisma.$queryRaw`
        SELECT 
            "Item".*, 
            "Category"."categoryName", 
            json_agg("itemImage".*) as images
        FROM "Item"
        LEFT JOIN "Category" ON "Item"."categoryId" = "Category"."categoryId"
        LEFT JOIN "itemImage" ON "Item"."itemId" = "itemImage"."itemId"
        WHERE "Item"."quantity" <= "Item"."lowStockIndicator"
        GROUP BY "Item"."itemId", "Category"."categoryName"
        ORDER BY "Item"."createdAt" DESC
        LIMIT ${limit} OFFSET ${(page - 1) * limit};
    `;
        res.status(statusCode.OK).json({
            items: lowStockItems,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
        });
        return;
    } catch (error) {
        console.error('Error fetching low stock items:', error);
        res.status(500).json({
            message: 'Internal Server Error',
        });
        return;
    }
}

export const deleteItem = async (req:Request,res:Response) => {
    const itemId = req.params.itemId;

    try {
        const itemExist = await prisma.item.findUnique({
            where: {
                itemId: itemId
            },
            include: {
                images: true
            }
        })
        if (!itemExist) {
            res.status(statusCode.NOT_FOUND).json({
                message: "Item not found"
            })
            return;
        }

        itemExist.images.map( async (item)=>{
            await deleteObjectS3(item.key)
        })

        await prisma.item.delete({
            where: {
                itemId: itemId
            }
        })
        res.status(statusCode.OK).json({
            message: "Item deleted successfully"
        });
    } catch (error) {
         console.error('Error fetching low stock items:', error);
        res.status(500).json({
            message: 'Internal Server Error',
        });
        return;
    }
}