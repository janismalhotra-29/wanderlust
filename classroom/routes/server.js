const express=require("express");
const app=express();
// const users= require(".routes/user.js");
// const posts= require("./routes/post.js");
const session= require("express-session");
const flash= require("connect-flash");
const { render } = require("ejs");
const path= require("path");
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"..","views"));


const sessionOptions={secret:"mysupersecretstring", 
    resave:false, 
    saveUninitialized:true};

app.use(session(sessionOptions));
app.use(flash());

// app.get("/test",(req,res)=>{
//     res.send("test successful")
// });


// app.get("/reqcount",(req,res)=>{
//    if( req.session.count){
//     req.session.count++;
//    }
//    else{
//     req.session.count=1;
//    }
//     res.send(`you sent request ${req.session.count} times`)
// ;})



app.get("/register",(req,res)=>{
    let{name="anonymous"}=req.query;
    req.session.name= name;
    console.log(req.session.name);
    // res.send(name);
    req.flash("success", "user registered sucessfully");
    res.redirect("/hello");
})

app.get("/hello",(req,res)=>{
    // res.send(`hello, ${req.session.name}`);
    res.locals.messages= req.flash("success");
    res.render("page.ejs", {name: req.session.name, msg:req.flash("success")});
})

app.listen(3000,()=>{
    console.log("server is listening to 3000");
});
