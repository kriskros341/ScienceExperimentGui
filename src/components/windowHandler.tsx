import { Window, View, LineEdit, Button, ComboBox, Text } from "@nodegui/react-nodegui";
import React, { useState, useEffect, useRef, memo, useMemo } from "react";
import {useConnection} from '../connect'
import defaults from './defaults'
import ConnectionProvider from './ConnectionHandler'
import * as fs from 'fs'
import os from 'os'

interface ConnectionComponent {
	setIpAddress: (s: string) => void
	establishConnection: () => void
	currentIpAddress: string | undefined
	err: string | null
}


const ConnectionForm: React.FC<ConnectionComponent> = (
	{ setIpAddress, establishConnection, currentIpAddress, err }
) => {
	const [ isConnecting, setConnecting ] = useState<boolean>(false)
	useEffect(() => {
		if(typeof err == 'string' && isConnecting == true) {
			setConnecting(false)
		}
	}, [err])
	const connectBtnHandler = {
		clicked: (e: any) => {
			if(!isConnecting) {
				setConnecting(v => !v)
				establishConnection()	
			}
		},
	}
	const ipChangeHandler = {
		textChanged: (e: any) => {
			setIpAddress(e)
		}
	}
	return (
		<View 
			style={containerStyle}
			id={"container"}
		>
			<View style={'flex: 0; flex-direction: row;'}>
				<LineEdit 
					style={'flex: 2rem; width: 128px;'}
					text={"root"}
				/>
				<Text>@</Text>
				<LineEdit
					style={'flex: 100%'}
					on={ipChangeHandler}
					enabled={!isConnecting}
					text={currentIpAddress}
				/>
				<Text>:</Text>
				<LineEdit
					style={'flex: 2rem; width: 64px;'}
					text={"22"}
				/>
			</View>
			<ComboBox items={[{text: 'a'}, {text: 'b'}]}>
			</ComboBox>
			<Button 
				on={connectBtnHandler}
				id={"connectBtn"}
			>
				{isConnecting ? "Connecting" : "Connect"} 
			</Button>
			{err && (
				<Text>{err}</Text>
			)}
		</View>
	)
}

type OptionsModel = {
	temperature?: number
}


const WindowHandler: React.FC<{}> = ({}) => {
	const [targetIp, setTargetIp] = useState<string>(defaults.ipAddress)
	// replace PiInterface with integrated interface 
	const sshString = `${defaults.remoteUser}@${targetIp}`
	const [targetProbeResponse, reprobe, err] = useConnection(sshString)
	const establishConnection = () => {
		reprobe()
	}
	if(targetProbeResponse) {
		return(
			<Window
				size={{width: 600, height: 600}}
			>
				<ConnectionProvider 
					ipAddress={targetIp || defaults.ipAddress}
				/>
			</Window>
		)
	}
	return (
		<Window
			size={{width: 400, height: 200}}
			windowTitle="GOLF"
			styleSheet={containerStyle}
		>
			<ConnectionForm 
				establishConnection={establishConnection}
				setIpAddress={(ip: string) => setTargetIp(ip)}
				currentIpAddress={targetIp}
				err={err}
			/>
		</Window>
		)
}

const containerStyle = `
	#container {
		padding: 16px;
	}
	#connectBtn {
		margin-top: 4px;
		min-height: 2em;
	}
	#connectBtn:hover {
		background-color: yellow;
	}
`;

export default WindowHandler
