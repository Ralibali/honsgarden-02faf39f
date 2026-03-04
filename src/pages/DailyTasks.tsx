import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Check, RotateCcw, Sun, Moon, Clock, Sparkles } from 'lucide-react';

interface Task {
  id: number;
  text: string;
  time: 'morning' | 'evening' | 'anytime';
  done: boolean;
}

const defaultTasks: Task[] = [
  { id: 1, text: 'Samla ägg', time: 'morning', done: false },
  { id: 2, text: 'Fyll på vatten', time: 'morning', done: false },
  { id: 3, text: 'Kontrollera foder', time: 'morning', done: false },
  { id: 4, text: 'Släpp ut hönsen', time: 'morning', done: false },
  { id: 5, text: 'Samla ägg (eftermiddag)', time: 'anytime', done: false },
  { id: 6, text: 'Stäng luckan', time: 'evening', done: false },
  { id: 7, text: 'Kontrollera att alla är inne', time: 'evening', done: false },
  { id: 8, text: 'Fyll på vatten till natten', time: 'evening', done: false },
];

const timeConfig = {
  morning: { icon: Sun, label: 'Morgon', color: 'text-warning' },
  evening: { icon: Moon, label: 'Kväll', color: 'text-primary' },
  anytime: { icon: Clock, label: 'Under dagen', color: 'text-accent' },
};

export default function DailyTasks() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('daily-tasks');
    const savedDate = localStorage.getItem('daily-tasks-date');
    const today = new Date().toDateString();
    if (saved && savedDate === today) {
      return JSON.parse(saved);
    }
    return defaultTasks;
  });
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    localStorage.setItem('daily-tasks', JSON.stringify(tasks));
    localStorage.setItem('daily-tasks-date', new Date().toDateString());
  }, [tasks]);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const resetAll = () => setTasks(tasks.map(t => ({ ...t, done: false })));

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks([...tasks, { id: Date.now(), text: newTask, time: 'anytime', done: false }]);
    setNewTask('');
  };

  const completedCount = tasks.filter(t => t.done).length;
  const progress = Math.round((completedCount / tasks.length) * 100);

  const grouped = {
    morning: tasks.filter(t => t.time === 'morning'),
    anytime: tasks.filter(t => t.time === 'anytime'),
    evening: tasks.filter(t => t.time === 'evening'),
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif text-foreground">Dagliga uppgifter ✅</h1>
          <p className="text-sm text-muted-foreground mt-1">Din dagliga checklista – återställs varje morgon</p>
        </div>
        <Button variant="outline" className="gap-2 w-full sm:w-auto" onClick={resetAll}>
          <RotateCcw className="h-4 w-4" />
          Återställ alla
        </Button>
      </div>

      {/* Progress */}
      <Card className={`shadow-sm transition-colors ${progress === 100 ? 'bg-success/5 border-success/30' : 'bg-card border-border'}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              {progress === 100 ? '🎉 Alla uppgifter klara!' : `${completedCount} av ${tasks.length} klara`}
            </span>
            <span className="stat-number text-sm text-primary">{progress}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ${progress === 100 ? 'bg-success' : 'bg-primary'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Task groups */}
      {(['morning', 'anytime', 'evening'] as const).map((time) => {
        const config = timeConfig[time];
        const groupTasks = grouped[time];
        if (groupTasks.length === 0) return null;
        return (
          <Card key={time} className="bg-card border-border shadow-sm">
            <CardHeader className="px-4 sm:px-6 pb-2">
              <CardTitle className="font-serif text-base flex items-center gap-2">
                <config.icon className={`h-4 w-4 ${config.color}`} />
                {config.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {groupTasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className="flex items-center gap-3 px-4 sm:px-6 py-3 w-full text-left hover:bg-secondary/50 transition-colors"
                  >
                    <div className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      task.done ? 'bg-success/20 border-success' : 'border-border hover:border-primary'
                    }`}>
                      {task.done && <Check className="h-3 w-3 text-success" />}
                    </div>
                    <span className={`text-xs sm:text-sm ${task.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {task.text}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Add custom task */}
      <div className="flex gap-2">
        <Input
          placeholder="Lägg till egen uppgift..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTask()}
        />
        <Button onClick={addTask} className="shrink-0 gap-1">
          <Plus className="h-4 w-4" />
          Lägg till
        </Button>
      </div>

      {/* Premium teaser */}
      <Card className="bg-primary/5 border-primary/20 shadow-sm">
        <CardContent className="p-4 flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-warning shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">Premium: Automatiska påminnelser</p>
            <p className="text-xs text-muted-foreground">Få push-notiser när det är dags att stänga luckan</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
