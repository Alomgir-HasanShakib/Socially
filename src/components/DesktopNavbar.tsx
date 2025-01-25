import { currentUser } from "@clerk/nextjs/server";
import React from "react";
import ModeToggle from "./ModeToggle";
import { Button } from "./ui/button";
import Link from "next/link";
import { BellIcon, HomeIcon, UserIcon } from "lucide-react";
import { SignInButton, UserButton } from "@clerk/nextjs";

const DesktopNavbar = async () => {
  const user = await currentUser(); // Fetch the current user
  return (
    <div className="hidden md:flex items-center space-x-4">
      <ModeToggle />
      <Button variant={"ghost"} className="flex items-center gap-2 " asChild>
        <Link href="/">
          <HomeIcon className="size-4" />
          <span className="hidden lg:inline">Home</span>
        </Link>
      </Button>
      {user ? (
        <>
          <Button className="flex items-center gap-2" variant={"ghost"} asChild>
            <Link href="/notifications">
              <BellIcon className="size-4" />
              <span className="hidden lg:inline">Notifications</span>
            </Link>
          </Button>
          <Button className="flex items-center gap-2" variant={"ghost"} asChild>
            <Link
              href={`/profile/${
                user.username ??
                user.emailAddresses[0].emailAddress.split("@")[0]
              }`}
            >
              <UserIcon className="size-4" />
              <span className="hidden lg:inline">Profile</span>
            </Link>
          </Button>
          <UserButton />
        </>
      ) : (
        <>
          <SignInButton mode="modal">
            <Button variant={"default"}>Sign In</Button>
          </SignInButton>
        </>
      )} 
    </div>
  );
};

export default DesktopNavbar;
