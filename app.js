// // jshint esversion:6
// go to mongoosejs.com for connection

const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const _ = require("lodash")
// const date = require(__dirname + "/date.js")

const app = express()

app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"))
mongoose.set('strictQuery', true);
// mongoose.set('bufferCommands', true);
mongoose.connect('mongodb+srv://admin-iram:Rafique1@cluster0.yqafx45.mongodb.net/todolistdb');

const itemsSchema = {
  name: String,
};
const Item = mongoose.model("Item", itemsSchema);
const item1 = new Item({
  name: "Welcome to your TO DO LIST"
});
const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item"
});
const defaultItems = [item1, item2, item3]


const listSchema = ({
  name: String,
  items: [itemsSchema]
});
const List = mongoose.model("List", listSchema)


app.get("/", (req, res) => {
  //let day = date.getDate()
  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err)
        } else {
          console.log("successful")
        }
      })
      res.redirect("/")
    }
    else { res.render("list", { listTitle: "Today", newListItems: foundItems }) }
  })

})
app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName)
  List.findOne({ name: customListName }, function (err, foundList){
    if (!err) {
      if (!foundList) {
        //create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        })
        list.save()
        res.redirect("/" + customListName)
      }
      //show an existing list
      else { res.render("list", { listTitle: foundList.name, newListItems: foundList.items }) 
      }}
    }
  )
}
)




app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });
  if(listName === "Today"){
  item.save()
  res.redirect("/")}
  else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item)
      foundList.save()
      res.redirect("/" + listName)

    
  
})
  }
  })
  app.post("/delete", function (req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
  
    if (listName === "Today") {
      Item.findByIdAndRemove(checkedItemId, function (err) {
        if (!err) {
          console.log("Successfully deleted checked item.");
          res.redirect("/");
        }
      });
    } else {
      List.findOneAndUpdate({name: listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
        if(!err){
          res.redirect("/" + listName);
      }});
  }
  });
  


// findByIdAndRemove call back function must be there






app.listen(3000, function () {
  console.log("server is running on port 3000")
});
