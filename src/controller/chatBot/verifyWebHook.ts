import { Request, Response } from "express";

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

const verifyWebHook = (req: Request, res: Response) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        res.status(200).send(challenge);
        return;
    } else {
        res.sendStatus(403);
        return;
    }
}

export default verifyWebHook;