import mongoose from "mongoose";

const { Schema } = mongoose;

const SubscriptionSchema = new Schema(
  {
    shop: { type: String, required: true, unique: true },
    subscriptionId: { type: String, required: true },
    plan: { type: String, required: true },
    status: { type: String, required: true },
    validUntil: { type: Date, required: true },
    interval: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Subscription", SubscriptionSchema);