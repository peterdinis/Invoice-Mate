"use client";

import { FC, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const ProfileDropdown: FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch("/api/auth/get-session");
        if (res.ok) {
          const data = await res.json();
          setEmail(data.user?.email || "");
        }
      } catch (err) {
        console.error("Failed to fetch session", err);
      }
    };

    fetchSession();
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch("/api/auth/sign-out", { method: "POST" });
      router.push("/auth");
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (email: string) => {
    return email.slice(0, 2).toUpperCase();
  };

  if (!email) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{getInitials(email)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <div className="flex items-center gap-2 p-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{getInitials(email)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p className="text-sm font-medium">{email}</p>
          </div>
        </div>
        <DropdownMenuItem>
          <User size={16} className="mr-2" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleLogout}
          className="text-red-600"
          disabled={loading}
        >
          <LogOut size={16} className="mr-2" />
          {loading ? "Logging out..." : "Logout"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;
