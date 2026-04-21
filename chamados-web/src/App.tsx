import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { RequireAuth } from './components/RequireAuth'
import { AgendaDashboard } from './pages/AgendaDashboard'
import { AgendaGantt } from './pages/AgendaGantt'
import { AgendaImport } from './pages/AgendaImport'
import { ChamadosList } from './pages/ChamadosList'
import { DashboardEstrategico } from './pages/DashboardEstrategico'
import { DashboardOperacional } from './pages/DashboardOperacional'
import { DashboardTatico } from './pages/DashboardTatico'
import { Import } from './pages/Import'
import { Assistente } from './pages/Assistente'
import { Login } from './pages/Login'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard/estrategico" replace />} />
        <Route path="/assistente" element={<Assistente />} />
        <Route path="/dashboard/estrategico" element={<DashboardEstrategico />} />
        <Route path="/dashboard/operacional" element={<DashboardOperacional />} />
        <Route path="/dashboard/tatico" element={<DashboardTatico />} />
        <Route path="/importar" element={<Import />} />
        <Route path="/chamados" element={<ChamadosList />} />
        <Route path="/agenda/dashboard" element={<AgendaDashboard />} />
        <Route path="/agenda/gantt" element={<AgendaGantt />} />
        <Route path="/agenda/importar" element={<AgendaImport />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
