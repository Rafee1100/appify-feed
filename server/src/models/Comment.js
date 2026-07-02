import mongoose from "mongoose";
const { Schema } = mongoose;

const commentSchema = new Schema(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    parentCommentId: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    content: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 1000,
    },
    depth: { type: Number, required: true, default: 0, min: 0, max: 5 },
    likeCount: { type: Number, required: true, default: 0, min: 0 },
    replyCount: { type: Number, required: true, default: 0, min: 0 },
  },
  { timestamps: true, versionKey: false },
);

commentSchema.index({ postId: 1, parentCommentId: 1, createdAt: -1 });
commentSchema.index({ authorId: 1, createdAt: -1 });
commentSchema.index({ parentCommentId: 1, createdAt: -1 });

function buildDTO(obj) {
  return {
    id: obj._id.toString(),
    postId: obj.postId.toString(),
    authorId: obj.authorId.toString(),
    parentCommentId: obj.parentCommentId?.toString() ?? null,
    content: obj.content,
    depth: obj.depth,
    likeCount: obj.likeCount,
    replyCount: obj.replyCount,
    createdAt: (obj.createdAt ?? new Date()).toISOString(),
  };
}

commentSchema.statics.toDTO = function (doc) {
  return buildDTO(doc);
};
commentSchema.statics.toDTOFromLean = function (doc) {
  return buildDTO(doc);
};

export const Comment = mongoose.model("Comment", commentSchema);
