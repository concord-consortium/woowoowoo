import { useState, useRef } from 'react'

const S = window.navigator.serial;
const TE = new TextEncoderStream();
const TD = new TextDecoderStream();

export function useSerial() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [val, setVal] = useState(0);
  const deviceInfo = useRef<any>(null);
  const localBuffer = useRef<any>('');
  const writer = useRef<any>(null);
  const reader = useRef<any>(null);
  const port = useRef<any>(null);

  S.addEventListener('connect', (e) => setIsConnected(true));
  S.addEventListener('disconnect', (e) => setIsConnected(false));

  const requestAndSetPort = async () => {
    try {
      port.current = await S.requestPort();
      deviceInfo.current = await port.current.getInfo();
    } catch (error) {
      console.error("| error in requestAndSetPort", error)
    }
  };

  const hasPort = () => {
    return port.current !== undefined && port.current.readable;
  };

  const openPort = async () => {
    await port.current.open({ baudRate: 9600 })
      .catch((e: any) => console.error("| error on open port: ", e));
  };

  const setUpWriter = () => {
    TE.readable.pipeTo(port.current.writable);
    writer.current = TE.writable.getWriter();
  };

  const setUpReader = () => {
    port.current.readable.pipeTo(TD.writable);
    reader.current = TD.readable.getReader();
  };

  const handleUtterance = (utterance: string) => {
    localBuffer.current += utterance;
    if (localBuffer.current.includes('\n')) {
      const keyedChunk = localBuffer.current.split('\r\n')[0];
      const num = /(d)(\d+)/.exec(keyedChunk);
      num && setVal(Number(num[2]));
      localBuffer.current = '';
    }
  }

  const openStream = async () => {
    try {
      await requestAndSetPort();
      await openPort();
      if (!hasPort()) return;

      setUpWriter();
      setUpReader();
      setIsStreaming(true);

      while (port.current.readable) {
        const { value, done } = await reader.current.read();
        handleUtterance(value);
        if (done) break;
      }
    }

    catch (error) {
      setIsStreaming(false);
      console.error("error in handleSteram", error)
    }

    finally {
      setIsStreaming(false);
      await port.current.close();
      await reader.current.releaseLock();
      await writer.current.releaseLock();
    }
  };

  return { isStreaming, val, openStream, isConnected };
}
