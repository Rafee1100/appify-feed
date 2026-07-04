"use client";

import { useEffect, useMemo, useRef } from "react";
import FeedComposer from "@/components/feed/FeedComposer.jsx";
import FeedPost from "@/components/feed/posts/FeedPost.jsx";
import FeedStoryCarousel from "@/components/feed/stories/FeedStoryCarousel.jsx";
import { useFeed } from "@/hooks/usePosts";
import { useAuth } from "@/hooks/useAuth";

const FeedPage = () => {
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFeed();

  const { user } = useAuth();

  const posts = useMemo(
    () => data?.pages.flatMap((page) => page.posts) ?? [],
    [data]
  );

  const scrollRef = useRef(null);
  const loadMoreRef = useRef(null);

  useEffect(() => {
    if (!loadMoreRef.current) return;
    if (!scrollRef.current) return;
    if (!hasNextPage) return;

    const sentinel = loadMoreRef.current;
    const rootEl = scrollRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (!first?.isIntersecting) return;
        if (isFetchingNextPage) return;
        fetchNextPage();
      },
      {
        root: rootEl,
        rootMargin: "400px",
        threshold: 0,
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
      <div className="_layout_middle_wrap" ref={scrollRef}>
        <div className="_layout_middle_inner">
          <FeedStoryCarousel />
          <FeedComposer />
          {isLoading && (
            <div className="_feed_inner_area _b_radious6 _padd_t24 _padd_b24 _padd_r24 _padd_l24 _mar_b16">
              Loading posts...
            </div>
          )}

          {isError && (
            <div className="_feed_inner_area _b_radious6 _padd_t24 _padd_b24 _padd_r24 _padd_l24 _mar_b16">
              {error instanceof Error ? error.message : "Failed to load posts."}
            </div>
          )}

          {posts.map((post) => (
            <FeedPost
              key={post.id}
              post={post}
              currentUserId={user?.id}
            />
          ))}

          {!isLoading && !isError && hasNextPage && (
            <div
              ref={loadMoreRef}
              className="_feed_inner_area _b_radious6 _padd_t24 _padd_b24 _padd_r24 _padd_l24 _mar_b16"
            >
              {isFetchingNextPage ? "Loading more..." : "Scroll to load more"}
            </div>
          )}

          {!isLoading && !isError && posts.length === 0 && (
            <div className="_feed_inner_area _b_radious6 _padd_t24 _padd_b24 _padd_r24 _padd_l24 _mar_b16">
              No posts found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedPage;