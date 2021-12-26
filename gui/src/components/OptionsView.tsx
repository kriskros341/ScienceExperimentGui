
import { LineEdit, View, Text, useEventHandler, ScrollArea, ComboBox, CheckBox } from "@nodegui/react-nodegui";
import React, { useMemo, memo, useState, useCallback, useRef, useEffect } from "react";
import { QLineEdit, QLineEditSignals, QScrollAreaSignals, QWheelEvent, QComboBoxSignals, WidgetEventTypes } from '@nodegui/nodegui'

import { OptionsModel, Measures, defaults } from './ConnectionHandler'

//c - chłodzenie; h - grzanie; cv - kalibracja; t - pomiar długości; m - pełna procedura

const MIN = 30
const MAX = 100


const PleaseWork = memo( (HandleProcedure: any) => 
	<ComboBox
		on={HandleProcedure.HandleProcedure}
		style={`width: '99%'`}
		items={[
			{text: 'pełna procedura'},
			{text: 'pomiar długości'}, 
			{text: 'kalibracja'}, 
			{text: 'grzanie'}, 
			{text: 'chłodzenie'}, 
		]} />
)


const OptionsView: React.FC<{
	options: OptionsModel,
	setOptionsHandler: (val: Partial<OptionsModel>) => void
}> = ({options, setOptionsHandler}) => {
	const HandleProcedure = useEventHandler<QComboBoxSignals>({
		currentIndexChanged: (e: number) => {
			if(e != -1) {
				setOptionsHandler({measurement: Measures[e]})
			}
		}
	}, [])

	const HandleScriptname = useEventHandler<QLineEditSignals>({
		textChanged: (text: string) => {
			setOptionsHandler({scriptname: text})
		},
		editingFinished: () => {
			if(options.scriptname == '') {
				setOptionsHandler({scriptname: defaults.scriptname})
			}
		},
	}, [options])
	const HandleTemperature = useEventHandler<QLineEditSignals>({
		textChanged: (text: string) => {
			const numericValue = parseInt(text)
			setOptionsHandler({temperature: numericValue})
		},
		editingFinished: () => {
			console.log(options.temperature)
			if(options.temperature < 30) {
				setOptionsHandler({temperature: defaults.temperature})
			}
			if(options.temperature > 100) {
				setOptionsHandler({temperature: defaults.temperature})
			}
		},
		[WidgetEventTypes.Wheel]: (e: any) => {
			const wheel = new QWheelEvent(e)
			const change = options.temperature + wheel.angleDelta().y / 120
			if(change < MIN || change > MAX) {
				return;
			}
			setOptionsHandler({temperature: change})
		} 
	}, [options])
	return (
		<>
			<View style={InputStyle}>
				<View style={`
						flex: 3;
						height: '100%'; 
						justify-content: 'space-between';
					`}>
					<Text>nazwa skryptu</Text>
					<LineEdit 
						on={HandleScriptname}
						text={options.scriptname}
					/>
				</View>
				<View style={`
						flex: 3;
						height: '100%'; 
						justify-content: 'space-between';
						margin-left: 16px;
					`}>
					<Text>Procedura</Text>
					<PleaseWork 
						HandleProcedure={HandleProcedure}
					/>
				</View>
				<View style={`
						flex: 3;
						height: '100%'; 
						justify-content: 'space-between';
						margin-left: 16px;
					`}>
					<Text>Temperatura docelowa</Text>
					<LineEdit 
						on={HandleTemperature} 
						text={
							isNaN(options.temperature) ? '' : options.temperature.toString()
						} 
					/>
				</View>
			</View>
			<View style={ViewStyle}>
				<Text style={`width: 164px;`}>
					python3 {options.scriptname} {options.measurement} {options.temperature}
				</Text>
			</View>
		</>
	)
}

const InputStyle = `
	flex-direction: 'row';
	align-items: 'center';
	justify-content: 'space-between';
	margin-top: '16px';
	margin-left: 0;
`


const ViewStyle = `
	margin-top: 16px;
	font-size: 32px;
	height: 40px;
	justify-content: 'center'; 
	align-items: 'center';
`


export default OptionsView
