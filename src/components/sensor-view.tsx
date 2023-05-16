
import React, { useEffect, useRef} from "react"
import { useSerial } from "../useSerial"
import {produce} from "immer"
import Sparkline from 'react-sparkline-svg';
import { randomDarkColor } from 'seed-to-color'

import { ComponentProps } from "./app"
import { createClient } from "@supabase/supabase-js"

// create a supabase client that listens to channel "woowoowoo"

const url = "https://ubtydghcxtctomddmcjl.supabase.co"
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVidHlkZ2hjeHRjdG9tZGRtY2psIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODQyNDcwMTUsImV4cCI6MTk5OTgyMzAxNX0.5U8EqTtGyGGyfyn0pW0DCrsTcSJ9vOOnBdVc9kiXRLk"

const supa = createClient(url, key);
const HISTORY_LENGTH = 10

type ChannelStatus = "SUBSCRIBED" | "TIMED_OUT" | "CLOSED" | "CHANNEL_ERROR"

type SensorPayload = {
  num: number
  displayName: string
}

const getColor = (seed: string) => {
  return "#" + randomDarkColor(seed)
}

let startingFreq = 0
let audioCtx = new AudioContext();
let osc = audioCtx.createOscillator();
osc.frequency.value = startingFreq;
osc.start()
osc.connect(audioCtx.destination);


export const SensorView = (props: ComponentProps) => {
  const {state, setState} = props
  const displayName  = state.displayName!;
  const [channelStatus, setChannelStatus] = React.useState<ChannelStatus>("CLOSED");

  const { isStreaming, val, openStream } = useSerial();

  const channelRef = useRef(supa.channel("woowoowoo"))

  useEffect(() => {
    channelRef.current
    .on('broadcast', { event: 'supa' }, (message) => {
      const payload = message.payload as SensorPayload
      savePayload(payload)
    })
    .subscribe((status) => {
      setChannelStatus(status)
    })

    return () => {
      channelRef.current.unsubscribe()
    }
  }, []);

  useEffect(() => {
    sendSensorData(val)
  }, [val]);

  const savePayload = (payload: SensorPayload) => {
    setState(prev => {
      return produce(prev, draft =>{
        draft.history[payload.displayName] = draft.history[payload.displayName] || []
        draft.history[payload.displayName] = draft.history[payload.displayName].slice(-HISTORY_LENGTH)
        draft.history[payload.displayName].push(payload.num)
      });
    })
  }

  const handleNameClick = () => {
    props.setState(prev => ({...prev, view: "set-display-name"}))
  }

  const sendSensorData = (num: number) => {
    const payload:SensorPayload = { displayName, num }
    channelRef.current.send({
      type: 'broadcast',
      event: 'supa',
      payload
    });
    savePayload(payload)
  }

  const renderDataTable = () => {
    const keys = Object.keys(state.history)
    if (keys.length === 0) {
      return null;
    }
    keys.sort()

    const lastValues = keys.map(key => state.history[key][state.history[key].length - 1])
    const currentValue = lastValues.reduce((acc, val) => acc + val, 0) / lastValues.length

    osc.frequency.value = currentValue + 120;
    console.log(osc.frequency.value);

    return (
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">
              Display Name
            </th>
            <th scope="col" className="px-6 py-3">
              Current Value
            </th>
            <th scope="col" className="px-6 py-3">
              History
            </th>
          </tr>
        </thead>
        <tbody>
          {keys.map((key, index) => {
            const values = state.history[key]
            const currentValue = values[values.length - 1]
            return (
              <tr key={`${key}-${index}`} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                <th scope="row" style={{color: getColor(key)}} className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  {key}
                </th>
                <td className="px-6 py-4">
                  {currentValue}
                </td>
                <td className="px-6 py-4" style={{height: 100}}>
                  <Sparkline values={values} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    )
  }

  const renderViz = () => {

    const keys = Object.keys(state.history)
    if (keys.length === 0) {
      return null;
    }
    keys.sort()

    const svgWidth = 400
    const svgHeight = 400

    return (

      <div>
        <svg xmlns="http://www.w3.org/2000/svg" width={svgWidth} height={svgHeight}>
          {keys.map((key, index) => {
            const values = state.history[key]
            const currentValue = values[values.length - 1]
            return (
              <circle cx={svgWidth/2} cy={svgHeight/2} r={currentValue} fill={getColor(key)}/>
            )
          })}
          </svg>
        </div>
    )
  }

  return (
    <>
      <nav className="bg-blue-500 p-4">
        <div className="container mx-auto flex justify-between">
          <h1 className="text-white text-xl">WooWooWoo</h1>
          <div className="text-white mt-1">{ channelStatus }</div>
          <div className="text-white mt-1">
            <button onClick={openStream}>{isStreaming ? "🔌" : "⚡️"}</button>
          </div>
          <div className="text-white font-bold mt-1" onClick={handleNameClick}>{ props.state.displayName }</div>
        </div>
      </nav>



      <div className="container mx-auto mt-4">
        <div className="flex">
          <div className="w-1/2 bg-white p-4">
            {renderDataTable()}
          </div>

          <div className="w-1/2 bg-white p-4 justify-center align-middle" >
            {renderViz()}
          </div>
        </div>

      </div>
   </>
  )
}