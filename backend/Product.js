import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    productName:String,
    price:Number,
    rating:Number,
    discount:Number,
    availability:String
},{timestamps:true})

const Product = mongoose.model("Product",productSchema);
export default Product;