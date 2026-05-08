import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { clientsApi } from "../../features/clients/api/clients.api";
import { ClientFilters, ClientForm } from "@/shared/types/client.types";

export const clientKeys = {
  all: ["clients"] as const,
  list: (filters: ClientFilters) => ["clients", "list", filters] as const,
  detail: (id: number) => ["clients", "detail", id] as const,
};

export function useClients(filters: ClientFilters) {
  return useQuery({
    queryKey: clientKeys.list(filters),
    queryFn: () => clientsApi.getAll(filters),
    staleTime: 1000 * 60 * 2,
  });
}

export function useClient(id: number) {
  return useQuery({
    queryKey: clientKeys.detail(id),
    queryFn: () => clientsApi.getOne(id),
    enabled: !!id,
  });
}

export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<ClientForm, "status">) => clientsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: clientKeys.all });
      toast.success("Cliente creado correctamente");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error al crear cliente");
    },
  });
}

export function useUpdateClient(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ClientForm>) => clientsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: clientKeys.all });
      toast.success("Cliente actualizado correctamente");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Error al actualizar cliente",
      );
    },
  });
}

export function useDeleteClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => clientsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: clientKeys.all });
      toast.success("Cliente eliminado");
    },
    onError: () => {
      toast.error("Error al eliminar cliente");
    },
  });
}
