import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 30,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 5,
      maxlength: 250,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    avatarUrl: { type: String, default: null },
  },
  { timestamps: true, versionKey: false },
);

userSchema.index({createdAt: -1});

function buildDTO(obj){
    return {
        id: obj._id.toString(),
        firstName: obj.firstName,
        lastName: obj.lastName,
        email: obj.email,
        avatarUrl: obj.avatarUrl,
        createdAt: (obj.createdAt ?? new Date()).toISOString(),
    }
}

userSchema.statics.toDTO = function (doc) {
    return buildDTO(doc);
}
userSchema.statics.toDTOFromLean = function (doc) {
    return buildDTO(doc);
}

export const User = mongoose.model("User", userSchema);
