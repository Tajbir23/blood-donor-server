import patientDetailsModel from "../../models/blood/patient_detailsSchema"

const findDonorFromSeeker = async(latitude: number, longitude: number) => {
    const donors = await patientDetailsModel.find({
        location: {
            $near: { $geometry: { type: "Point", coordinates: [longitude, latitude] }, $maxDistance: 100000 }
        }
    })
    return donors
}

export default findDonorFromSeeker