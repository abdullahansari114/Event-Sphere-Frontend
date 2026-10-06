import { useState } from 'react'
import Input from '../ui/Input'
import Button from '../ui/Button'

export default function GridSettings({ rows, cols, onGenerate, loading }) {
  const [r, setR] = useState(rows || 5)
  const [c, setC] = useState(cols || 10)

  return (
    <div className="card flex flex-wrap items-end gap-3 p-4">
      <Input label="Rows" type="number" min={1} max={50} value={r} onChange={(e) => setR(e.target.value)} className="w-24" />
      <Input label="Columns" type="number" min={1} max={50} value={c} onChange={(e) => setC(e.target.value)} className="w-24" />
      <Button onClick={() => onGenerate(Number(r), Number(c))} disabled={loading}>
        {loading ? 'Generating...' : rows ? 'Update Grid' : 'Generate Grid'}
      </Button>
      <p className="text-xs text-ink-400 w-full mt-1">
        Total booths: {(Number(r) || 0) * (Number(c) || 0)}. Shrinking the grid will require releasing reserved/occupied booths first.
      </p>
    </div>
  )
}