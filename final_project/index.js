const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
    //Check if user is logged in and has valid access token
    if(req.session.authorization){
        let token = req.session.authorization['accessToken'];
        //Verify JWT token
        jwt.verify(token, "access", (error,user)=>{
            if(error){
                res.send("User has not been authenticated");
            }else{
                req.user=user;
                //Proceed to next anticipated middleware
                next();
            }
        });
    }else{
        res.send("User is not logged in.");
    }
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
