import express from "express";
import urlRoutes from "../routes/url.routes.js";
import urlModel from "../models/url.model.js";
import cors from "cors";
const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());
app.use("/api/url",urlRoutes);
app.get("/:code",async(req,res)=>{
    try{
        console.log(req.params);
        const {code}=req.params;
        const url=await urlModel.findOne({
            shortCode:code
        })
        if(!url){
            return res.status(404).json({
                error:"Url not found"
            })
        }
        res.redirect(302,url.originalUrl);
        await urlModel.findOneAndUpdate({
            shortCode:code
        },{
            $inc:{clicks:1}
        })
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            error:"Internal server error"
        })
    }
})
export default app;