import bcrypt from "bcrypt"

// Verify password function
const verifyPass = async (password: string, hashedPassword: string) => {
  try {
    // Compare the password with the hashed password
    const match = await bcrypt.compare(password, hashedPassword);
    
    if (match) {
      console.log('Password is correct');
      return true;
    } else {
      console.log('Password is incorrect');
      return false
      
    }
  } catch (error) {
    console.error('Error verifying password:', error);
  }
};

export default verifyPass;