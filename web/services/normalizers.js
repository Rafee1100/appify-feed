// Convert backend snake_case payloads into the camelCase shape used
// throughout the frontend.

export const mapToUserModel = (user) => ({
  id: String(user.id),
  firstName: user.first_name ?? "",
  lastName: user.last_name ?? "",
  email: user.email ?? "",
  avatarUrl: user.avatar_url ?? null,
});

export const mapToPostModel = (post) => ({
  id: String(post.id),
  author: mapToUserModel(post.author),
  content: post.content ?? "",
  imageUrl: post.image_url ?? null,
  visibility: post.visibility ?? "public",
  likeCount: post.like_count ?? 0,
  commentCount: post.comment_count ?? 0,
  likedByMe: Boolean(post.liked_by_me),
  createdAt: post.created_at,
});

export const mapToCommentModel = (comment) => ({
  id: String(comment.id),
  postId: comment.post_id != null ? String(comment.post_id) : undefined,
  parentCommentId:
    comment.parent_comment_id != null
      ? String(comment.parent_comment_id)
      : null,
  author: mapToUserModel(comment.author),
  content: comment.content ?? "",
  likeCount: comment.like_count ?? 0,
  replyCount: comment.reply_count ?? 0,
  likedByMe: Boolean(comment.liked_by_me),
  createdAt: comment.created_at,
});