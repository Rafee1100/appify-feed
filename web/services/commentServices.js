import http from "./httpServices";
import { mapToUserModel } from "./normalizers";

const LIKES_ENDPOINT = "/likes";

export const likeComment = (commentId) =>
  http.post(LIKES_ENDPOINT, {
    target_type: "comment",
    target_id: Number(commentId),
  });

export const getCommentLikes = async (commentId) => {
  const data = await http.get(LIKES_ENDPOINT, {
    params: { target_type: "comment", target_id: Number(commentId) },
  });
  return (data.items ?? []).map(mapToUserModel);
};