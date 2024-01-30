/*
 * Copyright 2024 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { getRandomColor } from '../utils';
import CircularProgress from '@mui/material/CircularProgress';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);

type AllStatsChartResponse = {
  stats: {
    sum: number;
    team: string;
    template_name: string;
  }[];
};

export function AllStatsBarChart(): React.ReactElement {
  const configApi = useApi(configApiRef);

  const [data, setData] = useState<AllStatsChartResponse | null>(null);

  useEffect(() => {
    fetch(`${configApi.getString('backend.baseUrl')}/api/time-saver/getStats`)
      .then(response => response.json())
      .then(dt => setData(dt))
      .catch();
  }, [configApi]);

  if (!data) {
    return <CircularProgress />;
  }

  const options: ChartOptions<'bar'> = {
    plugins: {
      title: {
        display: true,
        text: 'All Statistics',
      },
    },
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
      },
    },
  };

  const labels = Array.from(new Set(data.stats.map(stat => stat.team)));
  const datasets = Array.from(
    new Set(data.stats.map(stat => stat.template_name)),
  );

  const backgroundColors = datasets.map(() => getRandomColor());

  const dataAll = {
    labels,
    datasets: datasets.map((templateName, index) => ({
      label: `Time Saved - ${templateName}`,
      data: labels.map(team =>
        data.stats
          .filter(
            stat => stat.team === team && stat.template_name === templateName,
          )
          .reduce((sum, stat) => sum + stat.sum, 0),
      ),
      backgroundColor: backgroundColors[index],
    })),
  };

  return <Bar options={options} data={dataAll} />;
}