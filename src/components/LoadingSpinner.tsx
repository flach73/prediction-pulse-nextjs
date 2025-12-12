'use client'

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-2 border-slate-700" />
        <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-2 border-transparent border-t-cyan-500 animate-spin" />
      </div>
    </div>
  )
}