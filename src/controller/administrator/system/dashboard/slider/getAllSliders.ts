import { Request, Response } from "express";
import sliderModel from "../../../../../models/slider/sliderSchema";

const getAllSliders = async (req: Request, res: Response) => {
    const { page, limit , search } = req.query;
    try {
        const query: any = {};
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (Number(page) - 1) * Number(limit);
        const sliders = await sliderModel.find(query).skip(skip).limit(Number(limit));
        const total = await sliderModel.countDocuments(query);

        res.status(200).json({
            success: true,
            message: "Sliders fetched successfully",
            sliders,
            total,
            currentPage: Number(page),
            totalPages: Math.ceil(total / Number(limit))
        })
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching sliders",
            error: error
        })
    }
}

export default getAllSliders;
