"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "react-toastify";
import * as postService from "@/services/postServices";

export const FEED_KEY = ["feed"];

export const useFeed = () => {
  return useInfiniteQuery({
    queryKey: FEED_KEY,
    queryFn: async ({ pageParam }) => postService.getPosts(pageParam),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    staleTime: 30 * 1000,
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => postService.createPost(payload),
    onSuccess: (newPost) => {
      queryClient.setQueryData(FEED_KEY, (old) => {
        if (!old) return old;
        if (!old.pages.length) return old;
        const updatedFirstPage = {
          ...old.pages[0],
          posts: [newPost, ...old.pages[0].posts],
        };
        return {
          ...old,
          pages: [updatedFirstPage, ...old.pages.slice(1)],
        };
      });
      toast.success("Post created!");
    },
    onError: () => {
      toast.error("Failed to create post. Please try again.");
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId) => postService.deletePost(postId),

    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: FEED_KEY });
      const previous = queryClient.getQueryData(FEED_KEY);
      queryClient.setQueryData(FEED_KEY, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            posts: page.posts.filter((p) => p.id !== postId),
          })),
        };
      });

      return { previous };
    },

    onError: (_err, _postId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(FEED_KEY, context.previous);
      }
      toast.error("Failed to delete post.");
    },

    onSuccess: () => {
      toast.success("Post deleted.");
    },
  });
};