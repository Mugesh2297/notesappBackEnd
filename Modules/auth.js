const jwt = require("jsonwebtoken");

exports.authenticateUser = (req,res,next)=>{
    //check Whether Access token exist in headers 
    if(!req.headers.accesstoken)
    return res.status(400).send({msg:"Token not Found"});

    //Verify Token 
    try{
    const user = jwt.verify(req.headers.accesstoken, process.env.SECRET_KEY);
    console.log(user);
    req.body.currentuser = user;
    next();

    }catch(err){
         console.error(err);
         res.status(400).send({msg:"Unauthorised"});
    }

}