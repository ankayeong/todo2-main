import { Schema, model, models } from "mongoose";

const todoSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  completed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: String,
    required: true,
  },
});

const Todo = models.Todo || model("Todo", todoSchema);

export default Todo;