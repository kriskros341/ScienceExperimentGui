import { Text, Window, View, LineEdit, Button, PlainTextEdit } from "@nodegui/react-nodegui";
import React, {useState, useEffect, memo } from 'react'


interface LogViewInterface {
	streamStart: () => () => void;
	logs: string[];
}

interface LogAreaInterface {
	data: string[];
}


const LogArea: React.FC<{data: string[]}> = ({data}) => {
	useEffect(() => {
		console.log(data)
	}, [ data.length ])
	return (
		<>
			<Text>stdout:</Text>
			<PlainTextEdit
				mouseTracking={true}
				readOnly={true}
				text={data.join("\n")}
				style={"min-height: 400"}
			/>
		</>
	)
}

const MemorizedLogArea = memo(LogArea)
const LogView: React.FC<LogViewInterface> = ({logs, streamStart}) => {
	const [ newEntries, setNewEntries ] = useState<string[]>([])
	const [ showNewEntries, setShowNewEntries ] = useState<boolean>(true)
	const toggleNewEntries = () => {
		setShowNewEntries(v => !v)
		setNewEntries(logs)
	}
	useEffect(() => {
		if(showNewEntries) {
			setNewEntries([...logs])
		}
	}, [logs.length])
	useEffect(() => {
		const cleanup = streamStart()
		return () => cleanup()
	}, [])
	return (
		<View style={""}>
			<View style={""}>
				<MemorizedLogArea 
					data={newEntries}
				/>
			</View>
		</View>
	)
}


export default LogView
