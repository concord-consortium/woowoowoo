import React from "react"
import { ComponentProps } from "./app"

export const SensorView = (props: ComponentProps) => {

  const handleNameClick = () => {
    props.setState(prev => ({...prev, view: "set-display-name"}))
  }

  return (
    <>

      <nav className="bg-blue-500 p-4">
        <div className="container mx-auto flex justify-between">

          <h1 className="text-white text-xl">WooWooWoo</h1>
          <div className="text-white font-bold mt-1" onClick={handleNameClick}>{ props.state.displayName }</div>
        </div>
      </nav>

      <div className="container mx-auto mt-4">
        <div className="flex">
          <div className="w-1/2 bg-white p-4">
            <h2 className="text-gray-800 text-lg font-bold">Data</h2>
            <p className="text-gray-700">Content goes here...</p>
          </div>
          <div className="w-1/2 bg-white p-4">
            <h2 className="text-gray-800 text-lg font-bold">Visualization</h2>
            <p className="text-gray-700">Content goes here...</p>
          </div>
        </div>
      </div>

    </>

  )

}