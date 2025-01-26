import {
  getProfileByUsername,
  getUserLikedPosts,
  getUserPosts,
  isFollowing,
} from "@/actions/profile.action";
import ProfilePageClient from "@/components/ProfilePageClient";
import { notFound } from "next/navigation";

export const generateMetadata = async ({
  params,
}: {
  params: { username: string };
}) => {
  const user = await getProfileByUsername(params.username);
  if (!user) return;
  return {
    title: `${user.name ?? user.username}`,
    description: user.bio || `Check out ${user.username}'s profile`,
  };
};

const ProfilePageServer = async ({
  params,
}: {
  params: { username: string };
}) => {
  const user = await getProfileByUsername(params.username);
  if (!user) notFound();

  const [posts, likedPosts, isCurrentUserFollowing] = await Promise.all([
    getUserPosts(user.id),
    getUserLikedPosts(user.id),
    isFollowing(user.id),
  ]);
  return (
    <ProfilePageClient
      user={user}
      posts={posts}
      likedPost={likedPosts}
      isFollowing={isCurrentUserFollowing}
    />
  );
};

export default ProfilePageServer;
