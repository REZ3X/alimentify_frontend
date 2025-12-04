'use client';

import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export function CaloriesTrendChart({ dailyData, target }) {
    const labels = dailyData.map(d => {
        const date = new Date(d.date);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    });

    const data = {
        labels,
        datasets: [
            {
                label: 'Calories Consumed',
                data: dailyData.map(d => d.calories || 0),
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6,
            },
            {
                label: 'Daily Target',
                data: dailyData.map(() => target),
                borderColor: 'rgb(249, 115, 22)',
                backgroundColor: 'transparent',
                borderDash: [5, 5],
                pointRadius: 0,
                pointHoverRadius: 0,
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Calories Trend',
                font: {
                    size: 16,
                    weight: 'bold'
                }
            },
            tooltip: {
                mode: 'index',
                intersect: false,
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function (value) {
                        return value + ' cal';
                    }
                }
            }
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        }
    };

    return (
        <div className="h-[300px]">
            <Line data={data} options={options} />
        </div>
    );
}

export function MacrosDistributionChart({ averages, targets }) {
    const data = {
        labels: ['Protein', 'Carbs', 'Fat'],
        datasets: [
            {
                label: 'Consumed (g)',
                data: [
                    averages.protein_g || 0,
                    averages.carbs_g || 0,
                    averages.fat_g || 0
                ],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(251, 191, 36, 0.8)',
                ],
                borderColor: [
                    'rgb(59, 130, 246)',
                    'rgb(34, 197, 94)',
                    'rgb(251, 191, 36)',
                ],
                borderWidth: 2,
            },
            {
                label: 'Target (g)',
                data: [
                    targets.protein_g || 0,
                    targets.carbs_g || 0,
                    targets.fat_g || 0
                ],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.3)',
                    'rgba(34, 197, 94, 0.3)',
                    'rgba(251, 191, 36, 0.3)',
                ],
                borderColor: [
                    'rgb(59, 130, 246)',
                    'rgb(34, 197, 94)',
                    'rgb(251, 191, 36)',
                ],
                borderWidth: 2,
                borderDash: [5, 5],
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Average Macros Distribution',
                font: {
                    size: 16,
                    weight: 'bold'
                }
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}g`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function (value) {
                        return value + 'g';
                    }
                }
            }
        }
    };

    return (
        <div className="h-[300px]">
            <Bar data={data} options={options} />
        </div>
    );
}

export function GoalProgressChart({ goalProgress }) {
    if (!goalProgress || !goalProgress.weight_goal) {
        return (
            <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
                Complete your health survey to see goal progress
            </div>
        );
    }

    const { weight_goal, current_weight, target_weight, estimated_progress } = goalProgress;

    const totalChange = Math.abs(target_weight - weight_goal.starting_weight);
    const currentChange = Math.abs(weight_goal.starting_weight - current_weight);
    const progressPercentage = totalChange > 0 ? (currentChange / totalChange) * 100 : 0;

    const data = {
        labels: ['Achieved', 'Remaining'],
        datasets: [{
            data: [
                Math.min(progressPercentage, 100),
                Math.max(100 - progressPercentage, 0)
            ],
            backgroundColor: [
                'rgba(34, 197, 94, 0.8)',
                'rgba(229, 231, 235, 0.8)',
            ],
            borderColor: [
                'rgb(34, 197, 94)',
                'rgb(229, 231, 235)',
            ],
            borderWidth: 2,
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
            },
            title: {
                display: true,
                text: 'Weight Goal Progress',
                font: {
                    size: 16,
                    weight: 'bold'
                }
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        return `${context.label}: ${context.parsed.toFixed(1)}%`;
                    }
                }
            }
        }
    };

    return (
        <div>
            <div className="h-[300px]">
                <Doughnut data={data} options={options} />
            </div>
            <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-600">Starting Weight:</span>
                    <span className="font-semibold">{weight_goal.starting_weight.toFixed(1)} kg</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Current Weight:</span>
                    <span className="font-semibold">{current_weight.toFixed(1)} kg</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Target Weight:</span>
                    <span className="font-semibold">{target_weight.toFixed(1)} kg</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Goal:</span>
                    <span className="font-semibold capitalize">{weight_goal.goal_type}</span>
                </div>
                {estimated_progress && (
                    <>
                        <div className="border-t border-gray-200 pt-2 mt-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Avg Weekly Change:</span>
                                <span className={`font-semibold ${estimated_progress.weekly_rate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {estimated_progress.weekly_rate > 0 ? '+' : ''}{estimated_progress.weekly_rate.toFixed(2)} kg/week
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Estimated Time to Goal:</span>
                                <span className="font-semibold text-blue-600">
                                    {estimated_progress.weeks_to_goal > 0
                                        ? `${estimated_progress.weeks_to_goal} weeks`
                                        : 'Goal achieved!'}
                                </span>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export function ComplianceChart({ goalProgress }) {
    if (!goalProgress) {
        return null;
    }

    const data = {
        labels: ['Calories', 'Protein', 'Carbs', 'Fat'],
        datasets: [{
            label: 'Compliance %',
            data: [
                goalProgress.calories_compliance_percent || 0,
                goalProgress.protein_compliance_percent || 0,
                goalProgress.carbs_compliance_percent || 0,
                goalProgress.fat_compliance_percent || 0,
            ],
            backgroundColor: [
                'rgba(249, 115, 22, 0.8)',
                'rgba(59, 130, 246, 0.8)',
                'rgba(34, 197, 94, 0.8)',
                'rgba(251, 191, 36, 0.8)',
            ],
            borderColor: [
                'rgb(249, 115, 22)',
                'rgb(59, 130, 246)',
                'rgb(34, 197, 94)',
                'rgb(251, 191, 36)',
            ],
            borderWidth: 2,
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: 'Target Compliance',
                font: {
                    size: 16,
                    weight: 'bold'
                }
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        return `${context.label}: ${context.parsed.y.toFixed(1)}%`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                ticks: {
                    callback: function (value) {
                        return value + '%';
                    }
                }
            }
        }
    };

    return (
        <div className="h-[300px]">
            <Bar data={data} options={options} />
        </div>
    );
}
