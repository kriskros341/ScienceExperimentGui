import WebSocket from 'ws'
import { useCallback, useMemo, useEffect, useRef, useState } from 'react'
import { exec } from 'child_process'

export const useConnection = (path: string) => {
	const [ conState, setConState ] = useState<boolean>(false)
	const ws = useMemo<WebSocket>(new WebSocket("ws://"+path+":8080"), [])
	const dataRef = useRef<string[]>([]);
	const errRef = useRef<string>('')
	const testConnection = () => {
		ws!.send('check')
	}
	const start = () => {
		ws.send('start')
		return () => {
			dataRef.current = [];
			setConState(false);
			errRef.current = '';
		}
	}
	useEffect(() => {
		ws.on('message', (m: string) => {
			if(m == 'Ok.') {
				setConState(true)
			}
			if(m == 'Already running!') {
				setConState(false)
				errRef.current = m
			}
			console.log(m)
		})
		ws.on('error', (e) => {
			errRef.current = "${e.name} ${e.message}"
			setConState(false)
		})
		ws.on('close', () => {
			setConState(false)
		})
	}, [])

	return [ conState, testConnection, dataRef.current, start, errRef.current ] as [boolean, () => void, string[], () => () => void, string] 
}

export default useConnection
