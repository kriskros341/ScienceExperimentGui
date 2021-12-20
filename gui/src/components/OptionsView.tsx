
import { LineEdit, View, Text } from "@nodegui/react-nodegui";
import React, { useState, useCallback } from "react";

export type OptionsModel = {
	temperature?: number
}

const OptionsView = () => {
	return (
		<View>
			<Text>Set parameters, alter script path etc.</Text>
			<LineEdit style={"min-height: 2rem"}/>
		</View>
	)
}

export default OptionsView
