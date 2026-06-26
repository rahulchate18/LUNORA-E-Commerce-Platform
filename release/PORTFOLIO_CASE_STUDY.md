# LUNORA Premium E-Commerce Case Study

This document details the engineering challenges, architectural solutions, and outcomes of the **LUNORA** platform.

## 1. Challenge: High-Concurrency Double-Spending
Under rapid checkout spikes (e.g. limited-edition flash sales), traditional fetch-then-update inventory logic leads to double-selling.

## 2. Solution: Atomic Stock Decrements
Refactored the Mongoose order flow to use atomic `findOneAndUpdate` queries filtering on `{ stock: { $gte: quantity } }` and decrementing via `{ $inc: { stock: -quantity } }`. Under high concurrent parallel checkouts, database lock collisions are retried with jittered backoff, ensuring stock never drops below zero.

## 3. Challenge: Media Assets Bloat
Saving binaries locally causes database performance drops and disk bloat.

## 4. Solution: direct streaming CDN
Configured Multer in-memory storage buffers streaming straight to Cloudinary CDN API upload streams. virtual schema mapping handles multi-size delivery URL caching, optimizing first paint load metrics (FCP).
