import { Request, Response } from "express";
import sliderModel from "../../../../../models/slider/sliderSchema";

const createSlider = async (req: Request, res: Response) => {
    const data = JSON.parse(req.body.sliderData);
    const image = res.locals.imageUrl;
    const user = (req as any).user;
    try {
       const slider = await sliderModel.create({
        ...data,
        image: image,
        createdBy: user._id
       })

       res.status(201).json({
        success: true,
        message: "Slider created successfully",
        slider
       })
       
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Slider creation failed",
            error: error
        })
    }
}

export default createSlider;
