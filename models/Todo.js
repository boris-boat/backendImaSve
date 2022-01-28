import mongoose from "mongoose";
const Schema = mongoose.Schema;

const TodoSchema = new Schema({
  text: {
    type: String,
    required: true,
  },
  createdBy: {
    type: String,
    required: true,
  },
  category: {
    type: String,
  },
  completed: {
    type: Boolean,
  },
});
const Todo = mongoose.model("Todo", TodoSchema);
export default Todo;
