import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function buildMonthlyBalanceSeries(transactions) {
  if (!transactions?.length) {
    return { labels: [], balances: [] };
  }

  const byMonth = {};
  transactions.forEach((tx) => {
    const key = tx.date?.slice(0, 7);
    if (!key) return;
    if (!byMonth[key]) {
      byMonth[key] = { income: 0, expense: 0 };
    }
    if (tx.type === 'income') {
      byMonth[key].income += Number(tx.amount) || 0;
    } else {
      byMonth[key].expense += Number(tx.amount) || 0;
    }
  });

  const months = Object.keys(byMonth).sort();
  let running = 0;
  const labels = [];
  const balances = [];

  months.forEach((m) => {
    const { income, expense } = byMonth[m];
    running += income - expense;
    const label = new Date(`${m}-01T12:00:00`).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
    labels.push(label);
    balances.push(Number(running.toFixed(2)));
  });

  return { labels, balances };
}

const BalanceTrendChart = ({ transactions }) => {
  const { labels, balances } = useMemo(
    () => buildMonthlyBalanceSeries(transactions),
    [transactions]
  );

  const data = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: 'Balance',
          data: balances,
          borderColor: 'rgb(2, 132, 199)',
          backgroundColor: 'rgba(2, 132, 199, 0.1)',
          fill: true,
          tension: 0.25,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    }),
    [labels, balances]
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const v = ctx.parsed?.y;
              return `Balance: $${typeof v === 'number' ? v.toLocaleString() : v}`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
        },
        y: {
          ticks: {
            callback: (value) => `$${value}`,
          },
        },
      },
    }),
    []
  );

  if (!labels.length) {
    return (
      <div className="card h-80">
        <h3 className="text-lg font-medium mb-4">Balance trend</h3>
        <p className="text-sm text-gray-500">Add transactions to see balance over time.</p>
      </div>
    );
  }

  return (
    <div className="card h-80">
      <h3 className="text-lg font-medium mb-4">Balance trend</h3>
      <p className="text-xs text-gray-500 mb-2">End-of-month running balance</p>
      <div className="h-56">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default BalanceTrendChart;
