import { Schema } from "mongoose"

interface SliderTypes {
    createdBy: Schema.Types.ObjectId
    _id?: string
    image?: string
    imageFile?: File
    title?: string
    description?: string
    isRoute?: boolean
    route?: string
    buttonText?: string
    isActive?: boolean
}

export default SliderTypes