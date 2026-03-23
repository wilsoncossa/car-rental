import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function FuncionarioFines() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [newFine, setNewFine] = useState({ userId: '', description: '', amount: '' });

  const { data: allFines, isLoading } = useQuery({ queryKey: ['/api/fines'] });
  const { data: clients } = useQuery({ queryKey: ['/api/users/clients'] });

  const createFine = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/fines', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/fines'] });
      toast({ title: "Multa registada" });
      setOpen(false);
      setNewFine({ userId: '', description: '', amount: '' });
    },
  });

  if (isLoading) {
    return (
      <DashboardLayout title="Multas">
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  const finesList = (allFines as any[]) || [];
  const clientsList = (clients as any[]) || [];

  return (
    <DashboardLayout title="Multas" subtitle="Registar e visualizar multas">
      <div className="flex justify-end mb-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-fine"><Plus className="h-4 w-4 mr-2" />Nova Multa</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Registar Multa</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Cliente</Label>
                <Select value={newFine.userId} onValueChange={(v) => setNewFine(p => ({ ...p, userId: v }))}>
                  <SelectTrigger data-testid="select-fine-user"><SelectValue placeholder="Selecionar cliente" /></SelectTrigger>
                  <SelectContent>
                    {clientsList.map((u: any) => (
                      <SelectItem key={u.id} value={u.id}>{u.firstName} {u.lastName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea value={newFine.description} onChange={(e) => setNewFine(p => ({ ...p, description: e.target.value }))} data-testid="input-fine-description" />
              </div>
              <div>
                <Label>Valor (MZN)</Label>
                <Input type="number" value={newFine.amount} onChange={(e) => setNewFine(p => ({ ...p, amount: e.target.value }))} data-testid="input-fine-amount" />
              </div>
              <Button className="w-full" onClick={() => createFine.mutate({ userId: newFine.userId, description: newFine.description, amount: Number(newFine.amount), status: 'pending' })}
                disabled={!newFine.userId || !newFine.description || !newFine.amount || createFine.isPending} data-testid="button-submit-fine">
                Registar Multa
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader><CardTitle>Multas ({finesList.length})</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {finesList.map((fine: any) => (
              <div key={fine.id} className="flex items-center justify-between border-b pb-3 last:border-0" data-testid={`card-fine-${fine.id}`}>
                <div>
                  <p className="font-medium text-sm">{fine.description}</p>
                  <p className="text-xs text-muted-foreground">{fine.createdAt ? format(new Date(fine.createdAt), "dd/MM/yyyy") : '—'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold">{Number(fine.amount).toLocaleString()} MZN</span>
                  <Badge variant={fine.status === 'paid' ? 'default' : 'destructive'}>{fine.status === 'paid' ? 'Paga' : 'Pendente'}</Badge>
                </div>
              </div>
            ))}
            {finesList.length === 0 && <div className="text-center py-8 text-muted-foreground">Nenhuma multa.</div>}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
