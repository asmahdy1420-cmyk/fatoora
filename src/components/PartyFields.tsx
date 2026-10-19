import { useI18n } from '../i18n/context'
import type { Party } from '../lib/invoice'
import { TextField } from './Field'

interface Props {
  legend: string
  party: Party
  onChange: (party: Party) => void
}

export function PartyFields({ legend, party, onChange }: Props) {
  const { t } = useI18n()
  const set = (key: keyof Party) => (value: string) => {
    onChange({ ...party, [key]: value })
  }
  return (
    <fieldset className="panel">
      <legend>{legend}</legend>
      <div className="grid-2">
        <TextField label={t('name')} value={party.name} onValueChange={set('name')} />
        <TextField
          label={t('vatNumber')}
          value={party.vatNumber}
          onValueChange={set('vatNumber')}
          dir="ltr"
        />
      </div>
      <TextField
        label={t('address')}
        value={party.address}
        onValueChange={set('address')}
        multiline
      />
    </fieldset>
  )
}
