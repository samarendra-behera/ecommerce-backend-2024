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

export interface newProductReqBody {
    name: string;
    price: number;
    category: string;
    stock: number;
}

export interface productSearchReqQuery {
    search?:string;
    price?:string;
    category?:string;
    sort?:string;
    page?:string;
}
export interface productBaseQuery {
    name?:{
        $regex: string;
        $options: string;
    };
    price?:{
        $lte: number;
    };
    category?: string;
}

export type invalidateCacheProps = {
    product?:boolean;
    order?:boolean;
    admin?:boolean;
    userId?: string;
    productId?:string | string[];
    orderId?:string;

}

export type shippingInfoType = {
    address: string;
    city: string;
    state: string;
    country: string;
    pinCode: number;
}
export type orderItemType = {
    name: string;
    photo: string;
    price: number;
    quantity: number;
    productId: string;
}

export interface newOrderReqBody {
    shippingInfo: shippingInfoType,
    user:string;
    subTotal: number;
    tax:number;
    shippingCharges: number;
    discount: number;
    total: number;
    status: string;
    orderItems: orderItemType[]
}

export interface newCouponReqBody {
    code: string;
    amount: number;
}