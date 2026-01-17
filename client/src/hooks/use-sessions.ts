import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertGameSession } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useCreateSession() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertGameSession) => {
      const res = await fetch(api.sessions.create.path, {
        method: api.sessions.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Failed to record session");
      }

      return api.sessions.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      // In a real app with a leaderboard, we'd invalidate queries here
      // queryClient.invalidateQueries({ queryKey: [api.sessions.list.path] });
    },
    onError: (error) => {
      console.error("Session recording failed:", error);
      // Silent fail for the user is better in a game than an intrusive toast
    },
  });
}
