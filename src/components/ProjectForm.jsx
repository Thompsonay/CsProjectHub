import { useState } from 'react'
import { Field, TextArea } from './FormField.jsx'

export const emptyProjectValues = {
  title: '',
  description: '',
  language: '',
  techStack: '',
  topic: '',
  institution: '',
  year: '',
  repoUrl: '',
  demoUrl: '',
}

// Turns the form's flat string fields into the shape the `projects` table
// expects (e.g. splitting the comma-separated tech stack into an array).
// Shared by Submit (insert) and EditProject (update) so the two stay in sync.
export function toProjectPayload(form) {
  return {
    title: form.title.trim(),
    description: form.description.trim() || null,
    language: form.language.trim() || null,
    tech_stack: form.techStack
      ? form.techStack.split(',').map((t) => t.trim()).filter(Boolean)
      : [],
    topic: form.topic.trim() || null,
    institution: form.institution.trim() || null,
    year: form.year ? Number(form.year) : null,
    repo_url: form.repoUrl.trim() || null,
    demo_url: form.demoUrl.trim() || null,
  }
}

// The create/edit project form itself — same fields either way, just
// different initial values and submit handling supplied by the caller.
export default function ProjectForm({ initialValues, onSubmit, submitting, error, submitLabel }) {
  const [form, setForm] = useState(initialValues)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Title *" name="title" value={form.title} onChange={handleChange} required />
      <TextArea label="Description" name="description" value={form.description} onChange={handleChange} />
      <Field
        label="Language"
        name="language"
        value={form.language}
        onChange={handleChange}
        placeholder="e.g. Python"
      />
      <Field
        label="Tech stack (comma-separated)"
        name="techStack"
        value={form.techStack}
        onChange={handleChange}
        placeholder="React, Node.js, PostgreSQL"
      />
      <Field
        label="Topic"
        name="topic"
        value={form.topic}
        onChange={handleChange}
        placeholder="e.g. Machine Learning"
      />
      <Field
        label="Institution"
        name="institution"
        value={form.institution}
        onChange={handleChange}
        placeholder="e.g. University of Lagos"
      />
      <Field label="Year" name="year" type="number" value={form.year} onChange={handleChange} />
      <Field label="Repository URL" name="repoUrl" type="url" value={form.repoUrl} onChange={handleChange} />
      <Field label="Demo URL" name="demoUrl" type="url" value={form.demoUrl} onChange={handleChange} />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="px-6 py-3 text-sm font-semibold text-on-primary bg-primary rounded-xl hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
      >
        {submitting ? `${submitLabel}…` : submitLabel}
      </button>
    </form>
  )
}
