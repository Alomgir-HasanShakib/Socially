"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const getProfileByUsername = async (username: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        username,
      },
      select: {
        id: true,
        name: true,
        username: true,
        bio: true,
        image: true,
        location: true,
        website: true,
        createdAt: true,
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
          },
        },
      },
    });
    if (!user) {
      return null;
    }
    return user;
  } catch (error) {
    throw new Error("Failed to fetch profile", error);
  }
};

export const getUserPosts = async (userId: string) => {
  try {
    const posts = await prisma.post.findMany({
      where: {
        authorId: userId,
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
            comments: true,
            likes: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return posts;
  } catch (error) {
    throw new Error("Failed to fetch posts");
  }
};

export const getUserLikedPosts = async (userId: string) => {
  try {
    const likedPosts = await prisma.post.findMany({
      where: {
        likes: {
          some: {
            userId,
          },
        },
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
            comments: true,
            likes: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return likedPosts;
  } catch (error) {
    throw new Error("Failed to fetch user liked post");
  }
};

export const updateProfile = async (formData: FormData) => {
  try {
    const { userId: clerckId } = await auth();
    if (!clerckId) throw new Error("Unauthorized");
    const name = formData.get("name") as string;
    const bio = formData.get("bio") as string;
    const location = formData.get("location") as string;
    const website = formData.get("website") as string;

    const user = await prisma.user.update({
      where: {
        clerckId,
      },
      data: {
        name,
        bio,
        location,
        website,
      },
    });
    revalidatePath(`/profile`);
    return user;
  } catch (error) {
    throw new Error("Failed to update profile");
  }
};

export const isFollowing = async (userId: string) => {
  const { userId: currentUserId } = await auth();
  if (!currentUserId) return false;

  try {
    const follow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: userId,
        },
      },
    });
    return !!follow;
  } catch (error) {
    throw new Error("Failed to check follow status");
    return false;
  }
};
