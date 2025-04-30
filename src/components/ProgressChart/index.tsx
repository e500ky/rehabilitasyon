'use client';

import { ProgressDataPoint } from '@/types/user';
import { CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Title, Tooltip } from 'chart.js';
import React, { useRef } from 'react';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface ProgressChartProps {
  data?: ProgressDataPoint[];
}

const ProgressChart: React.FC<ProgressChartProps> = ({ data = [] }) => {
  const chartContainer = useRef<HTMLDivElement>(null);

  if (data.length === 0) {
    return (
      <div className="no-data-message">
        <p>Henüz ilerleme verisi bulunmuyor.</p>
      </div>
    );
  }
  
  const chartData = {
    labels: data.map(item => item.date),
    datasets: [
      {
        label: 'Başarım Yüzdesi',
        data: data.map(item => item.progress),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        tension: 0.3,
        },
    {
        label: 'ROM (Range Of Motion) (cm)',
        data: data.map(item => item.rom),
        borderColor: 'rgba(235, 53, 53, 0.47)',
        backgroundColor: 'rgba(235, 53, 53, 0.5)',
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'İlerleme'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Tarih'
        }
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
    }
  };

  return (
    <div ref={chartContainer} style={{ height: '100%', width: '100%' }}>
      <Line data={chartData} options={options} height={200}/>
    </div>
  );
};

export default ProgressChart;
