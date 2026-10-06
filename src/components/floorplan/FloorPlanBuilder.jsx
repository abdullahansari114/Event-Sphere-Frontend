import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Grid3x3, Presentation, DoorOpen, LogOut, Bath, UtensilsCrossed, Info,
} from 'lucide-react'
import FloorPlanToolbar from './FloorPlanToolbar'
import FloorPlanCanvas from './FloorPlanCanvas'
import FloorPlanProperties from './FloorPlanProperties'
import FloorPlanLegend from './FloorPlanLegend'
import HallSettings from './HallSettings'
import CreateBoothModal from './CreateBoothModal'
import Button from '../ui/Button'
import LoadingSpinner from '../ui/LoadingSpinner'
import { useFloorPlan } from '../../hooks/useFloorPlan'
import { eventService } from '../../services/eventService'
import { exhibitorService } from '../../services/exhibitorService'
import { useToast } from '../../context/ToastContext'

const PALETTE = [
  { type: 'stage', label: 'Add Stage', icon: Presentation },
  { type: 'entrance', label: 'Add Entrance', icon: DoorOpen },
  { type: 'exit', label: 'Add Exit', icon: LogOut },
  { type: 'restroom', label: 'Add Restroom', icon: Bath },
  { type: 'food', label: 'Add Food Area', icon: UtensilsCrossed },
  { type: 'info', label: 'Add Information Desk', icon: Info },
]

export default function FloorPlanBuilder() {
  const { toast } = useToast()
  const [events, setEvents] = useState([])
  const [exhibitors, setExhibitors] = useState([])
  const [expoId, setExpoId] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const canvasRef = useRef(null)

  useEffect(() => {
  eventService.getAll()
    .then((evts) => {
      setEvents(evts)
      if (evts.length) setExpoId(evts[0]._id)
    })
    .catch((err) => toast(err.message || 'Failed to load events'))
}, [])

  // The exhibitor list refreshes every time a new event is selected
  // (only that event's approved exhibitors are shown)
  useEffect(() => {
    if (!expoId) return
    exhibitorService.getForEvent(expoId).then(setExhibitors)
  }, [expoId])

  const fp = useFloorPlan(expoId)

  const exhibitorsById = useMemo(() => Object.fromEntries(exhibitors.map((e) => [e._id, e])), [exhibitors])
  const boothNumbers = useMemo(
    () => fp.elements.filter((e) => e.type === 'booth').map((e) => e.boothNumber?.toUpperCase()),
    [fp.elements],
  )

  const searchMatchEl = fp.searchQuery ? fp.searchMatch(fp.searchQuery, exhibitorsById) : null

  useEffect(() => {
    if (searchMatchEl) {
      fp.select(searchMatchEl.id)
      canvasRef.current?.focusOn(searchMatchEl.id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchMatchEl?.id])

  const handleAddBooth = (boothData) => {
    fp.addBooth(boothData)
    toast(`Booth ${boothData.boothNumber} added`)
  }

  const handleUpdateElement = (id, patch) => {
    if (Object.keys(patch).length === 0) {
      toast('Changes saved to layout')
      return
    }
    fp.updateElementProps(id, patch)
  }

  const handleDelete = (id) => {
    const el = fp.elements.find((x) => x.id === id)
    fp.deleteElement(id)
    toast(`${el?.type === 'booth' ? `Booth ${el.boothNumber}` : 'Element'} deleted`)
  }

  const handleSave = async () => {
    try {
      await fp.saveLayout()
      toast('Floor plan layout saved')
    } catch (err) {
      toast(err.message || 'Failed to save layout')
    }
  }

  if (!events.length) {
    return <LoadingSpinner label="Loading expos..." />
  }

  return (
    <div className="space-y-4">
      <FloorPlanToolbar
        events={events.map((e) => ({ id: e._id, title: e.title }))}
        expoId={expoId}
        onExpoChange={setExpoId}
        zoom={fp.zoom}
        onZoomIn={fp.zoomIn}
        onZoomOut={fp.zoomOut}
        onResetView={fp.resetView}
        gridEnabled={fp.gridEnabled}
        onToggleGrid={() => fp.setGridEnabled((v) => !v)}
        snapEnabled={fp.snapEnabled}
        onToggleSnap={() => fp.setSnapEnabled((v) => !v)}
        onUndo={fp.undo}
        onRedo={fp.redo}
        canUndo={fp.canUndo}
        canRedo={fp.canRedo}
        onSave={handleSave}
        saving={fp.saving}
        unsavedChanges={fp.unsavedChanges}
        searchQuery={fp.searchQuery}
        onSearchChange={fp.setSearchQuery}
      />

      {fp.loading ? (
        <LoadingSpinner label="Loading floor plan..." />
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[240px_1fr_300px]">
          <div className="space-y-4">
            <div className="card p-4 space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-400 mb-1">Elements</h3>
              <Button variant="primary" className="w-full justify-start" onClick={() => setCreateOpen(true)}>
                <Grid3x3 className="h-4 w-4" /> Add Booth
              </Button>
              {PALETTE.map((p) => (
                <Button
                  key={p.type}
                  variant="secondary"
                  className="w-full justify-start"
                  onClick={() => { fp.addElement(p.type); toast(`${p.label.replace('Add ', '')} added`) }}
                >
                  <p.icon className="h-4 w-4" /> {p.label}
                </Button>
              ))}
            </div>
            <div className="card p-4">
              <HallSettings hall={fp.hall} onChange={fp.updateHall} />
            </div>
          </div>

          <div className="space-y-4 min-w-0">
            <FloorPlanCanvas
              ref={canvasRef}
              hall={fp.hall}
              elements={fp.elements}
              selectedId={fp.selectedId}
              collisions={fp.collisions}
              exhibitorsById={exhibitorsById}
              zoom={fp.zoom}
              pan={fp.pan}
              setPan={fp.setPan}
              gridEnabled={fp.gridEnabled}
              onSelect={fp.select}
              moveElement={fp.moveElement}
              resizeElement={fp.resizeElement}
              commitElementChange={fp.commitElementChange}
              docRef={fp.docRef}
              highlightId={searchMatchEl?.id}
            />
            <FloorPlanLegend />
          </div>

          <FloorPlanProperties
            element={fp.selectedElement}
            hasCollision={fp.selectedElement ? fp.collisions.has(fp.selectedElement.id) : false}
            exhibitors={exhibitors}
            onUpdate={handleUpdateElement}
            onRotate90={(id) => fp.rotateElement(id, ((fp.selectedElement?.rotation || 0) + 90) % 360)}
            onDelete={handleDelete}
          />
        </div>
      )}

      <CreateBoothModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleAddBooth}
        hall={fp.hall}
        existingNumbers={boothNumbers}
      />
    </div>
  )
}