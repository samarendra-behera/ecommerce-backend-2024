import mongoose from "mongoose";

const schema = new mongoose.Schema(
    {
        shippingInfo: {
            address: {
                type: String,
                required: [true, "Please give the Receive Address"]
            }
        }
    },
    {
        timestamps: true
    }
)