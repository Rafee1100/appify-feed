import mongoose from "mongoose";

const { Schema } = mongoose;

const likeSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetType: {
      type: String,
      enum: ["Post", "Comment"],
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false },
);

likeSchema.index({ userId: 1, targetType: 1, targetId: 1 }, { unique: true });
likeSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });
likeSchema.index({ userId: 1, createdAt: -1 });

export const Like = mongoose.model("Like", likeSchema);
