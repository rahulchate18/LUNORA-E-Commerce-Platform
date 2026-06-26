/**
 * components/product/product-reviews.tsx — Product ratings and reviews list
 *
 * Client Component for rendering product reviews, showing average breakdowns,
 * and submitting a mock review form.
 */
"use client";

import { useState } from "react";
import { Star, CheckCircle, ShieldAlert, AlertCircle } from "lucide-react";
import type { Review } from "@/types";
import { cn } from "@/lib/utils";

interface ProductReviewsProps {
  reviews: Review[];
  rating: number;
}

export function ProductReviews({ reviews: initialReviews, rating }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [showForm, setShowForm] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  // Form states
  const [author, setAuthor] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  // Statistics calculation
  const totalReviews = reviews.length;
  const ratingDistribution = [0, 0, 0, 0, 0]; // 5, 4, 3, 2, 1 star counts
  reviews.forEach((r) => {
    const starIdx = 5 - Math.round(r.rating);
    if (starIdx >= 0 && starIdx < 5) {
      ratingDistribution[starIdx]++;
    }
  });

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!author || !title || !body) return;

    const newReview: Review = {
      id: `r-mock-${Date.now()}`,
      author,
      avatar: author.slice(0, 2).toUpperCase(),
      rating: reviewRating,
      title,
      body,
      date: new Date().toISOString(),
      verified: true,
    };

    setReviews([newReview, ...reviews]);
    setFormSuccess(true);
    // Reset form states
    setAuthor("");
    setReviewRating(5);
    setTitle("");
    setBody("");
    
    setTimeout(() => {
      setFormSuccess(false);
      setShowForm(false);
    }, 2500);
  };

  return (
    <div id="reviews" className="space-y-8 scroll-mt-24">
      {/* Section Title */}
      <h3 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
        Customer Reviews ({reviews.length})
      </h3>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-1 gap-6 rounded-xl border border-neutral-100 bg-white p-6 md:grid-cols-3 dark:border-neutral-800 dark:bg-neutral-900">
        {/* Main rating score */}
        <div className="flex flex-col items-center justify-center text-center md:border-r md:border-neutral-100 md:pr-6 dark:md:border-neutral-800">
          <span className="text-5xl font-extrabold text-neutral-950 dark:text-white">
            {rating.toFixed(1)}
          </span>
          <div className="mt-2 flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-5 w-5",
                  i < Math.floor(rating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-neutral-200 dark:text-neutral-700"
                )}
              />
            ))}
          </div>
          <span className="mt-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
            Based on {totalReviews} reviews
          </span>
        </div>

        {/* Progress bars */}
        <div className="flex flex-col justify-center space-y-2 md:col-span-2 md:pl-6">
          {ratingDistribution.map((count, index) => {
            const stars = 5 - index;
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            return (
              <div key={stars} className="flex items-center gap-3 text-xs">
                <span className="w-12 font-medium text-neutral-500 dark:text-neutral-400">
                  {stars} Star
                </span>
                <div className="h-2 flex-1 rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <div
                    style={{ width: `${percentage}%` }}
                    className="h-full rounded-full bg-amber-400"
                  />
                </div>
                <span className="w-8 text-right font-semibold text-neutral-700 dark:text-neutral-300">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Write a review header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Have you purchased this product?
        </h4>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-800 shadow-2xs hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            Write a Review
          </button>
        )}
      </div>

      {/* Review Submission Form */}
      {showForm && (
        <form
          onSubmit={handleSubmitReview}
          className="space-y-4 rounded-xl border border-neutral-100 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-900/40"
        >
          <div className="flex flex-col gap-4 sm:flex-row">
            {/* Author */}
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Your Name
              </label>
              <input
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Priya Sharma"
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-950 placeholder-neutral-400 focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:focus:border-white"
              />
            </div>
            {/* Rating Selector */}
            <div className="w-full sm:w-40 space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Rating
              </label>
              <select
                value={reviewRating}
                onChange={(e) => setReviewRating(parseInt(e.target.value))}
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-950 focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:focus:border-white"
              >
                <option value={5}>5 Stars (Excellent)</option>
                <option value={4}>4 Stars (Very Good)</option>
                <option value={3}>3 Stars (Average)</option>
                <option value={2}>2 Stars (Poor)</option>
                <option value={1}>1 Star (Terrible)</option>
              </select>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Review Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Stunning craftsmanship, love it!"
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-950 placeholder-neutral-400 focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:focus:border-white"
            />
          </div>

          {/* Body */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Review Details
            </label>
            <textarea
              required
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Tell others what you think about the leather quality, storage space, color, etc."
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-950 placeholder-neutral-400 focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:focus:border-white"
            />
          </div>

          {formSuccess ? (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400">
              <CheckCircle className="h-4.5 w-4.5" />
              <span>Review submitted successfully! Thank you for your feedback.</span>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded-lg bg-neutral-950 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
              >
                Submit Review
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
            </div>
          )}
        </form>
      )}

      {/* Reviews list */}
      <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
        {reviews.map((rev) => (
          <div key={rev.id} className="py-6 first:pt-0 last:pb-0">
            <div className="flex items-start justify-between gap-4">
              {/* Profile card */}
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-xs font-bold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                  {rev.avatar}
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-neutral-900 dark:text-white">
                    {rev.author}
                  </h5>
                  {rev.verified && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle className="h-3 w-3 fill-emerald-100 text-emerald-600 dark:fill-transparent" />
                      Verified Buyer
                    </span>
                  )}
                </div>
              </div>

              {/* Date */}
              <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
                {new Date(rev.date).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>

            {/* Stars */}
            <div className="mt-3 flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-3.5 w-3.5",
                    i < rev.rating
                      ? "fill-amber-400 text-amber-400"
                      : "text-neutral-200 dark:text-neutral-700"
                  )}
                />
              ))}
            </div>

            {/* Content */}
            <div className="mt-2 space-y-1">
              <h6 className="text-sm font-semibold text-neutral-900 dark:text-white">
                {rev.title}
              </h6>
              <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
                {rev.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
