import zod  from 'zod';

export const itemSchema = zod.object({
    itemName: zod.string(),
    itemCode: zod.number(),
    description: zod.string().optional(),
    price:  zod.number(),
    gstTax: zod.number(),
    quantity: zod.number(),
    quantityUnit: zod.string(),
    holdStock: zod.number().optional(),
    lowStockIndicator: zod.number(),
    asOfDate: zod.date()
})

export const updateItemSchema = zod.object({
    itemName: zod.string().optional(),
    itemCode: zod.number().optional(),
    description: zod.string().optional(),
    price:  zod.number().optional(),
    gstTax: zod.number().optional(),
    quantity: zod.number().optional(),
    quantityUnit: zod.string().optional(),
    holdStock: zod.number().optional().optional(),
    lowStockIndicator: zod.number().optional(),
    asOfDate: zod.date().optional()
})

export const signedUrlImageSchema = zod.object({
    imageName: zod.string(),
    contentType: zod.string()
})

export const storeImageMetadataSchema = zod.object({ 
    key : zod.string(),
})

export const categorySchema = zod.object({
    categoryName : zod.string(),
})