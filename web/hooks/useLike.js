"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import * as commentServices from "@/services/commentServices";
import * as likeServices from "@/services/likeServices";
import { FEED_KEY } from "./usePosts";
import { COMMENTS_KEY } from "./useComments";

const LIKE_STALE_TIME_MS = 30 * 1000;

const toggleLike = (likedByMe, likeCount) => ({
  likedByMe: !likedByMe,
  likeCount: likedByMe ? likeCount - 1 : likeCount + 1,
});

const updateCommentLikes = (comments, targetId) => {
  return comments.map((comment) => {
    if (comment.id === targetId) {
      return {
        ...comment,
        ...toggleLike(comment.likedByMe, comment.likeCount),
      };
    }
    return {
      ...comment,
      replies: (comment.replies ?? []).map((reply) =>
        reply.id === targetId
          ? { ...reply, ...toggleLike(reply.likedByMe, reply.likeCount) }
          : reply
      ),
    };
  });
};

const handleCommentLikeResult = (comments, targetId, result) => {
  return comments.map((comment) => {
    if (comment.id === targetId) {
      return {
        ...comment,
        likedByMe: Boolean(result.liked),
        likeCount: result.like_count ?? result.likeCount ?? comment.likeCount,
      };
    }
    return {
      ...comment,
      replies: (comment.replies ?? []).map((reply) =>
        reply.id === targetId
          ? {
              ...reply,
              likedByMe: Boolean(result.liked),
              likeCount:
                result.like_count ?? result.likeCount ?? reply.likeCount,
            }
          : reply
      ),
    };
  });
};

export const usePostLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId) => likeServices.likePost(postId),

    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: FEED_KEY });
      const previousFeed = queryClient.getQueryData(FEED_KEY);

      queryClient.setQueryData(FEED_KEY, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            posts: page.posts.map((post) =>
              post.id === postId
                ? { ...post, ...toggleLike(post.likedByMe, post.likeCount) }
                : post
            ),
          })),
        };
      });

      return { previousFeed };
    },

    onError: (_err, _postId, context) => {
      if (context?.previousFeed) {
        queryClient.setQueryData(FEED_KEY, context.previousFeed);
      }
      toast.error("Failed to like post.");
    },

    onSuccess: (data, postId) => {
      const isLiked = Boolean(data.liked);
      const likeCount = data.like_count ?? data.likeCount;

      queryClient.setQueryData(FEED_KEY, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            posts: page.posts.map((post) =>
              post.id === postId
                ? {
                    ...post,
                    likedByMe: isLiked,
                    likeCount: likeCount ?? post.likeCount,
                  }
                : post
            ),
          })),
        };
      });
    },
  });
};

export const useCommentLike = (postId) => {
  const queryClient = useQueryClient();
  const commentsKey = [...COMMENTS_KEY, postId];

  return useMutation({
    mutationFn: (commentId) => commentServices.likeComment(commentId),

    onMutate: async (commentId) => {
      await queryClient.cancelQueries({ queryKey: commentsKey });
      const previousComments = queryClient.getQueryData(commentsKey);

      queryClient.setQueryData(commentsKey, (old) => {
        if (!old) return old;
        return updateCommentLikes(old, commentId);
      });

      return { previousComments };
    },

    onError: (_err, _commentId, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(commentsKey, context.previousComments);
      }
      toast.error("Failed to like comment.");
    },

    onSuccess: (data, commentId) => {
      queryClient.setQueryData(commentsKey, (old) => {
        if (!old) return old;
        return handleCommentLikeResult(old, commentId, data);
      });
    },
  });
};

export const usePostLikedBy = (postId, enabled) => {
  return useQuery({
    queryKey: ["post-likes", postId],
    queryFn: () => likeServices.getPostLikes(postId),
    enabled,
    staleTime: LIKE_STALE_TIME_MS,
  });
};

export const useCommentLikedBy = (commentId, enabled) => {
  return useQuery({
    queryKey: ["comment-likes", commentId],
    queryFn: () => commentServices.getCommentLikes(commentId),
    enabled,
    staleTime: LIKE_STALE_TIME_MS,
  });
};