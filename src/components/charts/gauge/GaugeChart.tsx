// src/components/GaugeChart.tsx
import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import HighchartsMore from 'highcharts/highcharts-more';

// Inicializamos highcharts-more que es necesario para el Gauge
if (typeof HighchartsMore === 'function') {
  HighchartsMore(Highcharts);
}

interface GaugeChartProps {
  value: number;
  min?: number;
  max?: number;
}

const GaugeChart: React.FC<GaugeChartProps> = ({ value, min = 0, max = 100 }) => {
  const options: Highcharts.Options = {
    chart: {
      type: 'gauge',
      backgroundColor: 'transparent',
    },
    title: {
      text: 'Velocímetro',
    },
    pane: {
      startAngle: -150,
      endAngle: 150,
      background: [
        {
          backgroundColor: {
            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
            stops: [
              [0, '#FFF'],
              [1, '#DDD'],
            ],
          },
          borderWidth: 0,
          outerRadius: '109%',
        },
      ],
    },
    yAxis: {
      min,
      max,
      title: {
        text: 'km/h',
      },
      plotBands: [
        {
          from: min,
          to: max * 0.6,
          color: '#55BF3B', // verde
        },
        {
          from: max * 0.6,
          to: max * 0.8,
          color: '#DDDF0D', // amarillo
        },
        {
          from: max * 0.8,
          to: max,
          color: '#DF5353', // rojo
        },
      ],
    },
    series: [
      {
        name: 'Velocidad',
        data: [value],
        tooltip: {
          valueSuffix: ' km/h',
        },
        type: 'gauge',
      },
    ],
    credits: {
      enabled: false,
    },
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
};

export default GaugeChart;
