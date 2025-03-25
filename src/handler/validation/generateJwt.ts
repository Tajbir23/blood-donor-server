import jwt from 'jsonwebtoken'
const generateJwt = (phone: string, _id: string, role: string) => {
    const payload = {
        phone,
        _id,
        role
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '1h' })
    
    return token
}

export default generateJwt;