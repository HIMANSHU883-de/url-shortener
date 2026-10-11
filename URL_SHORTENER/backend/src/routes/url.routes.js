import express from "express";
import generateCode from "../utils/generateCode.js";
import urlModel from "../models/url.model.js";
const router = express.Router();
router.post("/", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: "Url is required" });
    }
    if (
      url.startsWith("http://") == false &&
      url.startsWith("https://") == false
    ) {
      return res
        .status(400)
        .json({ error: "Url should start with http:// or https://" });
    }
    if (url.length > 2048) {
      return res
        .status(400)
        .json({ error: "Url should not exceed 2048 characters" });
    }
    const code = generateCode();
    const newUrl = new urlModel({
      originalUrl: url,
      shortCode: code,
    });
    await newUrl.save();
    return res.status(201).json({
      message: "Short url created successfully",
      data: {
        originalUrl: newUrl.originalUrl,
        shortCode: newUrl.shortCode, 
      },
    });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/",async(req,res)=>{
    try{
        const urls=await urlModel.find();
        return res.status(200).json({
            message:"Urls fetched successfully",
            data:urls
        })
    }catch(err){
        return res.status(500).json({
            error:"Internal server error"
        })
    }
})

router.delete("/:id",async(req,res)=>{
  try{
    const {id}=req.params;
    const url=await urlModel.findById(id)
    if(!url){
      return res.status(404).json({
        error:"Url not found"
      })
    }
    await urlModel.findByIdAndDelete(id);
    return res.status(200).json({
      message:"Url deleted successfully"
    })
  }
  catch(err){
    console.log(err);
    return res.status(500).json({
      error:"Internal server error"
    }) 
  }
})
export default router;
