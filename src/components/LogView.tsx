import { Text, Window, View, LineEdit, Button, PlainTextEdit } from "@nodegui/react-nodegui";
import React, {useState, useEffect, useCallback, memo} from 'react'


interface LogViewInterface {
	streamStart: () => () => void;
	logs: string[];
}

interface LogAreaInterface {
	data: string[];
}


const LogArea: React.FC<{data: string[]}> = ({data}) => {
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
		<View style={"flex: 1; flex-direction: row"}>
			<View style={"flex: 3; padding-right: 4"}>
				<MemorizedLogArea 
					data={newEntries}
				/>
			</View>
			<View style={"flex: 1; padding-left: 4"}>
				<Text>Options:</Text>
				<Button
					on={{clicked: () => {
						toggleNewEntries()
					}}}
				>
					{showNewEntries ? "HoldRefreshes" : "ReasumeRefreshes"}
				</Button>
			</View>
		</View>
	)
}


export default LogView
