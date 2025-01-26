"use server";

import prisma from "@/lib/prisma";
import { getDbUserId } from "./user.action";
import { revalidatePath } from "next/cache";
import { get } from "http";

export const createPost = async (content: string, imageUrl: string) => {
  try {
    const userId = await getDbUserId(); // Get the user ID
    if (!userId) return;
    const post = await prisma.post.create({
      data: {
        content,
        image: imageUrl,
        authorId: userId,
      },
    }); // Create a new post in the database
    revalidatePath("/"); // Revalidate the home page
    return { success: true, post }; // Return the newly created post
  } catch (error) {
    console.log("Failed to create post:", error); // Log the error
    return { success: false, error: "Failed to create post" }; // Return an error
  }
};

export const getPosts = async () => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });
    return posts;
  } catch (error) {
    console.log("Failed to get posts:", error);
  }
};

export const toggleLike = async (postId: string) => {
  try {
    const userId = await getDbUserId();

    if (!userId) return;

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      select: { authorId: true },
    });
    if (!post) throw new Error("Post not found");

    if (existingLike) {
      await prisma.like.delete({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });
    } else {
      await prisma.$transaction([
        prisma.like.create({
          data: {
            postId,
            userId,
          },
        }),
        ...(post.authorId !== userId ?[
          prisma.notification.create({
            data:{
              type: "LIKE",
              userId: post.authorId,
              creatorId: userId,
              postId
            }
          })
        ]:[])
       
      ])
    }

    revalidatePath("/");
    return {success: true}
  } catch (error) {
    console.log("Failed to toggle like:", error);
    return {success: false, error: "Failed to toggle like"}
  }
};
