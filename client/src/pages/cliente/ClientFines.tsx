import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function ClientFines() {
  const { data: fines, isLoading } = useQuery({ queryKey: ['/api/fines'] });

  if (isLoading) {
    return (
      <DashboardLayout title="Minhas Multas">
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  const finesList = (fines as any[]) || [];
  const total = finesList.filter((f: any) => f.status === 'pending').reduce((sum: number, f: any) => sum + Number(f.amount), 0);

  return (
    <DashboardLayout title="Minhas Multas" subtitle="Multas pendentes e histórico">
      {total > 0 && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4 flex items-center justify-between">
            <span className="text-sm font-medium text-red-700">Total de multas pendentes:</span>
            <span className="text-lg font-bold text-red-700">{total.toLocaleString()} MZN</span>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader><CardTitle>Multas</CardTitle></CardHeader>
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
