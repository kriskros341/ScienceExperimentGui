import { Window, View, LineEdit, Button, ComboBox, Text } from "@nodegui/react-nodegui";
import React, { useState, useEffect, useRef, memo, useMemo } from "react";
import defaults from './defaults'
import ConnectionProvider from './ConnectionHandler'


type OptionsModel = {
	temperature?: number
}

export type windowSizeModel = 'small' | 'large'

const windowSizes = {
	'large': {width: 600, height: 600},
	'small': {width: 400, height: 400}
}


const WindowHandler: React.FC<{}> = ({}) => {
	const [ windowSize, setWindowSizeState ] = useState<windowSizeModel>('small')
	const isWindowSmall = windowSize === 'small'
	const changeWindowSizeWithCallback = () => {
		setWindowSizeState(isWindowSmall ? 'large' : 'small')
		return () => setWindowSizeState(isWindowSmall ? 'small' : 'large')
	}
	return (
		<Window
			size={windowSizes[windowSize]}
		>
			<ConnectionProvider
				toggleWindowSize={changeWindowSizeWithCallback}
			/>
		</Window>
	)
}


export default WindowHandler
