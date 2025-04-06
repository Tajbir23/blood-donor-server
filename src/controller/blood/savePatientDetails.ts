import patientDetailsModel from "../../models/blood/patient_detailsSchema"
import userModel from "../../models/user/userSchema";

const savePatientDetails = async(name: string, email: string, phone: string, districtId: string, thanaId: string, bloodGroup: string, latitude: number, longitude: number) => {
    try {
        // Check if a patient with this email already exists
        const existingPatient = await patientDetailsModel.findOne({ email });
        const existingUser = await userModel.findOne({ email });
        // Only create and save if the email doesn't exist
        if (!existingPatient || !existingUser) {
            const patientDetails = await patientDetailsModel.create({
                name,
                email,
                phone,
                districtId,
                thanaId,
                bloodGroup,
                location: {
                    type: "Point",
                    coordinates: [longitude, latitude]
                }
            });
            await patientDetails.save();
        }
    } catch (error) {
        console.log(error)
    }
}

export default savePatientDetails