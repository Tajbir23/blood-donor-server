import bcrypt from "bcrypt"

// Verify password function
const verifyPass = async (password: string, hashedPassword: string) => {
  try {
    const match = await bcrypt.compare(password, hashedPassword);
    return match;
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
};

export default verifyPass;