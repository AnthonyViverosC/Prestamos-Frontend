import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import {
  AdminResetPasswordPayload,
  UpdateUserPayload,
  UserFilters,
  adminUsersApi,
} from "../api/users.api";

const KEY = ["admin", "users"] as const;

export function useAdminUsers(filters: UserFilters) {
  return useQuery({
    queryKey: [...KEY, filters],
    queryFn: () => adminUsersApi.list(filters),
    placeholderData: keepPreviousData,
  });
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserPayload }) =>
      adminUsersApi.update(id, data),
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: KEY });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        "No fue posible actualizar el usuario.";
      toast.error(message);
    },
  });
}

export function useDeleteAdminUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => adminUsersApi.destroy(id),
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: KEY });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "No fue posible eliminar el usuario.";
      toast.error(message);
    },
  });
}

export function useResetUserPassword() {
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: AdminResetPasswordPayload;
    }) => adminUsersApi.resetPassword(id, data),
    onSuccess: (response) => {
      toast.success(response.message);
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        "No fue posible cambiar la contraseña.";
      toast.error(message);
    },
  });
}
