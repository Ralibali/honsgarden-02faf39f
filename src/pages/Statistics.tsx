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
  { name: 'Barnevelder', value: 2, color: 'hsl(38, 92%, 50%)' },
  { name: 'Sussex', value: 3, color: 'hsl(142, 71%, 45%)' },
  { name: 'Leghorn', value: 2, color: 'hsl(217, 91%, 60%)' },
  { name: 'Orpington', value: 3, color: 'hsl(0, 84%, 60%)' },
  { name: 'Marans', value: 1, color: 'hsl(280, 65%, 60%)' },
  { name: 'Araucana', value: 1, color: 'hsl(48, 96%, 53%)' },
];

const tooltipStyle = {
  backgroundColor: 'hsl(217, 33%, 12%)',
  border: '1px solid hsl(217, 33%, 20%)',
  borderRadius: '8px',
  color: 'hsl(210, 40%, 98%)',
  fontSize: 13,
};

export default function Statistics() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-serif text-foreground">Statistik 📊</h1>
        <p className="text-muted-foreground mt-1">Detaljerad analys av din hönsgård</p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Totalt ägg', value: '1 982' },
          { label: 'Snitt/dag', value: '5.8' },
          { label: 'Bästa dag', value: '12' },
          { label: 'Produktivitet', value: '72%' },
        ].map((s) => (
          <Card key={s.label} className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <p className="stat-number text-2xl text-foreground">{s.value}</p>
              <p className="data-label mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly trend */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="font-serif text-lg">Månatlig trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyEggs}>
                  <XAxis dataKey="month" stroke="hsl(215, 20%, 45%)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(215, 20%, 45%)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="eggs" stroke="hsl(38, 92%, 50%)" strokeWidth={2} dot={{ fill: 'hsl(38, 92%, 50%)', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Per hen */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="font-serif text-lg">Produktion per höna (mars)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={henProduction} layout="vertical">
                  <XAxis type="number" stroke="hsl(215, 20%, 45%)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" stroke="hsl(215, 20%, 45%)" fontSize={12} tickLine={false} axisLine={false} width={60} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="eggs" fill="hsl(38, 92%, 50%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Breed pie */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="font-serif text-lg">Rasfördelning</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={breedData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value">
                    {breedData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12, color: 'hsl(215, 20%, 65%)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Toplist */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="font-serif text-lg">🏆 Topplista – Mars</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {henProduction.sort((a, b) => b.eggs - a.eggs).map((hen, i) => (
                <div key={hen.name} className="flex items-center gap-3">
                  <span className="stat-number text-lg w-6 text-center text-muted-foreground">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">{hen.name}</span>
                      <span className="stat-number text-sm text-primary">{hen.eggs} ägg</span>
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
