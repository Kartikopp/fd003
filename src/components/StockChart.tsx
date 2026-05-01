import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { motion } from 'motion/react';

interface ChartProps {
  data: { time: string; price: number }[];
  color?: string;
}

export default function StockChart({ data, color = "#2563eb" }: ChartProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-48 w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.2}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="time" 
            hide 
          />
          <YAxis 
            domain={['auto', 'auto']} 
            hide 
          />
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="glass p-2 rounded shadow-xl">
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{payload[0].payload.time}</p>
                    <p className="text-sm font-black text-slate-100">${payload[0].value}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke={color} 
            fillOpacity={1} 
            fill="url(#colorPrice)" 
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
