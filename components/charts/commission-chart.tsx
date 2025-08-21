"use client";
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import InfoTooltip from '@/components/ui/InfoTooltip';

type CommissionData = {
	total: number;
	potential: number;
	pending: number;
	paid: number;
	requested?: number;
	cancelled?: number;
	confirmed?: number;
};

// Cleaner, more distinct colors
const CHART_COLORS = {
	pending: '#F59E0B', // Amber
	confirmed: '#10B981', // Emerald
	paid: '#3B82F6', // Blue
	requested: '#8B5CF6', // Purple
	cancelled: '#EF4444', // Red
} as const;

const DESCRIPTIONS: Record<string, string> = {
	Pending: 'Your Profit is being processed after the return or cancellation period.',
	Confirmed: "Your Profit is ready to be withdrawn. Tap 'Request Payment'.",
	Paid: 'Your Profit has already been paid to you.',
	Requested: 'Your withdrawal request is being processed.',
	Cancelled: 'Your Profit may be cancelled if conditions aren’t met.',
};

const formatCurrency = (value: number) => {
	if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
	if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
	return `₹${value}`;
};
const formatFullCurrency = (value: number) => `₹${Number(value).toLocaleString('en-IN')}`;

export function CommissionChart({ data, title = 'Commission Breakdown' }: { data: CommissionData; title?: string }) {
	// State for mobile tooltip
	const [mobileTooltip, setMobileTooltip] = React.useState<{ 
		show: boolean; 
		data?: any; 
		x?: number; 
		y?: number; 
	}>({ show: false });

	// Calculate values
	const requested = data.requested || 0;
	const cancelled = data.cancelled || 0;
	const confirmed = data.confirmed || Math.max(data.total - data.pending - data.paid - requested - cancelled, 0);

	// Build segments with unique IDs (single source of truth)
	const segments: Array<{ id: string; label: string; value: number; color: string }> = [
		{ id: 'pending', label: 'Pending', value: data.pending || 0, color: CHART_COLORS.pending },
		{ id: 'confirmed', label: 'Confirmed', value: confirmed, color: CHART_COLORS.confirmed },
		{ id: 'paid', label: 'Paid', value: data.paid || 0, color: CHART_COLORS.paid },
	];
	if (requested > 0) segments.push({ id: 'requested', label: 'Requested', value: requested, color: CHART_COLORS.requested });
	if (cancelled > 0) segments.push({ id: 'cancelled', label: 'Cancelled', value: cancelled, color: CHART_COLORS.cancelled });

	const activeSegments = segments.filter(s => s.value > 0);

	// Handle pie segment click for mobile
	const handlePieClick = (data: any, index: number, event: any) => {
		// Get click coordinates relative to the chart container
		const rect = event.currentTarget.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;
		
		setMobileTooltip({
			show: true,
			data: data,
			x: x,
			y: y
		});
	};

	// Close mobile tooltip when clicking outside
	React.useEffect(() => {
		const handleClickOutside = () => setMobileTooltip({ show: false });
		if (mobileTooltip.show) {
			document.addEventListener('click', handleClickOutside);
			return () => document.removeEventListener('click', handleClickOutside);
		}
	}, [mobileTooltip.show]);

	// Custom tooltip with description text
	const CustomTooltip = ({ active, payload }: any) => {
		// Don't show hover tooltip if mobile tooltip is active
		if (!active || !payload || !payload.length || mobileTooltip.show) return null;
		
		const data = payload[0];
		const label = data.name || data.payload?.label;
		const value = data.value || data.payload?.value;
		const color = data.payload?.color || data.color;
		const description = DESCRIPTIONS[label] || '';
		
		return (
			<div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-50">
				<div className="flex items-center gap-2 mb-1">
					<div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
					<span className="font-semibold text-sm text-gray-900">{label}</span>
				</div>
				<p className="text-lg font-bold text-gray-900">{formatFullCurrency(value)}</p>
				{description && (
					<p className="mt-1 text-[11px] leading-4 text-gray-600 max-w-[220px]">{description}</p>
				)}
			</div>
		);
	};

	// Mobile tooltip component
	const MobileTooltip = ({ data, x, y }: { data: any; x: number; y: number }) => {
		const label = data.label;
		const value = data.value;
		const color = data.color;
		const description = DESCRIPTIONS[label] || '';
		
		return (
			<div 
				className="absolute bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-50 pointer-events-none"
				style={{ 
					left: Math.min(x, 200), // Prevent tooltip from going off-screen
					top: Math.max(y - 80, 10),
					transform: x > 200 ? 'translateX(-100%)' : 'none'
				}}
			>
				<div className="flex items-center gap-2 mb-1">
					<div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
					<span className="font-semibold text-sm text-gray-900">{label}</span>
				</div>
				<p className="text-lg font-bold text-gray-900">{formatFullCurrency(value)}</p>
				{description && (
					<p className="mt-1 text-[11px] leading-4 text-gray-600 max-w-[220px]">{description}</p>
				)}
			</div>
		);
	};

	return (
		<div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
			{/* Header */}
			<div className="mb-4">
				<h2 className="text-base font-semibold text-gray-900">{title}</h2>
				<p className="text-xs text-gray-500 mt-1">Track your commissions with precision</p>
			</div>

			{/* Chart Container */}
			<div className="relative">
				{/* Chart */}
				<div className="h-[220px] flex items-center justify-center relative z-10">
					<ResponsiveContainer width="100%" height="100%">
							<PieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
							<Pie
									data={activeSegments}
								dataKey="value"
									nameKey="label"
								cx="50%"
								cy="50%"
								innerRadius={60}
								outerRadius={90}
								paddingAngle={3}
								startAngle={90}
									endAngle={450}
									label={false}
									labelLine={false}
									onClick={handlePieClick}
							>
									{activeSegments.map((entry) => (
									<Cell
											key={`cell-${entry.id}`}
										fill={entry.color}
											className="hover:opacity-80 transition-opacity cursor-pointer"
											stroke="none"
									/>
								))}
							</Pie>
								<Tooltip 
									content={<CustomTooltip />} 
									cursor={false}
									wrapperStyle={{ zIndex: 1000 }}
								/>
						</PieChart>
					</ResponsiveContainer>
				</div>

				{/* Center Total */}
				<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
					<div className="text-center">
						<p className="text-xs text-gray-500 font-medium">Total</p>
						<p className="text-xl font-bold text-gray-900">{formatCurrency(data.total)}</p>
					</div>
				</div>

				{/* Mobile Tooltip */}
				{mobileTooltip.show && mobileTooltip.data && (
					<MobileTooltip 
						data={mobileTooltip.data} 
						x={mobileTooltip.x || 0} 
						y={mobileTooltip.y || 0} 
					/>
				)}
			</div>

			{/* Legend Grid - Only our custom legend */}
			<div className="mt-6 space-y-2 commission-legend">
				{activeSegments.map(item => (
					<div key={item.id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
						<div className="flex items-center gap-3">
							<div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
							<span className="text-sm font-medium text-gray-700 flex items-center gap-1">
								{item.label}
								{DESCRIPTIONS[item.label] && (
									<InfoTooltip side="top" text={DESCRIPTIONS[item.label]} />
								)}
							</span>
						</div>
						<span className="text-sm font-bold text-gray-900">{formatFullCurrency(item.value)}</span>
					</div>
				))}
			</div>

			{/* Summary Stats */}
			<div className="mt-4 pt-4 border-t border-gray-100">
				<div className="grid grid-cols-2 gap-3">
					<div className="text-center p-2 bg-green-50 rounded-lg">
						<p className="text-xs text-green-600 font-medium">Available for payment</p>
						<p className="text-base font-bold text-green-700">{formatCurrency(confirmed)}</p>
					</div>
					<div className="text-center p-2 bg-amber-50 rounded-lg">
						<p className="text-xs text-amber-600 font-medium">Pending for confirmation</p>
						<p className="text-base font-bold text-amber-700">{formatCurrency(data.pending)}</p>
					</div>
				</div>
			</div>
		</div>
	);
}

