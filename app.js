const express = require("express");

const bodyParser = require("body-parser");
var _ = require('lodash');


//const date =require(__dirname + "/date.js");
const app = express();


const workItems = [];

const mongoose = require("mongoose");

app.set("view engine","ejs");


app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/todoDB",{
        useNewUrlParser: true,
        useUnifiedTopology: true,
      //  useCreateIndex: true,  
     })   
 .then(() => console.log("Database connected!"))
 .catch(err => console.log(err));
 

const itemSchema = {
    name: String,           //creating a schema 
    
}
const Item = mongoose.model(
 "Item", itemSchema   )             //creating a model


const item1 = new Item({
    name:"welcome to our to do list!!",   //creating documents
    
});

const item2 = Item({
    name:"use + to add items",
    
});

const item3 = Item({
    name:"<-- hit this to delete an item",
    
});

const defaultItems = [item1,item2,item3];

const listSchema ={
    name:String,
    items:[itemSchema]
};

const List = mongoose.model("List",listSchema);



app.get("/:customListName" , (req,res) => {
    const coustomListName =_.capitalize( req.params.customListName);
  List.findOne({name: coustomListName} , function(err,foundList){
    if(!err){
        if(!foundList){
              const list = new List({
        name:coustomListName,
        items: defaultItems })
        
           list.save();
    res.redirect("/"+ coustomListName);
        
    
   
     }else{
            res.render("list",{listTitle:foundList.name , newlistItems:foundList.items});
         
        }
    }
  

  })

});


app.get("/",function(req,res){
Item.find({} , function(err,foundItems){
    if(foundItems.length===0){
        Item.insertMany(defaultItems, function(error){
    if(error){
        console.log(error);
    }else{
        console.log("successfully saved default items to database ");
    }
});
res.redirect("/");

    }else{
res.render("list", {listTitle:"Today" , newlistItems:foundItems});
    }
     
})
  //  let day = date()
  //must be in the view folder the list.ejs file // rende to be used if u install ejs  

   
});

app.get("/delete" , (req,res)=>{

})

app.post("/",function(req,res){

 let itemName =req.body.newItem;
 const listName =req.body.list;

 const item = new Item({
    name:itemName,
    
 });

 if(listName==="Today"){
 item.save();
res.redirect("/")
}else{
    List.findOne({name : listName}, function(err ,foundlist){
        foundlist.items.push(item);
        foundlist.save();
        res.redirect("/"+ listName);
    })
}
 
})

app.post("/delete" , (req,res) => {
    const checkedItemid = req.body.checkBox;
    const listName = req.body.listName;
    if(listName === "Today"){  Item.findByIdAndRemove(checkedItemid , function(err){
        if(!err){
            console.log("sucessfully deleted cheked");
            res.redirect("/")
        }
    });
}else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id: checkedItemid}}},function(err,foundlist){
if(!err){
    res.redirect("/" + listName);
}
    })

    }
  

})

app.get("/work",function(req,res){
   
    res.render("list",{listTitle:"work list", newlistItems:workItems})
});

app.get("/about",function(req,res){
    res.render("about");
})

app.post("/work",function(req,res){
    let item = req.body.newItem;
    workItems.push(item);
})

app.listen(3000, function(req,res){
    console.log("server is running at port 3000");

})