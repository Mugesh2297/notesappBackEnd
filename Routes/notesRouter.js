const express = require("express");
require("../Db/connect");
const router = express.Router();
const Notes = require("../Models/notesModels");
const { default: mongoose } = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const auth = require("../Modules/auth");


router.post("/createnotes", auth.authenticateUser, async function (req, res) {
    try{
        console.log(req.body.currentuser);
        req.body.userid = req.body.currentuser.existUser._id;
        const payload = req.body;
        const newNotes = new Notes(payload);
        newNotes.save((err, data)=>{
            if (err){
                return res.status(400).send({message:"Error while adding new Notes"})
            }
            res.status(200).send({data, message:"Notes has been added successfully"})
        })

    }catch(err){
        console.log(err)
        res.status(500).send({
            message: "Internal Server Error"
        })
    }
  });



  //get url

  router.get("/getnotes", auth.authenticateUser, async function (request, response) {
    try {

    const data = await Notes.find({userid: request.body.currentuser.existUser._id });
      if (data) {
        response.json(data);
      } else {
        console.log("Notes not found");
        response.json({
          message: "Notes not found",
        });
      }
    } catch (error) {
      console.log(error);
    }
  });

  router.get("/getnotes/:id", auth.authenticateUser, async function (request, response) {
    const id = request.params.id;
    try {

    const data = await Notes.findOne({_id: id });
      if (data) {
        response.json(data);
      } else {
        console.log("Notes not found");
        response.json({
          message: "Notes not found",
        });
      }
    } catch (error) {
      console.log(error);
    }
  });

 

router.put("/updatenotes/:id", auth.authenticateUser, async function (request, response) {
   
    const id = request.params.id;
    try{
        const updateData = await Notes.updateOne({_id: id},{$set: { ...request.body }}, {returnDocument: "after"});
          console.log(response);
          response.send(updateData)
    }catch(err){
        console.log(err);
        response.status(500).send(err);
    }

})



router.delete("/deletenotes/:id", auth.authenticateUser, async function (request, response) {
   
    const id = request.params.id;
    try{
        const deleteData = await Notes.remove({_id: id});
          console.log(response);
          response.send(deleteData)
    }catch(err){
        console.log(err);
        response.status(500).send(err);
    }

})

  module.exports = router;
