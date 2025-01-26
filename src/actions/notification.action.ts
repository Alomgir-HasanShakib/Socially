"use server";

import prisma from "@/lib/prisma";
import { getDbUserId } from "./user.action";

export const getNotification = async () => {
  try {
    const userId = await getDbUserId();
    if (!userId) return [];
    const notifications = await prisma.notification.findMany({
      where: { userId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        post: {
          select: {
            id: true,
            content: true,
            image: true,
          },
        },
        comment: {
          select: {
            id: true,
            content: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return notifications;
  } catch (error) {
    console.log("Error in getNotification", error);
    throw new Error("Error in getNotification");
  }
};
