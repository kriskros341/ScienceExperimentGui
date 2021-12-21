import WebSocket from 'ws'
import { useCallback, useMemo, useEffect, useRef, useState } from 'react'
import http from 'http'
import axios from 'axios'

export const useConnection = (path: string) => {
	const [, refresher] = useState<boolean>(false)
	const refresh = () => refresher(v => !v)
	const [ conState, setConState	] = useState<boolean>(false);
	const err = useRef<string>(' ') 
	//CHANGING FROM AN EMPTY STRING CRASHES AFTER RERENDER ?!?!?!
	const testConnection = () => {
		axios.get('http://'+path+":8080/?check")
			.then(d => {
				if(d.data == 'Ok') {
					setConState(true)
					err.current = ''
				} else if (d.data == 'In use') {
					setConState(false)
					err.current = 'in use'
				}
			}).catch((e) => {
				setConState(false)
				err.current = e.code
				refresh()
			})	}
	return [ conState, testConnection, err.current ] as [boolean, () => void, string] 
}

export const useStream = (path: string) => {
	const [, refresher] = useState<boolean>(false)
	const refresh = () => refresher(v => !v)
	const [ isRunning, setRunning ] = useState<boolean>(false)
	const ws = useRef<WebSocket>();
	const messageLog = useRef<string[]>([])
	useEffect(() => {
		ws.current = new WebSocket(path)
		ws.current.on('open', () => console.log('\nopen!\n'))
		ws.current.on('close', () => console.log('\nclosed!\n'))
		ws.current.on('error', (e) => {
			console.log(e)
			setRunning(false)
		})
		ws.current.on('message', (m) => {
			const str = m.toString()
			if(str == 'Ok.') {
				setRunning(true)
				return;
			}
			if(str == 'End.') {
				setRunning(false)
				return;
			}
			messageLog.current.push(str)
			refresh()
		})
	}, [])

	const startStream = () => {
		if(ws.current && !isRunning) {
			ws.current!.send('start')
		}
		return () => {
			messageLog.current = []
		}
	}
	return [messageLog.current, startStream] as [string[], () => () => void];
}


export default useConnection
