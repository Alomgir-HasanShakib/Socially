"use server";

import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";

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

export const getUser = async (clerckId: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: clerckId,
      },
      include:{
        _count:{
          select:{
            followers:true,
            following:true,
            posts:true,
          }
        }
      }
    }); // Find the user in the database
    return user; // Return the user
  } catch (error) {
    console.log("Error in getUser", error); // Log the error
  }
}