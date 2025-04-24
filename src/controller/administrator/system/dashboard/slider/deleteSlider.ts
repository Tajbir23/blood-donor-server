import { Request, Response } from "express";
import sliderModel from "../../../../../models/slider/sliderSchema";

const deleteSlider = async(req: Request, res: Response) => {
    const {id} = req.query
    try {
        await sliderModel.findByIdAndDelete(id)
        res.status(200).json({ success: true, message: "Slider deleted successfully" })
        return
    } catch (error) {
        console.error("Error deleting slider:", error)
        res.status(500).json({ success: false, message: "Failed to delete slider" })
        return
    }
}

export default deleteSlider