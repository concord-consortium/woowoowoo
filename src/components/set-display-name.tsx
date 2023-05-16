import React from "react"
import { useEffect } from "react"
import { useRef } from "react"
import { ComponentProps } from "./app"

export const SetDisplayName = ({state: {displayName}, setState}: ComponentProps) => {
  const displayNameRef = useRef<HTMLInputElement|null>(null)

  useEffect(() => {
    displayNameRef.current?.focus()
  }, [displayNameRef])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newDisplayName = (displayNameRef.current?.value || "").trim()
    if (newDisplayName.length > 0) {
      setState(prev => ({...prev, displayName: newDisplayName, view: "sensor-view"}))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="min-h-screen bg-gray-100 flex flex-col justify-center sm:py-12">
      <div className="p-10 xs:p-0 mx-auto md:w-full md:max-w-md">
        <h1 className="font-bold text-center text-2xl mb-5">WOOWOOWOO</h1>
        <div className="bg-white shadow w-full rounded-lg divide-y divide-gray-200">
          <div className="px-5 py-7">
            <label className="font-semibold text-sm text-gray-600 pb-1 block">Display Name</label>
            <input type="text" className="border rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full" value={displayName} ref={displayNameRef} />
            <button type="button" className="transition duration-200 bg-blue-500 hover:bg-blue-600 focus:bg-blue-700 focus:shadow-sm focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 text-white w-full py-2.5 rounded-lg text-sm shadow-sm hover:shadow-md font-semibold text-center inline-block">
                <span className="inline-block mr-2">Continue</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 inline-block">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}