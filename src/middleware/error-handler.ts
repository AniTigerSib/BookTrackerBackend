import { Request, Response, Errback } from 'express';
import { StatusCodes, ReasonPhrases } from 'http-status-codes'

export const errorHandlerMiddleware = async (err: Errback, req: Request, res: Response) => {
    const now = new Date();
    console.log(`[${now.toLocaleTimeString()}] Error: ${err}`);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: ReasonPhrases.INTERNAL_SERVER_ERROR });
}