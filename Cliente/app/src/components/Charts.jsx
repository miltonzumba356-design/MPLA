/**
 * Componentes de gráfico usando Chart.js + react-chartjs-2
 * Chart.js não tem dependências problemáticas — funciona perfeitamente com Vite 5
 */
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Filler, Tooltip, Legend,
  Title,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Filler, Tooltip, Legend, Title
)

const BASE_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#fff',
      titleColor: '#1C1C2E',
      bodyColor: '#64748B',
      borderColor: '#E8ECEF',
      borderWidth: 1,
      padding: 10,
      cornerRadius: 8,
      boxPadding: 4,
    },
  },
  scales: {
    x: {
      grid: { display: false },
      border: { display: false },
      ticks: { color: '#94A3B8', font: { size: 10, family: 'Inter' } },
    },
    y: {
      grid: { color: '#F1F5F9', drawBorder: false },
      border: { display: false, dash: [4, 4] },
      ticks: { color: '#94A3B8', font: { size: 10, family: 'Inter' } },
    },
  },
}

// ─── Area / Line chart ────────────────────────────────────────────────────────
export function AreaChart({ data, height = 180, labels, datasets }) {
  const chartData = {
    labels: labels || data?.map(d => d.date || d.label),
    datasets: datasets || [{
      data: data?.map(d => d.value || d.mentions),
      fill: true,
      borderColor: '#CC0000',
      backgroundColor: 'rgba(204,0,0,0.12)',
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 4,
      tension: 0.4,
    }],
  }

  return (
    <div style={{ height }}>
      <Line
        data={chartData}
        options={{
          ...BASE_OPTIONS,
          plugins: { ...BASE_OPTIONS.plugins, legend: { display: false } },
        }}
      />
    </div>
  )
}

// ─── Multi-line sentiment chart ───────────────────────────────────────────────
export function SentimentChart({ data, height = 200 }) {
  const labels = data.map(d => d.date)

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Positivo',
        data: data.map(d => d.positive),
        fill: true,
        borderColor: '#CC0000',
        backgroundColor: 'rgba(204,0,0,0.10)',
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.4,
      },
      {
        label: 'Negativo',
        data: data.map(d => d.negative),
        fill: true,
        borderColor: '#B8960C',
        backgroundColor: 'rgba(184,150,12,0.10)',
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.4,
      },
      {
        label: 'Neutro',
        data: data.map(d => d.neutral),
        fill: false,
        borderColor: '#94A3B8',
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderDash: [4, 4],
        pointRadius: 0,
        tension: 0.4,
      },
    ],
  }

  return (
    <div style={{ height }}>
      <Line data={chartData} options={{ ...BASE_OPTIONS, plugins: { ...BASE_OPTIONS.plugins, legend: { display: false } } }} />
    </div>
  )
}

// ─── Multi-line comparison chart ──────────────────────────────────────────────
export function ComparisonChart({ data, brands, colors, height = 220 }) {
  const labels = data.map(d => d.date)

  const chartData = {
    labels,
    datasets: brands.map((brand, i) => ({
      label: brand,
      data: data.map(d => d[brand]),
      borderColor: colors[i],
      backgroundColor: 'transparent',
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 4,
      tension: 0.4,
    })),
  }

  return (
    <div style={{ height }}>
      <Line
        data={chartData}
        options={{
          ...BASE_OPTIONS,
          plugins: {
            ...BASE_OPTIONS.plugins,
            legend: {
              display: true,
              position: 'bottom',
              labels: { usePointStyle: true, pointStyleWidth: 8, color: '#64748B', font: { size: 11 } },
            },
          },
        }}
      />
    </div>
  )
}

// ─── Bar chart ────────────────────────────────────────────────────────────────
export function VolumeBar({ data, height = 180 }) {
  const chartData = {
    labels: data.map(d => d.date),
    datasets: [{
      label: 'Menções',
      data: data.map(d => d.mentions),
      backgroundColor: data.map((_, i) =>
        i === data.length - 1 ? '#CC0000' : 'rgba(204,0,0,0.25)'
      ),
      borderRadius: 5,
      borderSkipped: false,
    }],
  }

  return (
    <div style={{ height }}>
      <Bar data={chartData} options={BASE_OPTIONS} />
    </div>
  )
}

// ─── Donut chart ──────────────────────────────────────────────────────────────
export function DonutChart({ data, height = 160 }) {
  const chartData = {
    labels: data.map(d => d.name),
    datasets: [{
      data: data.map(d => d.value),
      backgroundColor: data.map(d => d.color),
      borderColor: '#fff',
      borderWidth: 3,
      hoverOffset: 4,
    }],
  }

  return (
    <div style={{ height }}>
      <Doughnut
        data={chartData}
        options={{
          ...BASE_OPTIONS,
          cutout: '60%',
          scales: undefined,
          plugins: {
            ...BASE_OPTIONS.plugins,
            tooltip: {
              ...BASE_OPTIONS.plugins.tooltip,
              callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed}%` },
            },
          },
        }}
      />
    </div>
  )
}

// ─── Share of Voice donut ─────────────────────────────────────────────────────
export function ShareOfVoice({ data, colors, height = 200 }) {
  const chartData = {
    labels: data.map(d => d.name),
    datasets: [{
      data: data.map(d => d.mentions),
      backgroundColor: colors,
      borderColor: '#fff',
      borderWidth: 3,
      hoverOffset: 4,
    }],
  }

  return (
    <div style={{ height }}>
      <Doughnut
        data={chartData}
        options={{
          ...BASE_OPTIONS,
          cutout: '55%',
          scales: undefined,
          plugins: {
            ...BASE_OPTIONS.plugins,
            legend: {
              display: true,
              position: 'right',
              labels: { usePointStyle: true, color: '#64748B', font: { size: 11 } },
            },
          },
        }}
      />
    </div>
  )
}

// ─── Mini sparkline ───────────────────────────────────────────────────────────
export function Sparkline({ values, color = '#CC0000', height = 40 }) {
  const chartData = {
    labels: values.map((_, i) => i),
    datasets: [{
      data: values,
      fill: true,
      borderColor: color,
      backgroundColor: `${color}18`,
      borderWidth: 1.5,
      pointRadius: 0,
      tension: 0.4,
    }],
  }

  return (
    <div style={{ height }}>
      <Line
        data={chartData}
        options={{
          ...BASE_OPTIONS,
          plugins: { legend: { display: false }, tooltip: { enabled: false } },
          scales: {
            x: { display: false },
            y: { display: false },
          },
        }}
      />
    </div>
  )
}
