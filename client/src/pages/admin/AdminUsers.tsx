import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Check, X, Trash2, UserCheck, UserX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function AdminUsers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: allUsers, isLoading } = useQuery({
    queryKey: ['/api/users'],
  });

  const updateUser = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest('PATCH', `/api/users/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({ title: "Utilizador atualizado", description: "As alterações foram salvas." });
    },
    onError: () => {
      toast({ title: "Erro", description: "Não foi possível atualizar o utilizador.", variant: "destructive" });
    },
  });

  const deleteUser = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({ title: "Utilizador removido", description: "O utilizador foi eliminado." });
    },
    onError: () => {
      toast({ title: "Erro", description: "Não foi possível eliminar o utilizador.", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <DashboardLayout title="Gestão de Utilizadores">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const users = allUsers as any[] || [];

  return (
    <DashboardLayout title="Gestão de Utilizadores" subtitle="Gerir todos os utilizadores do sistema">
      <Card>
        <CardHeader>
          <CardTitle>Todos os Utilizadores ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium text-muted-foreground">Nome</th>
                  <th className="pb-3 font-medium text-muted-foreground">Email</th>
                  <th className="pb-3 font-medium text-muted-foreground">Função</th>
                  <th className="pb-3 font-medium text-muted-foreground">Estado</th>
                  <th className="pb-3 font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((u: any) => (
                  <tr key={u.id} className="hover:bg-slate-50" data-testid={`row-user-${u.id}`}>
                    <td className="py-3">
                      <div className="font-medium">{u.firstName} {u.lastName}</div>
                      {u.documento && <div className="text-xs text-muted-foreground">Doc: {u.documento}</div>}
                    </td>
                    <td className="py-3 text-muted-foreground">{u.email || '—'}</td>
                    <td className="py-3">
                      <Select
                        value={u.role || 'cliente'}
                        onValueChange={(value) => updateUser.mutate({ id: u.id, data: { role: value } })}
                      >
                        <SelectTrigger className="w-36 h-8" data-testid={`select-role-${u.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="funcionario">Funcionário</SelectItem>
                          <SelectItem value="cliente">Cliente</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-3">
                      <Badge
                        variant={u.status === 'active' ? 'default' : 'secondary'}
                        className={u.status === 'active' ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-amber-100 text-amber-700 hover:bg-amber-100'}
                      >
                        {u.status === 'active' ? 'Ativo' : 'Pendente'}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-1">
                        {u.status === 'pending' ? (
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => updateUser.mutate({ id: u.id, data: { status: 'active' } })}
                            disabled={updateUser.isPending}
                            data-testid={`button-activate-${u.id}`}
                          >
                            <UserCheck className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                            onClick={() => updateUser.mutate({ id: u.id, data: { status: 'pending' } })}
                            disabled={updateUser.isPending}
                            data-testid={`button-deactivate-${u.id}`}
                          >
                            <UserX className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            if (window.confirm('Tem certeza que deseja eliminar este utilizador?')) {
                              deleteUser.mutate(u.id);
                            }
                          }}
                          disabled={deleteUser.isPending}
                          data-testid={`button-delete-${u.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      Nenhum utilizador encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
