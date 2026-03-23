import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Edit, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function FuncionarioClients() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});

  const { data: clients, isLoading } = useQuery({ queryKey: ['/api/users/clients'] });

  const updateClient = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest('PATCH', `/api/users/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/clients'] });
      toast({ title: "Cliente atualizado" });
      setEditingId(null);
    },
    onError: () => {
      toast({ title: "Erro", description: "Sem permissão para editar.", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <DashboardLayout title="Gestão de Clientes">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const clientsList = (clients as any[]) || [];

  return (
    <DashboardLayout title="Gestão de Clientes" subtitle="Ver e editar dados dos clientes">
      <Card>
        <CardHeader>
          <CardTitle>Clientes ({clientsList.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium text-muted-foreground">Nome</th>
                  <th className="pb-3 font-medium text-muted-foreground">Email</th>
                  <th className="pb-3 font-medium text-muted-foreground">Documento</th>
                  <th className="pb-3 font-medium text-muted-foreground">Contacto</th>
                  <th className="pb-3 font-medium text-muted-foreground">Estado</th>
                  <th className="pb-3 font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {clientsList.map((client: any) => (
                  <tr key={client.id} className="hover:bg-slate-50" data-testid={`row-client-${client.id}`}>
                    <td className="py-3 font-medium">{client.firstName} {client.lastName}</td>
                    <td className="py-3 text-muted-foreground">{client.email || '—'}</td>
                    <td className="py-3">
                      {editingId === client.id ? (
                        <Input
                          value={editData.documento || ''}
                          onChange={(e) => setEditData((p: any) => ({ ...p, documento: e.target.value }))}
                          className="h-8 w-36"
                          placeholder="BI/Passaporte"
                          data-testid={`input-documento-${client.id}`}
                        />
                      ) : (
                        client.documento || '—'
                      )}
                    </td>
                    <td className="py-3">
                      {editingId === client.id ? (
                        <Input
                          value={editData.contacto || ''}
                          onChange={(e) => setEditData((p: any) => ({ ...p, contacto: e.target.value }))}
                          className="h-8 w-36"
                          placeholder="+258..."
                          data-testid={`input-contacto-${client.id}`}
                        />
                      ) : (
                        client.contacto || '—'
                      )}
                    </td>
                    <td className="py-3">
                      <Badge
                        variant={client.status === 'active' ? 'default' : 'secondary'}
                        className={client.status === 'active' ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}
                      >
                        {client.status === 'active' ? 'Ativo' : 'Pendente'}
                      </Badge>
                    </td>
                    <td className="py-3">
                      {editingId === client.id ? (
                        <div className="flex gap-1">
                          <Button
                            size="icon" variant="outline"
                            className="h-8 w-8 text-green-600"
                            onClick={() => updateClient.mutate({ id: client.id, data: editData })}
                            data-testid={`button-save-${client.id}`}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon" variant="outline"
                            className="h-8 w-8"
                            onClick={() => setEditingId(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="icon" variant="outline"
                          className="h-8 w-8"
                          onClick={() => {
                            setEditingId(client.id);
                            setEditData({ documento: client.documento || '', contacto: client.contacto || '' });
                          }}
                          data-testid={`button-edit-${client.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {clientsList.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">Nenhum cliente encontrado.</td>
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
