import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Redirect } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, User, Phone, CreditCard, MapPin, Shield, Upload, ImageIcon, X } from "lucide-react";

const profileSchema = z.object({
  firstName: z.string().min(1, "Nome é obrigatório"),
  lastName: z.string().min(1, "Apelido é obrigatório"),
  dataNascimento: z.string().min(1, "Data de nascimento é obrigatória"),
  nacionalidade: z.string().min(1, "Nacionalidade é obrigatória"),
  documento: z.string().min(1, "Número de BI ou Passaporte é obrigatório"),
  nuit: z.string().optional().default(""),
  contacto: z.string().min(9, "Número de telefone deve ter pelo menos 9 dígitos"),
  cartaNumero: z.string().min(1, "Número da carta de condução é obrigatório"),
  cartaEmissao: z.string().min(1, "Data de emissão é obrigatória"),
  cartaValidade: z.string().min(1, "Data de validade é obrigatória"),
  cartaPaisEmissor: z.string().min(1, "País emissor é obrigatório"),
  cartaFotoUrl: z.string().min(1, "Foto da carta de condução é obrigatória"),
  enderecoCidade: z.string().min(1, "Cidade é obrigatória"),
  enderecoBairro: z.string().min(1, "Bairro é obrigatório"),
  enderecoNumeroCasa: z.string().min(1, "Número da casa é obrigatório"),
  enderecoPais: z.string().min(1, "País é obrigatório"),
  aceitouTermos: z.literal("true", { errorMap: () => ({ message: "Deve aceitar os termos e condições" }) }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function CompleteProfile() {
  const { user, isLoading, isAuthenticated, profileCompleted } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [cartaPreview, setCartaPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      dataNascimento: "",
      nacionalidade: "Moçambicana",
      documento: user?.documento || "",
      nuit: "",
      contacto: user?.contacto || "",
      cartaNumero: "",
      cartaEmissao: "",
      cartaValidade: "",
      cartaPaisEmissor: "Moçambique",
      cartaFotoUrl: "",
      enderecoCidade: "",
      enderecoBairro: "",
      enderecoNumeroCasa: "",
      enderecoPais: "Moçambique",
      aceitouTermos: undefined as any,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      return apiRequest("PATCH", "/api/profile", {
        ...data,
        profileCompleted: "true",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({ title: "Perfil completo", description: "Os seus dados foram guardados com sucesso. A sua conta será analisada pelo administrador." });
    },
    onError: (err: any) => {
      let message = "Falha ao guardar os dados. Tente novamente.";
      if (err?.message) {
        message = err.message.replace(/^\d+:\s*/, "");
        try {
          const parsed = JSON.parse(message);
          if (parsed?.message) {
            message = parsed.message;
          }
        } catch {
          // ignore
        }
      }
      toast({ title: "Erro", description: message, variant: "destructive" });
    },
  });

  const handleCartaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "Ficheiro muito grande", description: "Tamanho máximo: 2MB.", variant: "destructive" });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      toast({ title: "Formato inválido", description: "Use JPG, PNG, WebP ou GIF.", variant: "destructive" });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const token = localStorage.getItem("authToken");

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }
      const { imageUrl } = await res.json();
      form.setValue("cartaFotoUrl", imageUrl, { shouldValidate: true });
      setCartaPreview(imageUrl);
    } catch (err: any) {
      toast({ title: "Erro no upload", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeCartaImage = () => {
    form.setValue("cartaFotoUrl", "", { shouldValidate: true });
    setCartaPreview(null);
  };

  const onSubmit = (values: ProfileFormValues) => {
    mutation.mutate(values);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  if (profileCompleted) {
    return <Redirect to="/pendente" />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-slate-900 mb-2">Completar Registo</h1>
          <p className="text-muted-foreground">
            Preencha os seus dados pessoais para ativar a sua conta. Todos os campos marcados são obrigatórios.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="w-5 h-5 text-primary" />
                  Dados Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="firstName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome *</FormLabel>
                    <FormControl><Input placeholder="Seu primeiro nome" {...field} data-testid="input-first-name" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="lastName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apelido *</FormLabel>
                    <FormControl><Input placeholder="Seu apelido" {...field} data-testid="input-last-name" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="dataNascimento" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Nascimento *</FormLabel>
                    <FormControl><Input type="date" {...field} data-testid="input-birth-date" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="nacionalidade" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nacionalidade *</FormLabel>
                    <FormControl><Input placeholder="Ex: Moçambicana" {...field} data-testid="input-nationality" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="documento" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de BI ou Passaporte *</FormLabel>
                    <FormControl><Input placeholder="Ex: 123456789A" {...field} data-testid="input-document" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="nuit" render={({ field }) => (
                  <FormItem>
                    <FormLabel>NUIT (opcional)</FormLabel>
                    <FormControl><Input placeholder="Número Único de Identificação Tributária" {...field} data-testid="input-nuit" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Phone className="w-5 h-5 text-primary" />
                  Contacto
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="contacto" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Telefone *</FormLabel>
                    <FormControl><Input placeholder="Ex: 84 123 4567" {...field} data-testid="input-phone" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <Input value={user?.email || ""} disabled className="bg-slate-100" data-testid="input-email-display" />
                  <p className="text-xs text-muted-foreground">Email associado à conta Replit</p>
                </FormItem>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Carta de Condução
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="cartaNumero" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número da Carta *</FormLabel>
                      <FormControl><Input placeholder="Número da carta de condução" {...field} data-testid="input-license-number" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="cartaPaisEmissor" render={({ field }) => (
                    <FormItem>
                      <FormLabel>País Emissor *</FormLabel>
                      <FormControl><Input placeholder="Ex: Moçambique" {...field} data-testid="input-license-country" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="cartaEmissao" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Emissão *</FormLabel>
                      <FormControl><Input type="date" {...field} data-testid="input-license-issue" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="cartaValidade" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Validade *</FormLabel>
                      <FormControl><Input type="date" {...field} data-testid="input-license-expiry" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="cartaFotoUrl" render={() => (
                  <FormItem>
                    <FormLabel>Foto da Carta de Condução *</FormLabel>
                    <div className="space-y-3">
                      {cartaPreview ? (
                        <div className="relative rounded-lg overflow-hidden border bg-slate-50">
                          <img src={cartaPreview} alt="Carta de condução" className="w-full h-48 object-cover" data-testid="img-license-preview" />
                          <Button type="button" size="sm" variant="destructive" className="absolute top-2 right-2" onClick={removeCartaImage} data-testid="button-remove-license">
                            <X className="w-3 h-3 mr-1" /> Remover
                          </Button>
                        </div>
                      ) : (
                        <div
                          className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                          onClick={() => fileInputRef.current?.click()}
                          data-testid="dropzone-license"
                        >
                          {uploading ? (
                            <div className="flex flex-col items-center gap-2">
                              <Loader2 className="w-8 h-8 animate-spin text-primary" />
                              <p className="text-sm text-muted-foreground">A enviar imagem...</p>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-2">
                              <ImageIcon className="w-8 h-8 text-muted-foreground" />
                              <p className="text-sm font-medium">Clique para carregar foto da carta</p>
                              <p className="text-xs text-muted-foreground">JPG, PNG, WebP ou GIF (máx. 2MB)</p>
                            </div>
                          )}
                        </div>
                      )}
                      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleCartaUpload} data-testid="input-license-file" />
                      {cartaPreview && (
                        <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading} data-testid="button-change-license">
                          <Upload className="w-3 h-3 mr-1" /> Alterar Foto
                        </Button>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="w-5 h-5 text-primary" />
                  Endereço
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="enderecoPais" render={({ field }) => (
                  <FormItem>
                    <FormLabel>País *</FormLabel>
                    <FormControl><Input placeholder="Ex: Moçambique" {...field} data-testid="input-country" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="enderecoCidade" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade *</FormLabel>
                    <FormControl><Input placeholder="Ex: Maputo" {...field} data-testid="input-city" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="enderecoBairro" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bairro *</FormLabel>
                    <FormControl><Input placeholder="Ex: Sommerschield" {...field} data-testid="input-neighborhood" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="enderecoNumeroCasa" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número da Casa *</FormLabel>
                    <FormControl><Input placeholder="Ex: 123" {...field} data-testid="input-house-number" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="w-5 h-5 text-primary" />
                  Termos e Condições
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-50 border rounded-lg p-4 mb-4 max-h-40 overflow-y-auto text-sm text-muted-foreground">
                  <p className="font-medium text-slate-900 mb-2">Termos e Condições de Uso — BookCars MZ</p>
                  <p className="mb-2">Ao utilizar o serviço BookCars MZ, o utilizador concorda com os seguintes termos:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Os dados pessoais fornecidos serão utilizados exclusivamente para fins de gestão de aluguer de viaturas.</li>
                    <li>O utilizador é responsável por manter os seus dados atualizados.</li>
                    <li>O utilizador compromete-se a devolver a viatura no estado em que a recebeu.</li>
                    <li>Multas de trânsito e danos à viatura durante o período de aluguer são da responsabilidade do utilizador.</li>
                    <li>A BookCars MZ reserva-se o direito de cancelar reservas em caso de violação dos termos.</li>
                    <li>O pagamento deve ser efetuado conforme o método selecionado no ato da reserva.</li>
                    <li>A empresa não se responsabiliza por objetos pessoais deixados nas viaturas.</li>
                  </ul>
                </div>
                <FormField control={form.control} name="aceitouTermos" render={({ field }) => (
                  <FormItem className="flex items-start gap-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value === "true"}
                        onCheckedChange={(checked) => field.onChange(checked ? "true" : "")}
                        data-testid="checkbox-terms"
                      />
                    </FormControl>
                    <div className="space-y-1">
                      <FormLabel className="!mt-0 cursor-pointer">Li e aceito os termos e condições *</FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )} />
              </CardContent>
            </Card>

            <Button
              type="submit"
              className="w-full h-12 text-base"
              disabled={mutation.isPending || uploading}
              data-testid="button-submit-profile"
            >
              {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Submeter Registo
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
