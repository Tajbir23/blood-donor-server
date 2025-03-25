import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
const PORT = process.env.PORT || 5000;
export const app = express();
// Add helmet middleware for security (protects against various attacks)
app.use(helmet());
export const allowOrigins = ['http://localhost:3000'];
app.use(cors({
    origin: allowOrigins
}));
app.get('/', async (req, res) => {
    res.send({ message: "hello rangpur" });
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
