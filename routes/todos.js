import Todo from "../models/Todo.js"
import express from 'express';
const router = express.Router();



router.get("/:user", async (req, res) => {
    
    const todos = await Todo.find({ createdBy: req.params.user });
    res.json(todos);
  });
  router.post("/createTodo", (req, res) => {
    const todo = new Todo({
      text: req.body.text,
      createdBy: req.body.creator,
      category: req.body.category,
      completed: false,
    });
    todo.save();
    res.json(todo);
  });
  router.delete("/delete:id", async (req, res) => {
    
    const result = await Todo.findByIdAndRemove(req.params.id);
    res.json();
  });
 
  export  {router};