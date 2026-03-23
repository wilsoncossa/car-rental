import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Cars from "@/pages/Cars";
import CarDetail from "@/pages/CarDetail";
import Login from "@/pages/Login";
import AccessDenied from "@/pages/AccessDenied";
import PendingApproval from "@/pages/PendingApproval";
import CompleteProfile from "@/pages/CompleteProfile";
import Register from "@/pages/Register";

import AdminOverview from "@/pages/admin/AdminOverview";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminBookings from "@/pages/admin/AdminBookings";
import AdminCars from "@/pages/admin/AdminCars";
import AdminFines from "@/pages/admin/AdminFines";

import FuncionarioPanel from "@/pages/funcionario/FuncionarioPanel";
import FuncionarioClients from "@/pages/funcionario/FuncionarioClients";
import FuncionarioBookings from "@/pages/funcionario/FuncionarioBookings";
import FuncionarioFines from "@/pages/funcionario/FuncionarioFines";

import ClientDashboard from "@/pages/cliente/ClientDashboard";
import ClientProfile from "@/pages/cliente/ClientProfile";
import ClientBookings from "@/pages/cliente/ClientBookings";
import ClientFines from "@/pages/cliente/ClientFines";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/cars" component={Cars} />
      <Route path="/cars/:id" component={CarDetail} />
      <Route path="/acesso-negado" component={AccessDenied} />
      <Route path="/pendente" component={PendingApproval} />
      <Route path="/completar-perfil" component={CompleteProfile} />

      <Route path="/admin">
        <ProtectedRoute roles={["admin"]}>
          <AdminOverview />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/utilizadores">
        <ProtectedRoute roles={["admin"]}>
          <AdminUsers />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/reservas">
        <ProtectedRoute roles={["admin"]}>
          <AdminBookings />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/viaturas">
        <ProtectedRoute roles={["admin"]}>
          <AdminCars />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/multas">
        <ProtectedRoute roles={["admin"]}>
          <AdminFines />
        </ProtectedRoute>
      </Route>

      <Route path="/funcionario">
        <ProtectedRoute roles={["funcionario"]}>
          <FuncionarioPanel />
        </ProtectedRoute>
      </Route>
      <Route path="/funcionario/clientes">
        <ProtectedRoute roles={["funcionario"]}>
          <FuncionarioClients />
        </ProtectedRoute>
      </Route>
      <Route path="/funcionario/reservas">
        <ProtectedRoute roles={["funcionario"]}>
          <FuncionarioBookings />
        </ProtectedRoute>
      </Route>
      <Route path="/funcionario/multas">
        <ProtectedRoute roles={["funcionario"]}>
          <FuncionarioFines />
        </ProtectedRoute>
      </Route>

      <Route path="/dashboard">
        <ProtectedRoute roles={["cliente"]}>
          <ClientDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/perfil">
        <ProtectedRoute roles={["cliente"]}>
          <ClientProfile />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/reservas">
        <ProtectedRoute roles={["cliente"]}>
          <ClientBookings />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/multas">
        <ProtectedRoute roles={["cliente"]}>
          <ClientFines />
        </ProtectedRoute>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
