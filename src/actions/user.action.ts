"use server";

import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export const syncUser = async () => {
  try {
    const { userId } = await auth(); // Get the user ID from the session
    const user = await currentUser(); // Get the user object from the session
    if (!userId || !user) return; // If no user ID or user object, return

    const existingUser = await prisma.user.findUnique({
      where: {
        clerckId: userId,
      },
    }); // Check if the user already exists in the database

    if (existingUser) return existingUser; // If the user already exists, return the user

    const dbUser = await prisma.user.create({
      data: {
        clerckId: userId,
        name: `${user.firstName || ""} ${user.lastName || ""}`,
        username:
          user.username ?? user.emailAddresses[0].emailAddress.split("@")[0],
        email: user.emailAddresses[0].emailAddress,
        image: user.imageUrl,
      },
    }); // If the user does not exist, create a new user in the database
    return dbUser; // Return the newly created user
  } catch (error) {
    console.log("Error in syncUser", error); // Log the error
  }
};

export const getUserByClerkId = async (clerckId: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        clerckId: clerckId,
      },
      include: {
        following: {
          select: {
            following: true,
          },
        },
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
          },
        },
      },
    }); // Find the user in the database
    return user; // Return the user
  } catch (error) {
    console.log("Error in getUser", error); // Log the error
  }
};

export const getDbUserId = async () => {
  const { userId: clerckId } = await auth(); // Get the user ID from the session
  if (!clerckId) return null;

  const user = await getUserByClerkId(clerckId); // Get the user from the database

  if (!user) throw new Error("User not found");
  return user.id; // Return the user ID
};

export const getRandomUser = async () => {
  try {
    const userId = await getDbUserId(); // Get the user ID
    if (!userId) return []; // If no user ID, return an empty array
    const randomUser = await prisma.user.findMany({
      where: {
        AND: [
          {
            NOT: { id: userId },
          },
          {
            NOT: { followers: { some: { followerId: userId } } },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        _count: {
          select: {
            followers: true,
          },
        },
      },
      take: 3,
    }); // Get 3 random users exclude ourselves & users that we already follow from the database
    return randomUser; // Return the user
  } catch (error) {
    console.log("Error in getRandomUser", error); // Log the error
    return []; // Return an empty array
  }
};

export const toggleFollow = async (targetUserId: string) => {
  try {
    const userId = await getDbUserId();
    // Get the user ID
    if (!userId) return;
    if (userId === targetUserId) {
      throw new Error("You can not follow yourself");
    } // If the user is trying to follow themselves

    const existingFollow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: targetUserId,
        },
      },
    }); // Check if the user is already following the user

    if (existingFollow) {
      await prisma.follows.delete({
        where: {
          followerId_followingId: {
            followerId: userId,
            followingId: targetUserId,
          },
        },
      }); // If the user is already following the user, unfollow the user
    } else {
      await prisma.$transaction([
        prisma.follows.create({
          data: {
            followerId: userId,
            followingId: targetUserId,
          },
        }), // If the user is not following the user, follow the user

        prisma.notification.create({
          data: {
            userId: targetUserId,
            type: "FOLLOW",
            creatorId: userId,
          },
        }),
      ]);
    }
    revalidatePath("/"); // Revalidate the home page
    return { success: true }; // Return success
  } catch (error) {
    console.log("Error in toggleFollow", error); // Log the error
    return { success: false, error: "Error toggling follow" }; // Return an error
  }
};
