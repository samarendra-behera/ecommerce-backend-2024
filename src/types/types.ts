import {Request, Response, NextFunction} from "express"

export type ControllerType = (
    req: Request, 
    res: Response, 
    next: NextFunction
    ) => Promise<void | Response<any, Record<string, any>>>

export interface newUserReqBody {
    _id: string;
    name:string;
    email: string;
    photo: string;
    gender: string;
    role: string;
    dob: Date;
}