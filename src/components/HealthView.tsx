import React, { useEffect, useMemo, useState } from 'react';

type HealthData = {
  weight: string;
  height: string;
  steps: number;
  water: number;
  sleep: number;
  calories: number;
  goal: string;
  workoutDone: boolean;
  checkInDone: boolean;
  feeling: string;
};

const DEFAULT_DATA: HealthData = {
  weight: '',
  height: '',
  steps: 6240,
  water: 1.8,
  sleep: 7,
  calories: 0,
  goal: '',
  workoutDone: false,
  checkInDone: false,
  feeling: '',
};

export const HealthView: React.FC = () => {
  const [data, setData] = useState<HealthData>(DEFAULT_DATA);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showWorkout, setShowWorkout] = useState(false);
  const [saved, setSaved] = useState(false);
  const [goalDraft, setGoalDraft] = useState('');
  const [editingGoal, setEditingGoal] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('sarthi-health-v1');
      if (stored) {
        setData({ ...DEFAULT_DATA, ...JSON.parse(stored) });
      }
    } catch {
      // Ignore invalid local storage
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sarthi-health-v1', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    if (!editingGoal) setGoalDraft(data.goal);
  }, [data.goal, editingGoal]);

  const update = <K extends keyof HealthData>(key: K, value: HealthData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1200);
  };

  const bmi = useMemo(() => {
    const weight = Number(data.weight);
    const height = Number(data.height);
    if (!weight || !height) return null;

    const value = weight / Math.pow(height / 100, 2);
    return Number.isFinite(value) ? value.toFixed(1) : null;
  }, [data.weight, data.height]);

  const healthScore = useMemo(() => {
    let score = 55;

    score += Math.min(data.steps / 10000, 1) * 15;
    score += Math.min(data.water / 2.5, 1) * 10;
    score += Math.min(data.sleep / 8, 1) * 10;

    if (data.workoutDone) score += 5;
    if (data.checkInDone) score += 5;

    return Math.min(Math.round(score), 100);
  }, [data]);

  const goalOptions = [
    ['Fat Loss', '🔥'],
    ['Muscle Gain', '💪'],
    ['Strength', '⚡'],
    ['Endurance', '🏃'],
  ];

  const metricCard = (
    title: string,
    value: string,
    subtitle: string,
    icon: string,
    onClick?: () => void
  ) => (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl bg-white p-5 text-left shadow-sm border border-slate-100 hover:shadow-md transition"
    >
      <div className="text-2xl mb-3">{icon}</div>
      <div className="text-sm text-slate-500">{title}</div>
      <div className="text-2xl font-bold text-slate-900 mt-1">{value}</div>
      <div className="text-xs text-slate-400 mt-1">{subtitle}</div>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <div className="max-w-5xl mx-auto px-4 py-6">

        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-slate-500 text-sm">Good morning, Mihir 👋</p>
            <h1 className="text-3xl font-bold text-slate-900 mt-1">
              Health & Fitness
            </h1>
            <p className="text-slate-500 mt-2">
              Your complete health, fitness & wellness dashboard.
            </p>
          </div>

          <div className="rounded-2xl bg-blue-50 p-4 text-3xl">
            ❤️
          </div>
        </div>

        {/* Health Score */}
        <section className="rounded-3xl bg-gradient-to-r from-blue-600 to-violet-600 p-6 text-white shadow-lg mb-7">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">✨ Today's Health Score</p>
              <div className="flex items-end gap-2 mt-2">
                <span className="text-6xl font-bold">{healthScore}</span>
                <span className="text-xl text-blue-100 mb-2">/ 100</span>
              </div>
              <p className="mt-2 text-blue-100">
                {healthScore >= 80
                  ? "You're doing well. Keep your momentum going."
                  : "Let's improve your health one step at a time."}
              </p>
            </div>

            <div className="text-5xl bg-white/15 rounded-full p-5">
              🛡️
            </div>
          </div>

          <div className="mt-6 h-3 rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full rounded-full bg-white transition-all duration-500"
              style={{ width: `${healthScore}%` }}
            />
          </div>
        </section>

        {/* Today's Metrics */}
        <section className="mb-7">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-900">
              Today's Metrics
            </h2>
            <span className="text-sm text-slate-400">Today</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {metricCard(
              'Steps',
              data.steps.toLocaleString(),
              'Goal 10,000',
              '👣',
              () =>
                update(
                  'steps',
                  Math.min(data.steps + 500, 10000)
                )
            )}

            {metricCard(
              'Water',
              `${data.water.toFixed(1)} L`,
              'Goal 2.5 L',
              '💧',
              () =>
                update(
                  'water',
                  Math.min(Number((data.water + 0.25).toFixed(2)), 5)
                )
            )}

            {metricCard(
              'Sleep',
              `${data.sleep.toFixed(1)} hrs`,
              'Goal 8 hrs',
              '🌙',
              () =>
                update(
                  'sleep',
                  Math.min(Number((data.sleep + 0.5).toFixed(1)), 12)
                )
            )}

            {metricCard(
              'Calories',
              data.calories.toLocaleString(),
              'Daily calories',
              '🔥',
              () =>
                update(
                  'calories',
                  data.calories + 100
                )
            )}
          </div>

          <p className="text-xs text-slate-400 mt-3">
            Tap a metric card to quickly update today's value.
          </p>
        </section>

        {/* Body & Fitness */}
        <section className="rounded-3xl bg-white p-5 shadow-sm border border-slate-100 mb-7">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Body & Fitness
              </h2>
              <p className="text-sm text-slate-500">
                Your current body profile
              </p>
            </div>
            <span className="text-3xl">⚖️</span>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Weight</p>
              <p className="font-bold text-slate-900 mt-1">
                {data.weight ? `${data.weight} kg` : '-- kg'}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">BMI</p>
              <p className="font-bold text-slate-900 mt-1">
                {bmi ?? '--'}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Body Fat</p>
              <p className="font-bold text-slate-900 mt-1">--%</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm text-slate-600">
              Weight (kg)
              <input
                type="number"
                min="1"
                value={data.weight}
                onChange={(e) => update('weight', e.target.value)}
                placeholder="e.g. 75"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <label className="text-sm text-slate-600">
              Height (cm)
              <input
                type="number"
                min="50"
                value={data.height}
                onChange={(e) => update('height', e.target.value)}
                placeholder="e.g. 175"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
          </div>
        </section>

        {/* Fitness Goals */}
        <section className="mb-7">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Fitness Goals
              </h2>
              <p className="text-slate-500">
                Choose what you want to improve
              </p>
            </div>
            <span className="text-2xl">🎯</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {goalOptions.map(([goal, icon]) => (
              <button
                key={goal}
                type="button"
                onClick={() => setGoalDraft(goal)}
                className={`rounded-2xl p-5 text-left border transition ${
                  data.goal === goal
                    ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-100'
                    : 'bg-white border-slate-100 shadow-sm'
                }`}
              >
                <div className="text-2xl">{icon}</div>
                <div className="font-bold text-slate-900 mt-3">
                  {goal}
                </div>
                <div className="text-sm text-slate-500">
                  {goalDraft === goal && !editingGoal ? 'Selected' : 'Set goal'}
                </div>
              </button>
            ))}
          </div>

    <div className="flex flex-wrap gap-3 mt-4 mb-7">
      {!editingGoal && data.goal && (
        <button
          type="button"
          onClick={() => {
            setGoalDraft(data.goal);
            setEditingGoal(true);
          }}
          className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white"
        >
          ✏️ Edit Goal
        </button>
      )}

      {(editingGoal || (!data.goal && goalDraft)) && (
        <button
          type="button"
          onClick={() => {
            if (!goalDraft) return;
            update("goal", goalDraft);
            setEditingGoal(false);
          }}
          className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white"
        >
          💾 Save Goal
        </button>
      )}

      {editingGoal && (
        <button
          type="button"
          onClick={() => {
            setGoalDraft(data.goal);
            setEditingGoal(false);
          }}
          className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700"
        >
          Cancel
        </button>
      )}
    </div>
        </section>

        {/* Workout */}
        <section className="rounded-3xl bg-white p-5 shadow-sm border border-slate-100 mb-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                🏃 Today's Workout
              </h2>
              <p className="text-slate-500 mt-1">
                {data.workoutDone
                  ? 'Workout completed. Great job!'
                  : 'Your personalized workout is waiting.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowWorkout(true);
                
              }}
              className="h-14 w-14 rounded-full bg-blue-600 text-white text-xl shadow-md"
            >
              {data.workoutDone ? '✓' : '▶'}
            </button>
          </div>
        </section>

        {/* Nutrition + Recovery */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          <button
            type="button"
            onClick={() => alert('Nutrition module — coming in Health V1.1')}
            className="rounded-2xl bg-white p-5 text-left shadow-sm border border-slate-100"
          >
            <div className="text-3xl">🍎</div>
            <h3 className="font-bold text-slate-900 mt-4">Nutrition</h3>
            <p className="text-sm text-slate-500 mt-1">
              Calories & macros
            </p>
          </button>

          <button
            type="button"
            onClick={() => alert('Recovery module — coming in Health V1.1')}
            className="rounded-2xl bg-white p-5 text-left shadow-sm border border-slate-100"
          >
            <div className="text-3xl">🌙</div>
            <h3 className="font-bold text-slate-900 mt-4">Recovery</h3>
            <p className="text-sm text-slate-500 mt-1">
              Sleep & recovery
            </p>
          </button>
        </div>

        {/* Challenges */}
        <section className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 mb-5">
          <div className="flex items-center gap-4">
            <div className="text-3xl">🏆</div>
            <div>
              <h3 className="font-bold text-slate-900">Challenges</h3>
              <p className="text-sm text-slate-500">
                Build consistency and stay accountable.
              </p>
            </div>
          </div>
        </section>

        {/* SARTHI Health Coach */}
        <section className="rounded-3xl bg-blue-50 border border-blue-100 p-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl">
              🧠
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                SARTHI Health Coach ✨
              </h2>
            </div>
          </div>

          <p className="text-slate-600 mt-4 leading-6">
            How are you feeling today? Your answers will help SARTHI
            personalize your workout, recovery and daily health plan.
          </p>

          <button
            type="button"
            onClick={() => setShowCheckIn(true)}
            className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm"
          >
            {data.checkInDone ? 'Check-in Completed ✓' : 'Start Daily Check-in →'}
          </button>
        </section>

        {saved && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 rounded-full bg-slate-900 px-5 py-2 text-sm text-white shadow-lg">
            Saved ✓
          </div>
        )}
      </div>

      {/* Check-in Modal */}
      {showCheckIn && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-900">
              Daily Check-in
            </h2>
            <p className="text-slate-500 mt-2">
              How are you feeling today?
            </p>

            <div className="grid grid-cols-2 gap-3 mt-5">
              {['Excellent', 'Good', 'Okay', 'Low'].map((feeling) => (
                <button
                  key={feeling}
                  type="button"
                  onClick={() => update('feeling', feeling)}
                  className={`rounded-xl border px-4 py-3 ${
                    data.feeling === feeling
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200'
                  }`}
                >
                  {feeling}
                </button>
              ))}
            </div>

            <button
              type="button"
              disabled={!data.feeling}
              onClick={() => {
                update('checkInDone', true);
                setShowCheckIn(false);
              }}
              className="mt-5 w-full rounded-xl bg-blue-600 py-3 font-semibold text-white disabled:opacity-40"
            >
              Complete Check-in
            </button>

            <button
              type="button"
              onClick={() => setShowCheckIn(false)}
              className="mt-2 w-full py-3 text-slate-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Workout Modal */}
      {showWorkout && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="text-4xl">🏃</div>
            <h2 className="text-2xl font-bold mt-3">Workout Started!</h2>
            <p className="text-slate-500 mt-2">
              Complete today's personalized workout and mark it done.
            </p>

            <button
              type="button"
              onClick={() => {
  update('workoutDone', true);
  setShowWorkout(false);
}}
              className="mt-5 w-full rounded-xl bg-blue-600 py-3 font-semibold text-white"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthView;
