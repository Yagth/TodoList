const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash")
// const date = require(__dirname+"/date.js");
const notAllowed = [""," ","  ","   "];

const app = express();

mongoose.connect("mongodb+srv://admin-yab:Test-123@todo-list.xykwipz.mongodb.net/TodoListDB")

const ListItem = new mongoose.Schema({
    name: String
})

const List = new mongoose.Schema({
    name : String,
    items : [ListItem]
})

const ListItems = mongoose.model("Item", ListItem)
const Lists = mongoose.model("List", List)

app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

const Item1 = {
    name: "Welcome to TODO list"
}
const Item2 = {
    name: "Hit + to add more Item"
}
const Item3 = {
    name: "<-- Hit this to remove an item"
}

const defaultItems = [Item1, Item2, Item3]

app.get("/", function(req,res){

    ListItems.find({},function(err, listItems){
        if(!err){
            if(listItems.length === 0){
                ListItems.insertMany([
                    Item1,
                    Item2,
                    Item3
                ], function(err){
                    if(err){
                        console.log(err);
                    } else{
                        res.redirect("/")
                    }
                })
            } else{
                res.render("list", {listName : "Today", nextItems : listItems});
            }
        } else{
            console.log(err);
        }
    })
    // const day = date.getDate();
});

app.get("/about",function(req,res){
    res.render("about");
});

app.get("/create", function(req,res){
    res.render("create");
})

app.get("/lists", function(req, res){
    Lists.find({}, function(err, foundItems){
        if(!err){
            res.render("lists", {lists:foundItems})
        }
    })
})

app.get("/:listName", function(req,res){
    const listParam = _.capitalize(req.params.listName)

    Lists.findOne({name: listParam}, function(err, listItem){
        console.log(listItem);
        if(err){
            console.log(err)
            res.redirect("/")
        } else{ 
            if(listItem){
                res.render("list", {listName: listParam, nextItems: listItem.items})
            } else if(!listItem){
                const list = new Lists({
                    name: listParam,
                    items: defaultItems
                })
                list.save(function(err, doc){
                    if(!err){
                        res.redirect("/"+listParam)
                    } else{
                        console.log(err);
                    }
                })
            }
        }
    })
})

app.post("/",function(req,res){
    const item = new ListItems({
        name: req.body.item
    })

    const listName = req.body.list

    if(notAllowed.indexOf(item.name) < 0){
        if(listName == "Today"){
            item.save()
            res.redirect("/")
        } else{
            Lists.findOne({name:listName}, function(err, foundList){
                if(!err){
                    foundList.items.push(item);
                    foundList.save()
                    res.redirect("/"+listName)
                } else{
                    console.log(err)
                }
            })
        }

    }
})

app.post("/create", function(req, res){
    const listName = req.body.listName;
    res.redirect("/"+listName)
})

app.post("/delete", function(req,res){
    const itemId = req.body.checkbox
    const listName = req.body.listName

    if(listName === "Today"){
        ListItems.findByIdAndRemove(itemId, function(err){
            if(err){
                console.log(err);
            } else{
                console.log("Item removed");
                res.redirect("/")
            }
        })
    } else{
        Lists.findOneAndUpdate({name: listName}, {$pull : {items: {_id: itemId}}}, function(err, foundList){
            if(!err){
                res.redirect("/"+listName)
            }
        })
    }
})

app.post("/deleteList", function(req, res){
    const listId = req.body.listId
    console.log(listId);
    Lists.findByIdAndRemove(listId, function(err){
        if(err){
            console.log(err);
        } else{
            console.log("List removed");
            res.redirect("/lists")
        }
    })
})

let port = process.env.PORT

if(port == null || port == ""){
    port = 3000
}

app.listen(port, function(){
    console.log("Server is up and running succesfully")
})
