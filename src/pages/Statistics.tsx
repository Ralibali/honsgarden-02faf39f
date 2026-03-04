import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const monthlyEggs = [
  { month: 'Sep', eggs: 120 },
  { month: 'Okt', eggs: 145 },
  { month: 'Nov', eggs: 132 },
  { month: 'Dec', eggs: 98 },
  { month: 'Jan', eggs: 85 },
  { month: 'Feb', eggs: 128 },
  { month: 'Mar', eggs: 142 },
];

const henProduction = [
  { name: 'Greta', eggs: 18 },
  { name: 'Astrid', eggs: 22 },
  { name: 'Saga', eggs: 15 },
  { name: 'Freja', eggs: 20 },
  { name: 'Sigrid', eggs: 12 },
  { name: 'Elin', eggs: 19 },
];

const breedData = [
  { name: 'Barnevelder', value: 2, color: 'hsl(30, 50%, 45%)' },
  { name: 'Sussex', value: 3, color: 'hsl(142, 50%, 38%)' },
  { name: 'Leghorn', value: 2, color: 'hsl(38, 80%, 50%)' },
  { name: 'Orpington', value: 3, color: 'hsl(0, 65%, 50%)' },
  { name: 'Marans', value: 1, color: 'hsl(280, 40%, 50%)' },
  { name: 'Araucana', value: 1, color: 'hsl(200, 50%, 50%)' },
];

const tooltipStyle = {
  backgroundColor: 'hsl(40, 25%, 99%)',
  border: '1px solid hsl(35, 15%, 85%)',
  borderRadius: '8px',
  color: 'hsl(30, 10%, 15%)',
  fontSize: 12,
};

const axisColor = 'hsl(30, 8%, 50%)';

export default function Statistics() {
  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif text-foreground">Statistik 📊</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">Detaljerad analys av din hönsgård</p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Totalt ägg', value: '1 982' },
          { label: 'Snitt/dag', value: '5.8' },
          { label: 'Bästa dag', value: '12' },
          { label: 'Produktivitet', value: '72%' },
        ].map((s) => (
          <Card key={s.label} className="bg-card border-border shadow-sm">
            <CardContent className="p-3 sm:p-4 text-center">
              <p className="stat-number text-xl sm:text-2xl text-foreground">{s.value}</p>
              <p className="data-label mt-1 text-[10px] sm:text-xs">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        {/* Monthly trend */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="font-serif text-base sm:text-lg">Månatlig trend</CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <div className="h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyEggs}>
                  <XAxis dataKey="month" stroke={axisColor} fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke={axisColor} fontSize={11} tickLine={false} axisLine={false} width={30} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="eggs" stroke="hsl(142, 40%, 35%)" strokeWidth={2} dot={{ fill: 'hsl(142, 40%, 35%)', r: 3 }} name="Ägg" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Per hen */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="font-serif text-base sm:text-lg">Produktion per höna (mars)</CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <div className="h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={henProduction} layout="vertical">
                  <XAxis type="number" stroke={axisColor} fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" stroke={axisColor} fontSize={10} tickLine={false} axisLine={false} width={50} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="eggs" fill="hsl(142, 40%, 35%)" radius={[0, 4, 4, 0]} name="Ägg" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Breed pie */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="font-serif text-base sm:text-lg">Rasfördelning</CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <div className="h-52 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={breedData} cx="50%" cy="45%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                    {breedData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11, color: axisColor }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Toplist */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="font-serif text-base sm:text-lg">🏆 Topplista – Mars</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="space-y-3">
              {[...henProduction].sort((a, b) => b.eggs - a.eggs).map((hen, i) => (
                <div key={hen.name} className="flex items-center gap-2 sm:gap-3">
                  <span className="stat-number text-base sm:text-lg w-6 text-center text-muted-foreground">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs sm:text-sm font-medium text-foreground">{hen.name}</span>
                      <span className="stat-number text-xs sm:text-sm text-primary">{hen.eggs} ägg</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-1.5">
                      <div
                        className="bg-primary rounded-full h-1.5 transition-all duration-500"
                        style={{ width: `${(hen.eggs / 25) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
