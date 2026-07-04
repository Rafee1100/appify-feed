import http from "./httpServices";
import { mapToCommentModel, mapToPostModel } from "./normalizers";

const POSTS_ENDPOINT = "/posts";

export const getPosts = async (cursor) => {
  const params = cursor ? { cursor } : undefined;
  const data = await http.get(POSTS_ENDPOINT, { params });

  return {
    posts: (data.items ?? []).map(mapToPostModel),
    nextCursor: data.nextCursor ?? null,
    hasMore: data.nextCursor != null,
  };
};

export const getPost = async (postId) => {
  const data = await http.get(`${POSTS_ENDPOINT}/${postId}`);
  return mapToPostModel(data.post);
};

export const createPost = async (postData) => {
  const formData = new FormData();
  formData.append("content", postData.content);
  formData.append("visibility", postData.visibility ?? "public");
  if (postData.image) {
    formData.append("image", postData.image);
  }

  const data = await http.post(POSTS_ENDPOINT, formData);
  return mapToPostModel(data.post);
};

export const deletePost = (postId) =>
  http.delete(`${POSTS_ENDPOINT}/${postId}`);

export const getPostComments = async (postId, cursor) => {
  const params = cursor ? { cursor } : undefined;
  const data = await http.get(`${POSTS_ENDPOINT}/${postId}/comments`, {
    params,
  });
  return (data.items ?? []).map(mapToCommentModel);
};

export const addComment = async (postId, commentData) => {
  const body = {
    content: commentData.content,
    parent_comment_id: commentData.parentCommentId ?? undefined,
  };
  const data = await http.post(
    `${POSTS_ENDPOINT}/${postId}/comments`,
    body,
  );
  return mapToCommentModel(data.comment);
};

export const getCommentReplies = async (commentId, cursor) => {
  const params = cursor ? { cursor } : undefined;
  const data = await http.get(`/comments/${commentId}/replies`, { params });
  return (data.items ?? []).map(mapToCommentModel);
};