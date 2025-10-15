import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IClient } from "@/models/Client";

interface UpdateClientInput {
    id: string;
    name?: string;
    email?: string;
    address?: string;
}

export const useUpdateClient = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationKey: ["updateClient"],
        mutationFn: async (data: UpdateClientInput) => {
            const res = await fetch(`/api/clients/${data.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Nepodarilo sa upraviť klienta");
            }

            return res.json() as Promise<IClient>;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["clients"]
            })
        }
    });

    return mutation;
};