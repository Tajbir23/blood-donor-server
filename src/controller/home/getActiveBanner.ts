import { Request, Response } from "express";
import sliderModel from "../../models/slider/sliderSchema";

const getActiveBanner = async(req: Request, res: Response) => {
    const slider = await sliderModel.find({isActive: true})
    res.status(201).json({slider})
}

export default getActiveBanner