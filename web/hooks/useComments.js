"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import * as postServices from "@/services/postServices";
import { FEED_KEY } from "./usePosts";

export const COMMENTS_KEY = ["comments"];

const postCommentCount = (queryClient, postId, delta) => {
  queryClient.setQueryData(FEED_KEY, (old) => {
    if (!old) return old;
    return {
      ...old,
      pages: old.pages.map((page) => ({
        ...page,
        posts: page.posts.map((post) =>
          post.id === postId
            ? { ...post, commentCount: Math.max(0, post.commentCount + delta) }
            : post
        ),
      })),
    };
  });
};

export const useComments = (postId, enabled) => {
  return useQuery({
    queryKey: [...COMMENTS_KEY, postId],
    queryFn: () => postServices.getPostComments(postId),
    enabled,
    staleTime: 30 * 1000,
  });
};

export const useCommentReplies = (commentId, enabled) => {
  return useQuery({
    queryKey: [...COMMENTS_KEY, "replies", commentId],
    queryFn: () => postServices.getCommentReplies(commentId),
    enabled,
    staleTime: 30 * 1000,
  });
};

export const useCreateComment = (postId) => {
  const queryClient = useQueryClient();
  const commentsKey = [...COMMENTS_KEY, postId];

  return useMutation({
    mutationFn: (payload) => postServices.addComment(postId, payload),

    onSuccess: (newComment) => {
      if (!newComment.parentCommentId) {
        postCommentCount(queryClient, postId, 1);
        queryClient.setQueryData(commentsKey, (old = []) => {
          return [...old, { ...newComment, replies: [] }];
        });
      } else {
        // A reply was created — invalidate the replies query so it refetches.
        queryClient.invalidateQueries({
          queryKey: [...COMMENTS_KEY, "replies", newComment.parentCommentId],
        });
      }
      queryClient.invalidateQueries({ queryKey: commentsKey });
    },

    onError: () => {
      toast.error("Failed to post comment. Please try again.");
    },
  });
};