"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Loader2Icon } from "lucide-react";
import toast from "react-hot-toast";
import { toggleFollow } from "@/actions/user.action";

const FollowButton = ({ userId }: { userId: string }) => {
    const [isLoading, setLoading] = useState(false);


    const handleFollow = async () => {
        setLoading(true);
        try {
            // Follow the user
            await toggleFollow(userId);
            toast.success("User followed successfully");
        } catch (error) {
            console.log(error);

            toast.error("Failed to follow user");
        } finally {
            setLoading(false);
        }

    }
    return (
        <Button size={"sm"} variant={"secondary"} onClick={handleFollow} disabled={isLoading} className="w-20">
            {isLoading ? <Loader2Icon className="size-4 animate-spin" /> : "Follow"}
        </Button>
    )
}

export default FollowButton