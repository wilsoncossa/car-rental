import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function ClientProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    documento: (user as any)?.documento || '',
    contacto: (user as any)?.contacto || '',
  });

  const updateProfile = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('PATCH', '/api/profile', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({ title: "Perfil atualizado", description: "Os seus dados foram salvos." });
    },
    onError: () => {
      toast({ title: "Erro", description: "Não foi possível atualizar o perfil.", variant: "destructive" });
    },
  });

  return (
    <DashboardLayout title="Meu Perfil" subtitle="Atualize os seus dados pessoais">
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Dados Pessoais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Primeiro Nome</Label>
              <Input value={form.firstName} onChange={(e) => setForm(p => ({ ...p, firstName: e.target.value }))} data-testid="input-firstName" />
            </div>
            <div>
              <Label>Apelido</Label>
              <Input value={form.lastName} onChange={(e) => setForm(p => ({ ...p, lastName: e.target.value }))} data-testid="input-lastName" />
            </div>
          </div>
          <div>
            <Label>Documento (BI/Passaporte)</Label>
            <Input value={form.documento} onChange={(e) => setForm(p => ({ ...p, documento: e.target.value }))} placeholder="Número do BI ou Passaporte" data-testid="input-documento" />
          </div>
          <div>
            <Label>Contacto</Label>
            <Input value={form.contacto} onChange={(e) => setForm(p => ({ ...p, contacto: e.target.value }))} placeholder="+258 84 xxx xxxx" data-testid="input-contacto" />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={user?.email || ''} disabled className="bg-slate-50" />
            <p className="text-xs text-muted-foreground mt-1">O email não pode ser alterado.</p>
          </div>
          <Button
            onClick={() => updateProfile.mutate(form)}
            disabled={updateProfile.isPending}
            className="w-full"
            data-testid="button-save-profile"
          >
            {updateProfile.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Guardar Alterações
          </Button>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
