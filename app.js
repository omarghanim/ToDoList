const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-omar:last4digit@cluster0-60cim.mongodb.net/todolistDB" , {useNewUrlParser: true,useUnifiedTopology: true});

const Schema= new mongoose.Schema({
name : String
});
const Item = mongoose.model("Item",Schema);
const item1 = new Item({
  name : "Welcome to your To do list"
});
const item2 = new Item({
  name : "Hit + button to add a new item"
});
const item3 = new Item({
  name : "<-- hit this to delete an item"
});
const defaultItems = [item1,item2,item3];
const listSchema = {

  name : String,
  items : []
};
const List = mongoose.model("List",listSchema);


app.get("/",function(req,res){

Item.find({},function(err,founditems){
if(founditems.length===0){

  Item.insertMany(defaultItems,function(err){
    if(err){
    console.log(err);
  }else{
    console.log("successfully saved database");
  }
  })
}else{

  res.render("list",{listTitle:"Today" , item : founditems});
  }
})

})

app.get("/:customlistName",function(req,res){
  const customlistName = _.capitalize(req.params.customlistName);
List.findOne({name:customlistName},function(err,foundList){
  if(!err){
    if(!foundList){

      var list = new List({
        name : customlistName ,
        items : defaultItems
      });
      list.save();
      res.redirect("/"+customlistName);

        }else{
          res.render("list",{listTitle:foundList.name , item : foundList.items});
    }
  }
})

});


let day = date.getDay();



app.post("/",function(req,res){

const ItemName = req.body.text;
const listName = req.body.list;

const newItem = new Item({
  name : ItemName
});
if(listName === "Today"){
  newItem.save();
  res.redirect("/");
}
else{
  List.findOne({name:listName},function(err,foundList){
foundList.items.push(newItem);
foundList.save();
res.redirect("/"+listName);

});
}


});

app.post("/textList",function(req,res){
const textList = req.body.textList
res.redirect("/"+textList);
})

app.post("/delete",function(req,res){
  const checkedID = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){

    Item.findByIdAndRemove(checkedID , function(err){
      if(!err){
        console.log("deleted");
        res.redirect("/");
      }
    });
  }else{
List.findOneAndDelete({name:listName},{ $pull : {items:{_id : checkedID}}},function(err,foundList){
  if(!err){
    res.redirect("/"+listName);
  }
});

  }

});


app.listen(process.env.PORT || 3000,function(){
  console.log("server running");
})
