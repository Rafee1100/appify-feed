import http from "./httpServices";
import { mapToUserModel } from "./normalizers";

const LIKES_ENDPOINT = "/likes";

export const likePost = (postId) =>
  http.post(LIKES_ENDPOINT, {
    target_type: "post",
    target_id: Number(postId),
  });

export const getPostLikes = async (postId) => {
  const data = await http.get(LIKES_ENDPOINT, {
    params: { target_type: "post", target_id: Number(postId) },
  });
  return (data.items ?? []).map(mapToUserModel);
};