import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCreateCar, useUpdateCar, useDeleteCar } from "@/hooks/use-cars";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Pencil, Trash2, Upload, ImageIcon, X } from "lucide-react";
import type { Car } from "@shared/schema";

const carFormSchema = z.object({
  make: z.string().min(1, "Marca é obrigatória"),
  model: z.string().min(1, "Modelo é obrigatório"),
  year: z.coerce.number().min(2000, "Ano mínimo: 2000").max(2030, "Ano máximo: 2030"),
  licensePlate: z.string().min(1, "Matrícula é obrigatória"),
  type: z.string().min(1, "Tipo é obrigatório"),
  dailyRate: z.coerce.number().min(1, "Taxa diária deve ser maior que 0"),
  pricePerKm: z.coerce.number().min(1, "Preço por KM deve ser maior que 0"),
  imageUrl: z.string().min(1, "Imagem é obrigatória"),
  city: z.string().min(1, "Cidade é obrigatória"),
  description: z.string().optional().default(""),
  featuresText: z.string().optional().default(""),
  isAvailable: z.boolean().default(true),
});

type CarFormValues = z.infer<typeof carFormSchema>;

const defaultValues: CarFormValues = {
  make: "",
  model: "",
  year: new Date().getFullYear(),
  licensePlate: "",
  type: "Sedan",
  dailyRate: 0,
  pricePerKm: 0,
  imageUrl: "",
  city: "Maputo",
  description: "",
  featuresText: "",
  isAvailable: true,
};

const MAX_FILE_SIZE_MB = 2;

export default function AdminCars() {
  const { data: cars, isLoading } = useQuery({ queryKey: ['/api/cars'] });
  const createCar = useCreateCar();
  const updateCar = useUpdateCar();
  const deleteCar = useDeleteCar();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [deletingCar, setDeletingCar] = useState<Car | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<CarFormValues>({
    resolver: zodResolver(carFormSchema),
    defaultValues,
  });

  const openCreate = () => {
    setEditingCar(null);
    setImagePreview(null);
    form.reset(defaultValues);
    setDialogOpen(true);
  };

  const openEdit = (car: Car) => {
    setEditingCar(car);
    setImagePreview(car.imageUrl);
    form.reset({
      make: car.make,
      model: car.model,
      year: car.year,
      licensePlate: car.licensePlate,
      type: car.type,
      dailyRate: Number(car.dailyRate),
      pricePerKm: Number(car.pricePerKm),
      imageUrl: car.imageUrl,
      city: car.city,
      description: car.description || "",
      featuresText: (car.features || []).join(", "),
      isAvailable: car.isAvailable ?? true,
    });
    setDialogOpen(true);
  };

  const openDelete = (car: Car) => {
    setDeletingCar(car);
    setDeleteDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast({
        title: "Imagem muito grande",
        description: `O tamanho máximo é ${MAX_FILE_SIZE_MB}MB. A imagem selecionada tem ${(file.size / (1024 * 1024)).toFixed(1)}MB.`,
        variant: "destructive",
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      toast({
        title: "Formato inválido",
        description: "Use imagens JPG, PNG, WebP ou GIF.",
        variant: "destructive",
      });
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
        throw new Error(err.message || "Falha no upload");
      }

      const { imageUrl } = await res.json();
      form.setValue("imageUrl", imageUrl, { shouldValidate: true });
      setImagePreview(imageUrl);
      toast({ title: "Imagem carregada", description: "Imagem enviada com sucesso." });
    } catch (err: any) {
      toast({ title: "Erro no upload", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = () => {
    form.setValue("imageUrl", "", { shouldValidate: true });
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = (values: CarFormValues) => {
    const features = values.featuresText
      ? values.featuresText.split(",").map((f) => f.trim()).filter(Boolean)
      : [];

    const { featuresText, ...rest } = values;
    const data = { ...rest, features };

    if (editingCar) {
      updateCar.mutate(
        { id: editingCar.id, ...data },
        { onSuccess: () => setDialogOpen(false) }
      );
    } else {
      createCar.mutate(data, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const handleDelete = () => {
    if (deletingCar) {
      deleteCar.mutate(deletingCar.id, {
        onSuccess: () => setDeleteDialogOpen(false),
      });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Gestão de Viaturas">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const allCars = (cars as any[]) || [];

  return (
    <DashboardLayout title="Gestão de Viaturas" subtitle="Adicione, edite ou remova viaturas da frota">
      <div className="flex justify-end mb-6">
        <Button onClick={openCreate} data-testid="button-add-car">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Viatura
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allCars.map((car: any) => (
          <Card key={car.id} className="overflow-hidden" data-testid={`card-car-${car.id}`}>
            <div className="h-40 bg-slate-100 relative">
              <img src={car.imageUrl} alt={`${car.make} ${car.model}`} className="w-full h-full object-cover" />
              <Badge
                variant={car.isAvailable ? "default" : "secondary"}
                className="absolute top-2 right-2"
              >
                {car.isAvailable ? "Disponível" : "Indisponível"}
              </Badge>
            </div>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold">{car.make} {car.model}</h3>
                  <p className="text-sm text-muted-foreground">{car.year} • {car.city}</p>
                </div>
              </div>
              <div className="flex gap-4 text-sm mb-2">
                <span>{Number(car.dailyRate).toLocaleString()} MZN/dia</span>
                <span>{Number(car.pricePerKm).toLocaleString()} MZN/km</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{car.licensePlate} • {car.type}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(car)} data-testid={`button-edit-car-${car.id}`}>
                  <Pencil className="w-3 h-3 mr-1" />
                  Editar
                </Button>
                <Button size="sm" variant="destructive" onClick={() => openDelete(car)} data-testid={`button-delete-car-${car.id}`}>
                  <Trash2 className="w-3 h-3 mr-1" />
                  Remover
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCar ? "Editar Viatura" : "Adicionar Nova Viatura"}</DialogTitle>
            <DialogDescription>
              {editingCar ? "Altere os dados da viatura e guarde." : "Preencha os dados para adicionar uma nova viatura à frota."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="make"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marca</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Toyota" {...field} data-testid="input-car-make" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modelo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Corolla" {...field} data-testid="input-car-model" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ano</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Ex: 2024" {...field} data-testid="input-car-year" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="licensePlate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Matrícula</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: AAA-000-BB" {...field} data-testid="input-car-plate" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-car-type">
                            <SelectValue placeholder="Tipo de viatura" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Sedan">Sedan</SelectItem>
                          <SelectItem value="SUV">SUV</SelectItem>
                          <SelectItem value="Pickup">Pickup</SelectItem>
                          <SelectItem value="Hatchback">Hatchback</SelectItem>
                          <SelectItem value="Van">Van</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-car-city">
                            <SelectValue placeholder="Cidade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Maputo">Maputo</SelectItem>
                          <SelectItem value="Beira">Beira</SelectItem>
                          <SelectItem value="Nampula">Nampula</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dailyRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Taxa Diária (MZN)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Ex: 5000" {...field} data-testid="input-car-daily-rate" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pricePerKm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço por KM (MZN)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Ex: 20" {...field} data-testid="input-car-price-km" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={() => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Imagem da Viatura</FormLabel>
                      <div className="space-y-3">
                        {imagePreview ? (
                          <div className="relative rounded-lg overflow-hidden border bg-slate-50">
                            <img
                              src={imagePreview}
                              alt="Pré-visualização"
                              className="w-full h-48 object-cover"
                              data-testid="img-car-preview"
                            />
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              className="absolute top-2 right-2"
                              onClick={removeImage}
                              data-testid="button-remove-image"
                            >
                              <X className="w-3 h-3 mr-1" />
                              Remover
                            </Button>
                          </div>
                        ) : (
                          <div
                            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                            data-testid="dropzone-car-image"
                          >
                            {uploading ? (
                              <div className="flex flex-col items-center gap-2">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                <p className="text-sm text-muted-foreground">A enviar imagem...</p>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-2">
                                <ImageIcon className="w-8 h-8 text-muted-foreground" />
                                <p className="text-sm font-medium">Clique para carregar uma imagem</p>
                                <p className="text-xs text-muted-foreground">
                                  JPG, PNG, WebP ou GIF (máx. {MAX_FILE_SIZE_MB}MB)
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          className="hidden"
                          onChange={handleImageUpload}
                          data-testid="input-car-image-file"
                        />
                        {imagePreview && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            data-testid="button-change-image"
                          >
                            <Upload className="w-3 h-3 mr-1" />
                            Alterar Imagem
                          </Button>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Breve descrição da viatura..." {...field} data-testid="input-car-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="featuresText"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Características (separadas por vírgula)</FormLabel>
                      <FormControl>
                        <Input placeholder="AC, Bluetooth, 4x4, GPS" {...field} data-testid="input-car-features" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isAvailable"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2 flex items-center gap-3">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-car-available"
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">Disponível para aluguer</FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} data-testid="button-cancel-car">
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createCar.isPending || updateCar.isPending || uploading}
                  data-testid="button-save-car"
                >
                  {(createCar.isPending || updateCar.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingCar ? "Guardar Alterações" : "Adicionar Viatura"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Remoção</DialogTitle>
            <DialogDescription>
              Tem a certeza que deseja remover a viatura{" "}
              <strong>{deletingCar?.make} {deletingCar?.model}</strong> ({deletingCar?.licensePlate})?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} data-testid="button-cancel-delete">
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteCar.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteCar.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
