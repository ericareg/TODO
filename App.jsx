import { useEffect, useMemo, useState } from "react";
import TodoForm from "./components/TodoForm.jsx";
import TodoList from "./components/TodoList.jsx";
import Filters from "./components/Filters.jsx";

const STORAGE_KEY = "todo_react_basic_v1";

function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Validação mínima
    return parsed
      .filter(
        (t) =>
          t &&
          typeof t.id === "string" &&
          typeof t.text === "string" &&
          typeof t.done === "boolean" &&
          typeof t.createdAt === "number"
      )
      .map((t) => ({
        id: t.id,
        text: t.text,
        done: t.done,
        createdAt: t.createdAt,
      }));
  } catch {
    return [];
  }
}

function saveTodos(todos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function uid() {
  // suficiente para um projetinho local
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export default function App() {
  const [todos, setTodos] = useState(() => loadTodos());
  const [filter, setFilter] = useState("all"); // all | active | done

  useEffect(() => {
    saveTodos(todos);
  }, [todos]);

  const filteredTodos = useMemo(() => {
    if (filter === "active") return todos.filter((t) => !t.done);
    if (filter === "done") return todos.filter((t) => t.done);
    return todos;
  }, [todos, filter]);

  const stats = useMemo(() => {
    const total = todos.length;
    const done = todos.filter((t) => t.done).length;
    const active = total - done;
    return { total, done, active };
  }, [todos]);

  function addTodo(text) {
    const trimmed = text.trim();
    if (!trimmed) return;

    setTodos((prev) => [
      {
        id: uid(),
        text: trimmed,
        done: false,
        createdAt: Date.now(),
      },
      ...prev,
    ]);
  }

  function toggleTodo(id) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  }

  function removeTodo(id) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  function clearDone() {
    setTodos((prev) => prev.filter((t) => !t.done));
  }

  return (
    <div className="page">
      <header className="header">
        <div>
          <h1>To-Do </h1>
          <p className="subtitle">
            Você tem <strong>{stats.active}</strong> pendentes •{" "}
            <strong>{stats.done}</strong> concluídas •{" "}
            <strong>{stats.total}</strong> no total
          </p>
        </div>
      </header>

      <main className="card">
        <TodoForm onAdd={addTodo} />

        <div className="row space-between">
          <Filters value={filter} onChange={setFilter} />
          <button
            className="btn btn-ghost"
            type="button"
            onClick={clearDone}
            disabled={stats.done === 0}
            title="Remove todas as tarefas concluídas"
          >
            Limpar concluídas
          </button>
        </div>

        <TodoList
          todos={filteredTodos}
          onToggle={toggleTodo}
          onRemove={removeTodo}
        />

        {todos.length === 0 && (
          <div className="empty">
            <p>Nenhuma tarefa cadastrada.</p>
            <p className="muted">
              Adicione uma tarefa acima para começar.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
