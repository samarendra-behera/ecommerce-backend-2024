import { Request, Response, NextFunction } from 'express'
import { User } from '../models/user.js';
import { newUserReqBody } from '../types/types.js';
import ErrorHandler from '../utils/utility-class.js';

export const newUser = async (
    req: Request<{}, {}, newUserReqBody>,
    res: Response,
    next: NextFunction
) => {
    try {
        throw new Error('slkdfjdsl')
        const { _id, name, email, gender, photo, dob } = req.body;
        console.log( _id, name, email, gender, photo, dob )
        const user = await User.create({ _id, name, email, gender, photo, dob: new Date(dob) })
        res.status(201).json({
            success: true,
            message: `Welcome, ${user.name}`
        })
    } catch (e) {
        next(e)
    }
}