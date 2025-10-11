"use client";

import { FC } from "react";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Session {
  user: {
    email: string;
  };
}

const fetchSession = async (): Promise<Session> => {
  const res = await fetch("/api/auth/get-session");
  if (!res.ok) {
    throw new Error("Failed to fetch session");
  }
  return res.json();
};

const logoutRequest = async () => {
  const res = await fetch("/api/auth/sign-out", { method: "POST" });
  if (!res.ok) {
    throw new Error("Logout failed");
  }
  return res.json();
};

const ProfileDropdown: FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: fetchSession,
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: logoutRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
      router.push("/");
    },
  });

  const getInitials = (email: string) => {
    return email.slice(0, 2).toUpperCase();
  };

  if (!session?.user?.email) {
    return null;
  }

  const email = session.user.email;

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
          onClick={() => logoutMutation.mutate()}
          className="text-red-600"
          disabled={logoutMutation.isPending}
        >
          <LogOut size={16} className="mr-2" />
          {logoutMutation.isPending ? "Logging out..." : "Logout"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;
