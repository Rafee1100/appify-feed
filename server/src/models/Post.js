import mongoose from "mongoose";

const { Schema } = mongoose;

const postSchema = new Schema(
  {
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 5000,
    },
    imageUrl: {
      type: String,
      default: null,
    },
    imagePublicId: {
      type: String,
      default: null,
    },
    visibility: {
      type: String,
      enum: ["public", "private"],
      required: true,
      default: "public",
    },
    likeCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true, versionKey: false },
);

// Public feed covers the public branch of the `$or` feed query
postSchema.index({ visibility: 1, createdAt: -1, _id: -1 });
// Author's own posts inc private
postSchema.index({ authorId: 1, createdAt: -1, _id: -1 });
// Global recency fallback
postSchema.index({ createdAt: -1 });

function buildDTO(obj) {
  return {
    id: obj._id.toString(),
    authorId: obj.authorId.toString(),
    content: obj.content,
    imageUrl: obj.imageUrl ?? null,
    imagePublicId: obj.imagePublicId ?? null,
    visibility: obj.visibility,
    likeCount: obj.likeCount ?? 0,
    commentCount: obj.commentCount ?? 0,
    createdAt: (obj.createdAt ?? new Date()).toISOString(),
    updatedAt: (obj.updatedAt ?? new Date()).toISOString(),
  };
}

postSchema.statics.toDTO = function (doc) {
  return buildDTO(doc);
};
postSchema.statics.toDTOFromLean = function (obj) {
  return buildDTO(obj);
};

export const Post = mongoose.model("Post", postSchema);
