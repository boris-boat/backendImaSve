import mongoose from "mongoose";
const Schema = mongoose.Schema;

const ConversationSchema = new Schema(
  {
    members: {
      type: Array,
    },
  },
  { collection: "Conversations",timestamps: true }
  
);
const Conversation = mongoose.model("Conversation", ConversationSchema);
export default Conversation;
