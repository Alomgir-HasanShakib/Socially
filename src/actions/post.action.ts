"use server";

import prisma from "@/lib/prisma";
import { getDbUserId } from "./user.action";
import { revalidatePath } from "next/cache";

export const createPost = async (content: string, imageUrl: string) => {
  try {
    const userId = await getDbUserId(); // Get the user ID
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
