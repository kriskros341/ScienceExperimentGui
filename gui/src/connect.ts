import { spawn } from 'child_process'
import { pipeline, Writable, Readable } from 'stream'
import {useState, useRef, useEffect, useCallback} from 'react'
import {NodeSSH} from 'node-ssh'

enum errNo {
	YetToConnect = -1,
	Ok = 0,
	Problem,
}

type error = {
	code: errNo,
	message: string,
}


export const useStream__old = (
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
			deviceLog.current = []
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

type connectionModel = [
	boolean,
	() => void,
	error
]



export const useConnection = (sshTarget: string) => {
	console.log(sshTarget)
	const [ error, setError ] = useState<error>()
	const [ isConnected, setConnected ] = useState<boolean>(false)
	const testPassedCallback = useCallback(() => {
		setConnected(true)
	}, [])
	const setErrorAfterRetries = useCallback(
		(e: error ) => {
			console.log("connection killed")
			setError(e)
		}, []
	)
	const testConnection = useCallback(() => {
		setError({code: 0, message: ""})
		if(sshTarget) {
			sshProbe(
				sshTarget, 
				testPassedCallback,
				setErrorAfterRetries
			)
		}
	}, [])
	return [isConnected, testConnection, error] as connectionModel
}



const sshProbe = (
	sshTarget: string,
	establishedCallback: () => void,
	onErrorCallback?: (errData: error) => void
) => {
	console.log(sshTarget)
	const testMessage = "echo hello world"
	async function connection() {
		console.log(sshTarget)
		const childProcess = spawn('ssh', [sshTarget, testMessage])
		childProcess.stderr.on('data', (data) => {
			const errData = {code: 1, message: data.toString()}
			onErrorCallback && onErrorCallback(errData)
			childProcess.kill()
		})
		childProcess.once("exit", () => console.log("exit!"))
		childProcess.stdout.on("data", (d) => {
			const data = d.toString()
			console.log(data)
			if(data.includes("hello world")) {
				console.log("connected successfully")
				establishedCallback()
			}
			childProcess.kill()
		})
	}
	connection()
}

async function establishConnection(
	sshTarget: string,
	commands: string[]
) {
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

export default useStream__old
