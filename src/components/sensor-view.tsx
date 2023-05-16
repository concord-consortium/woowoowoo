
import React, { useEffect} from "react"
import { useSerial } from "../useSerial"
import {produce} from "immer"
import { ComponentProps } from "./app"
import { createClient } from "@supabase/supabase-js"

// create a supabase client that listens to channel "woowoowoo"

const url = "https://ubtydghcxtctomddmcjl.supabase.co"
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVidHlkZ2hjeHRjdG9tZGRtY2psIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODQyNDcwMTUsImV4cCI6MTk5OTgyMzAxNX0.5U8EqTtGyGGyfyn0pW0DCrsTcSJ9vOOnBdVc9kiXRLk"

const supa = createClient(url, key);
const channel = supa.channel("woowoowoo");

type ChannelStatus = "SUBSCRIBED" | "TIMED_OUT" | "CLOSED" | "CHANNEL_ERROR"

type SensorPayload = {
  num: number
  displayName: string
}

export const SensorView = (props: ComponentProps) => {
  const {state, setState} = props
  const displayName  = state.displayName!;
  const [channelStatus, setChannelStatus] = React.useState<ChannelStatus>("CLOSED");

  const { isStreaming, val, openStream } = useSerial();

  useEffect(() => {
    channel
    .on('broadcast', { event: 'supa' }, (message) => {
      const payload = message.payload as SensorPayload
      savePayload(payload)
    })
    .subscribe((status) => {
      setChannelStatus(status)
    })
  }, [])

  const savePayload = (payload: SensorPayload) => {
    setState(prev => {
      return produce(prev, draft =>{
        draft.history[payload.displayName] = draft.history[payload.displayName] || []
        draft.history[payload.displayName].push(payload.num)
      });
    })
  }

  const handleNameClick = () => {
    props.setState(prev => ({...prev, view: "set-display-name"}))
  }

  const sendSensorData = () => {

    const payload:SensorPayload = { displayName, num: Math.random() }
    channel.send({
      type: 'broadcast',
      event: 'supa',
      payload
    });
    savePayload(payload)
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
            <div>{ channelStatus }</div>
            <div className="text-gray-700"><pre>{ JSON.stringify(state.history, null, 2) }</pre></div>
            <button onClick={sendSensorData}>Send Sensor Data</button>
          </div>
          <div className="w-1/2 bg-white p-4">
            <h2 className="text-gray-800 text-lg font-bold">Visualization</h2>
            <p className="text-gray-700">Content goes here...</p>
          </div>
        </div>
        <div>serial<br/>
          <button onClick={openStream}>{isStreaming ? "Stop" : "Start"}</button>
          <div>{val}</div>
        </div>
      </div>
   </>
  )
}