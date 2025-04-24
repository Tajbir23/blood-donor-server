import { model, Schema } from "mongoose";
import SliderTypes from "../../types/sliderTypes";

const sliderSchema = new Schema<SliderTypes>({
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    image: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    isRoute: {
        type: Boolean,
    },
    route: {
        type: String,
    },
    buttonText: {
        type: String,
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const sliderModel = model<SliderTypes>('slider', sliderSchema);

export default sliderModel;
