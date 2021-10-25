import { spawn } from 'child_process'
import { pipeline, Writable, Readable } from 'stream'
import {useState, useRef, useEffect, useCallback} from 'react'


export const useStream = (
	sshTarget: string,
	command: string
) => { 
	const [, rerenderer] = useState(0)                                            
  const rerender = () => rerenderer(v => ++v)                                             
  const deviceLog = useRef<string[]>([])
	const handleStream = useCallback(() => {
		async function HandleStream() {                             
			const stdOutStream = await establishConnection(sshTarget, [command])                   
      stdOutStream.on('data', data => {                                         
	      const message = data.toString()                                         
        deviceLog.current.push(message)                                         
				console.log(deviceLog.current)                                          
				rerender()
			})
			return () => stdOutStream.destroy()
		}
		const endStream = (async () => {
			return await HandleStream()
		})()
		// the async code doesn't leave async functions
		return function destroy() {
			(async () => {
				(await endStream)()
			})()
		}
	}, [])
	return [deviceLog.current, handleStream] as [string[], () => () => void]                                                          
}


export const useConnection = (sshTarget: string) => {
	const [ isConnected, setConnected ] = useState<boolean>(false)
	const testPassedCallback = useCallback(() => {
		setConnected(true)
	}, [])
	const testConnection = useCallback(() => {
		if(sshTarget) {
			sshProbe(sshTarget, testPassedCallback)
		}
	}, [])
	return [isConnected, testConnection] as [boolean, () => void]
}


const sshProbe = (
	sshTarget: string,
	establishedCallback: () => void
) => {
	const testMessage = "echo hello world"
	async function connection() {
		const childProcess = spawn('ssh', [sshTarget, testMessage])
		childProcess.stderr.on('data', (data) => {
			console.log("ERROR", data.toString())
		})
		childProcess.stdout.on("data", (d) => {
			const data = d.toString()
			if(data.includes("hello world")) {
				console.log("connected successfully")
				establishedCallback()
			} 
		})
	}
	connection()
}

async function establishConnection(
	sshTarget: string,
	commands: string[]
) {
	const testMessage = "echo hello world"
	async function connection() {
		const childProcess = spawn('ssh', [sshTarget, ...commands])
		childProcess.on('close', () => {
			console.log("connection closed")
		})
		childProcess.on("message", (d) => console.log(d))
		childProcess.stderr.on('data', (data) => {
			console.log("ERROR", data.toString())
		})
		return childProcess.stdout
		
	}
	return connection() as Promise<Readable>
	
}

export default useStream
