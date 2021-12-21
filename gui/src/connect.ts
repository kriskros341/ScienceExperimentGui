import WebSocket from 'ws'
import { useCallback, useMemo, useEffect, useRef, useState } from 'react'
import { exec } from 'child_process'


export const useConnection = (path: string) => {
	const [ conState, setConState	] = useState<boolean>(false);
	const testConnection = () => {
		setConState(true)
	}
	const err = useRef<string>('').current


	return [ conState, testConnection, err ] as [boolean, () => void, string] 
}

export const useStream = (path: string) => {
	const ws = useRef<WebSocket>();
	const messageLog = useRef<string[]>([])
	useEffect(() => {
		ws.current = new WebSocket(path)
		ws.current.on('open', () => console.log('\nopen!\n'))
		ws.current.on('close', () => console.log('\nclosed!\n'))
		ws.current.on('error', (e) => {
			console.log(e)
		})
		ws.current.on('message', (m) => console.log(m))
	}, [])

	const startStream = () => {
		if(!ws.current) {
			console.log('\nnot connected yet!\n')
			return () => {}
		}
		ws.current!.send('start')
		return () => ws.current!.close()
	}
	return [messageLog.current, startStream] as [string[], () => () => void];
}


export default useConnection
