import mongoose from "mongoose";

export const connectDB = ()=>{
    mongoose.connect("mongodb+srv://samarendrabeherapapu:nQ4mG3KPKyO0NOLD@cluster0.nti089h.mongodb.net/?retryWrites=true&w=majority", {
        dbName: "Ecommerce_24",
    }).then((c)=>console.log(`DB Connected to ${c.connection.host}`))
    .catch((e)=>console.log(e))
}