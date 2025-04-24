import { Request, Response } from "express";
import sliderModel from "../../../../../models/slider/sliderSchema";

const toggleActive = async (req: Request, res: Response) => {
  const id = req.query.id as string;

  try {
    const slider = await sliderModel.findById(id);

    if (!slider) {
      res.status(404).json({ success: false, message: "Slider not found" });
      return
    }

    // Toggle the boolean value
    slider.isActive = !slider.isActive;

    // Save the updated document
    await slider.save();

    res.status(200).json({
      success: true,
      message: "Slider isActive toggled successfully",
      data: slider,
    });
    return
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
    return
  }
};

export default toggleActive;
