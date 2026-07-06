const inputCls =
  'w-full border border-outline-variant rounded-lg px-4 py-3.5 text-sm bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary placeholder:text-outline transition-all'

export function Field({ label, name, value, onChange, type = 'text', placeholder, required }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-on-surface mb-1.5 ml-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
        {label}
      </span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={inputCls}
      />
    </label>
  )
}

export function TextArea({ label, name, value, onChange, rows = 4 }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-on-surface mb-1.5 ml-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
        {label}
      </span>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        className={`${inputCls} resize-none`}
      />
    </label>
  )
}
