import { useQuery } from "@tanstack/react-query"

export const useSession = () => {
    return useQuery({
        queryKey: ["session"],
        queryFn: async () => {
            const res = await fetch("/api/auth/get-session");
            if (!res.ok) throw new Error("Auth check failed");
            return res.json();
        },
        retry: false,
    })
}