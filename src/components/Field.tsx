import type { InputHTMLAttributes, ReactNode } from 'react'
import { normalizeDecimalInput } from '../lib/digits'

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: ReactNode
  value: string
  onValueChange: (value: string) => void
  multiline?: boolean
}

export function TextField({
  label,
  value,
  onValueChange,
  multiline,
  className,
  ...rest
}: TextFieldProps) {
  return (
    <label className={className ? `field ${className}` : 'field'}>
      <span className="field-label">{label}</span>
      {multiline ? (
        <textarea
          rows={2}
          value={value}
          onChange={(e) => {
            onValueChange(e.target.value)
          }}
        />
      ) : (
        <input
          type="text"
          {...rest}
          value={value}
          onChange={(e) => {
            onValueChange(e.target.value)
          }}
        />
      )}
    </label>
  )
}

/** Text input for decimals that accepts Arabic-Indic digits and stores Western ones. */
export function DecimalField(props: Omit<TextFieldProps, 'multiline'>) {
  const { onValueChange, ...rest } = props
  return (
    <TextField
      inputMode="decimal"
      autoComplete="off"
      dir="ltr"
      {...rest}
      onValueChange={(v) => {
        onValueChange(normalizeDecimalInput(v))
      }}
    />
  )
}
