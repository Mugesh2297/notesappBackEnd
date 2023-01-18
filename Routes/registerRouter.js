const express = require("express");
require("../Db/connect");
const router = express.Router();
const Register = require("../Models/registerModels");
const bcrypt = require ("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const randomString = require("randomstring");
const { default: mongoose } = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const auth = require("../Modules/auth");




router.post("/signup", async(req,res,next)=>{
 
try{
    //Email id Validation
        let Reset = req.body.email;
        console.log(Reset);
        let check = await Register.findOne({ email: Reset })
        if(check){
            return res.status(400).send({message: "User Already Exists", code:"existUser"})
        }
//confirm password checking 

const isSamePassword = checkPassword(req.body.password, req.body.confirmPassword);
if(!isSamePassword)
    return res.status(400).send({message:"Password doesn't match", code:"password"});
else
 delete req.body.confirmPassword;    

//password hash  
const randomString = await bcrypt.genSalt(10);
req.body.password = await bcrypt.hash(req.body.password,randomString);

//Save in DB
const payload = req.body;
const newUser = new Register(payload);
console.log(newUser);
newUser.save((err, data)=>{
    if (err){
        console.log(err);
        return res.status(400).send({message:"Error while adding new User"})
    }
    res.status(200).send({data, message:"User added Successfully, Please Check Your Email to Activate Account", code:"newUseradded"})
});
//Send activation Link
let email = req.body.email;
// console.payload.email;
var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.FROM,
      pass:  process.env.PASSWORD,
    },
  });
  let link = "https://notesapp2211.netlify.app/activate"
        var mailOptions = {
          from: process.env.FROM,
          to: email,
          subject: "Activate Your Account",
          text: `Please activate the account by clicking this link`,
          html: `<center style="padding:50px"><a href=${link} target="_blank"><button style="color:white;background-color:teal;
          padding:15px; border:none; border-radius:10px;font-size:30px;text-shadow: 2px 2px 4px #000000;;">
          Click Here to Activate your Account</button></a></center>`,
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error);
              res.json({
                message: "Email not send",
              });
            } else {
              console.log("Email sent: " + info.response);
              res.json({
                message: "Email Send",
              });
            }
          });
        

}catch(err){
    
console.error(err);
res.status(500).send(err);
}

});

const checkPassword = (password, confirmPassword)=>{
    return password!==confirmPassword? false : true;
}


//Activate Account
router.post("/activate-account", async function (req, res) {
  
    try {
        let activateUser = req.body.email;
        let check = await Register.findOne({email: activateUser});
   
    if(check){
        if(check.isActive === "inActive"){
            await Register.updateOne({email: req.body.email},{$set: {isActive: "Active"}});
            res.status(200).json({
                message:"User Activated SuccessFully"
            }); }
            else{
                res.json({
                    message: `Your account is already activated`, code: "active"
                  });

            }
       
    }
    else {
        res.status(400).json({
          message: `Your email ID is not found, please signup to continue`,code:"noemail"
        });
      }
    } catch (error) {
      console.log(error);
    }
  });
  

router.post("/signin",async (req,res,next)=>{
  

    try{
        
        console.log(req.body.email);
        let match = req.body.email;
        let existUser = await Register.findOne({ email: match })
        console.log(existUser);
  if(existUser== null){
    return res.status(400).send({msg: "Your are not an Existing User, Please Sign up to continue", code:"email"});
  } 
  //password check
  const isSamePassword = await bcrypt.compare 
  (req.body.password, existUser.password);
  console.log(isSamePassword);

  if(!isSamePassword){
    return res.status(400).send({msg:"Password Incorrect", code:"password"});
  }
  
  else{
    if(existUser.isActive=== "Active"){
        const token =jwt.sign({existUser}, process.env.SECRET_KEY,{expiresIn: "1h"});

        res.json({ token,existUser });
        console.log(token)
    }else{
        return res.status(400).send({msg:"User Not activated", code:"user"});
    }
  }

//Generate and Send token as a response 
//JWT token library 




    }catch(err){
        console.error(err);
        res.status(500).send(err);
    }

})

//reset password

router.post("/resetpassword", async function (req, res) {
    try {
        const resetPassword = req.body.email;
        const check = await Register.findOne({email: resetPassword});
      if (check) {
        let mailid = req.body.email;
        let rString = randomString.generate(12);
        let link = `https://notesapp2211.netlify.app/resetpass/${check._id}`;
        // await Register.updateOne({email: req.body.email},{$set: {isActive: "Active"}});

        let response = await Register.updateOne({email: req.body.email},{$set: {randomString: rString }});
       console.log(response);
        
        var transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.FROM,
            pass: process.env.PASSWORD,
          },
        });
  
        var mailOptions = {
          from: process.env.FROM,
          to: mailid,
          subject: "Password Reset ",
          text: `Click the link to reset password ${link}`,
          html: `<center style="padding:50px"><a href=${link} target="_blank"><button style="color:white;background-color:teal;
          padding:15px; border:none; border-radius:10px;font-size:30px;text-shadow: 2px 2px 4px #000000;;">
          Click Here to Reset your Password</button></a></center>`,
        };
  
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
            res.json({
              message: "Email not send",
            });
          } else {
            console.log("Email sent");
            res.json({
              message: "Email Send",
            });
          }
        });
        res.json({
          message: "Email Send",
        });
      } else {
        res.status(400).json({
          message: "User Not Found",
        });
      }
    } catch (error) {
      console.log(error);
    }
  });




  router.post("/reset-password-page/:id", async function (req, res) {
    const id = req.params.id;
    console.log(id);
    if(req.body.password === req.body.confirmPassword){
      try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(req.body.password, salt);
        req.body.password = hash;
     
      const resetPassword = id;
      const check = await Register.findOne({_id: id});
         console.log(check.randomString)
        if (check) {
          if (check.randomString != "" ) {
          let response = await Register.updateOne({_id: id},{$set: {password: req.body.password }});
          console.log(response);
  
            res.json({
              message: "Password reset done",
            });
          } else {
              res.status(400).send({msg:"String not Found", code:"expire"});
          }
        } else {
          res.json({
            message: "Email Id not match / User not found",
          });
        }
        await Register.updateOne({_id: id},{$set: { randomString: "" }});
  
      } catch (error) {
        console.log(error);
      }
    }
    else {
      res.status(400).send({msg:"Password not matched", code:"password"});
    }
  });
  router.get("/getUsers", auth.authenticateUser, async function (request, response) {
    try {

    const data = await Register.find({userid: request.body.currentuser._id });
      if (data) {
        response.json(data);
      } else {
        console.log("User not found");
        response.json({
          message: "User not found",
        });
      }
    } catch (error) {
      console.log(error);
    }
  });


module.exports= router;