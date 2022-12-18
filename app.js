//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const lodash = require("lodash");

const app = express();

app.set('view engine', 'ejs');
mongoose.set('strictQuery', false);

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const connectDB = async() => {
  // return mongoose.connect("mongodb://0.0.0.0:27017/todolistDB",{useNewUrlParser: true, useUnifiedTopology: true })
  return mongoose.connect("mongodb+srv://Ganesh:ganesh_123@cluster0.pjt5yrm.mongodb.net/todolistDB",{useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=>{
    console.log("Database Connected Successfully")
  })
  .catch((err)=>{
    console.log(err);
  })
}
connectDB();

const itemsSchema = {
  name:String
};

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name:"Welcome to your todolist!"
});
const item2 = new Item({
  name:"Hello"
});
const item3 = new Item({
  name:"Hi"
});

const arrList = [item1,item2,item3];

app.get("/", function(req, res) {  
    Item.find({},function(err,itemsFound){
      if(err){
        console.log(err);
      }else{
        if(itemsFound.length === 0){
          Item.insertMany(arrList,function(err){
            if(err){
              console.log(err);
            }else{
              console.log("The data has been Successfully Saved to DB");
            }
          });
          res.redirect("/");
        }else{
          res.render("list", {listTitle: "Today", newListItems: itemsFound});
        }
      }
    });   
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const itemObj = new Item({  
    name:itemName
  })
  if(listName === "Today"){
    itemObj.save(); 
    res.redirect("/");
  }else{
    List.findOne({name:listName},function(err,foundList){
      if(!err){
        foundList.item.push(itemObj);
        foundList.save();
        res.redirect("/" + listName);
      }else{
        console.log(err);
      }
    })
  }
});
app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err){
      if (!err) {
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {item: {_id: checkedItemId}}}, function(err, foundList){
      if (!err){
        console.log("Successfully deleted checked item in the list.");
        res.redirect("/" + listName);
      }
    });
  }
});
const listSchema = {
  name:String,
  item:[itemsSchema]
}

const List = mongoose.model("List",listSchema);

app.get("/:customListName",function(req,res){
  const customListName = lodash.capitalize(req.params.customListName);
  List.findOne({name:customListName},function(err,foundlist){
    if(err){
      console.log(err);
    }else{
      if(!foundlist){
        const list = new List({
          name:customListName,
          item:arrList
        });
        list.save();
        res.redirect("/"+customListName);
      }else{
        res.render("list",{listTitle:foundlist.name, newListItems:foundlist.item});
      }
    }
  })
  

})

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
