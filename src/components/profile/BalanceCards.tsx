import { motion } from "framer-motion";
import { Coins, DollarSign, PiggyBank, Receipt, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import React, { useMemo } from "react";
import { Line, LineChart, ResponsiveContainer } from "recharts";

import { NumberCounter } from "@/components/charts/NumberCounter";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface BalanceCardsProps {
  balance: any; // UserBalance
}

type SparkPoint = { i: number; v: number };

type Stat = {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  currencyIcon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
};

function makeSeries(seed: number, base: number): SparkPoint[] {
  const pts: SparkPoint[] = [];
  for (let i = 0; i < 18; i++) {
    const t = i / 4;
    const wave = Math.sin(t + seed) * 0.55 + Math.cos(t * 0.7 + seed * 0.3) * 0.35;
    const jitter = Math.sin((i + 1) * seed * 0.13) * 0.12;
    const v = Math.max(0, base * (0.92 + (wave + jitter) * 0.06));
    pts.push({ i, v });
  }
  return pts;
}

function Sparkline({ data, color }: { data: SparkPoint[]; color: string }) {
  return (
    <div className="h-10 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 6, right: 0, left: 0, bottom: 0 }}>
          <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2.2} dot={false} isAnimationActive animationDuration={650} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function BalanceStatCard({ stat, index }: { stat: Stat; index: number }) {
  const Icon = stat.icon;
  const CurrencyIcon = stat.currencyIcon;

  const seed = useMemo(() => {
    let s = 0;
    for (const ch of stat.title) s += ch.charCodeAt(0);
    return (s % 37) / 7;
  }, [stat.title]);

  const series = useMemo(() => makeSeries(seed, Math.max(1, stat.value || 1)), [seed, stat.value]);

  const trend = useMemo(() => {
    const a = series[2]?.v ?? 1;
    const b = series[series.length - 1]?.v ?? 1;
    const pct = ((b - a) / a) * 100;
    return Math.max(-12, Math.min(12, pct));
  }, [series]);

  const TrendIcon = trend >= 0 ? TrendingUp : TrendingDown;
  const trendColor = trend >= 0 ? "text-green-500" : "text-red-500";

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
      <Card className="rounded-3xl">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={cn("shrink-0 rounded-2xl p-2.5", stat.bg)}>
              <Icon className="h-5 w-5" style={{ color: stat.color }} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground truncate">{stat.title}</p>

              <div className="mt-1 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 min-w-0">
                  <NumberCounter value={stat.value} decimals={2} className="text-base font-extrabold tracking-tight" />
                  <CurrencyIcon className="h-4 w-4" style={{ color: stat.color }} />
                </div>
                <div className={cn("flex items-center gap-1 text-[11px] font-semibold", trendColor)}>
                  <TrendIcon className="h-3.5 w-3.5" />
                  {Math.abs(trend).toFixed(1)}%
                </div>
              </div>

              <div className="mt-2">
                <Sparkline data={series} color={stat.color} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export const BalanceCards = ({ balance }: BalanceCardsProps) => {
  const internalBalance = Number(balance?.internal_balance || 0);
  const externalBalance = Number(balance?.external_balance || 0);
  const totalEarned = Number(balance?.total_earned || 0);
  const totalWithdrawn = Number(balance?.total_withdrawn || 0);

  const stats: Stat[] = useMemo(
    () => [
      {
        title: "Внутренний баланс",
        value: internalBalance,
        icon: Wallet,
        currencyIcon: Coins,
        color: "#3B82F6",
        bg: "bg-blue-500/10",
      },
      {
        title: "Внешний баланс",
        value: externalBalance,
        icon: PiggyBank,
        currencyIcon: Coins,
        color: "#22C55E",
        bg: "bg-green-500/10",
      },
      {
        title: "Всего заработано",
        value: totalEarned,
        icon: TrendingUp,
        currencyIcon: Receipt,
        color: "#F59E0B",
        bg: "bg-amber-500/10",
      },
      {
        title: "Всего выведено",
        value: totalWithdrawn,
        icon: TrendingDown,
        currencyIcon: DollarSign,
        color: "#FB923C",
        bg: "bg-orange-500/10",
      },
    ],
    [externalBalance, internalBalance, totalEarned, totalWithdrawn],
  );

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold px-1">Баланс</h2>
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, index) => (
          <BalanceStatCard key={stat.title} stat={stat} index={index} />
        ))}
      </div>
    </div>
  );
};
